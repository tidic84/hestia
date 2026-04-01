import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import type { CameraCapturedPicture } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import CameraView from '../../src/components/CameraView';
import PhotoPreview from '../../src/components/PhotoPreview';
import ChallengeCard from '../../src/components/ChallengeCard';
import CustomAlert from '../../src/components/CustomAlert';
import { useDatabase } from '../../src/hooks/useDatabase';
import { useTabBarVisibility } from '../../src/hooks/useTabBarVisibility';
import { useAlert } from '../../src/hooks/useAlert';
import { useTodayPhoto } from '../../src/hooks/usePhoto';
import { savePhoto, getPhotoUri } from '../../src/services/photo.service';
import { getTodayChallenge, completeChallenge } from '../../src/services/challenge.service';
import { buildGamificationContext, checkAndUnlockBadges } from '../../src/services/gamification.service';
import { colors, fontSize, spacing, borderRadius } from '../../src/constants/theme';
import type { Challenge } from '../../src/types';

type ScreenState = 'today' | 'camera' | 'preview';

export default function CaptureScreen() {
  const db = useDatabase();
  const { photo, loading, refresh } = useTodayPhoto();
  const { hide: hideTabBar, show: showTabBar } = useTabBarVisibility();
  const { alertProps, showAlert } = useAlert();
  const [permission, requestPermission] = useCameraPermissions();
  const [screenState, setScreenState] = useState<ScreenState>('today');
  const [capturedPicture, setCapturedPicture] = useState<CameraCapturedPicture | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  const refreshAll = useCallback(async () => {
    await refresh();
    const todayChallenge = await getTodayChallenge(db);
    setChallenge(todayChallenge);
    setScreenState('today');
    showTabBar();
  }, [refresh, db, showTabBar]);

  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [refreshAll])
  );

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        showAlert({
          title: 'Permission requise',
          message: "Hestia a besoin d'acceder a votre camera pour capturer vos souvenirs.",
          icon: 'camera-outline',
        });
        return;
      }
    }

    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      await Location.requestForegroundPermissionsAsync();
    }

    hideTabBar();
    setScreenState('camera');
  };

  const handleCapture = (picture: CameraCapturedPicture) => {
    setCapturedPicture(picture);
    setScreenState('preview');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleConfirm = async () => {
    if (!capturedPicture) return;

    try {
      const challengeId = challenge?.completed === 0 ? challenge.id : null;
      await savePhoto(db, capturedPicture, challengeId);

      const hour = new Date().getHours();
      const ctx = await buildGamificationContext(db, hour);
      const newBadges = await checkAndUnlockBadges(db, ctx);

      setCapturedPicture(null);
      showTabBar();
      setScreenState('today');
      await refreshAll();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (newBadges.length > 0) {
        showAlert({
          title: 'Nouveau badge !',
          message: newBadges.map((b) => `${b.name} — ${b.description}`).join('\n'),
          icon: 'trophy',
          iconColor: colors.accent,
        });
      }
    } catch {
      showAlert({
        title: 'Erreur',
        message: "La photo n'a pas pu etre sauvegardee. Reessaye.",
        icon: 'alert-circle-outline',
      });
    }
  };

  const handleRetake = () => {
    setCapturedPicture(null);
    setScreenState('camera');
  };

  const handleCompleteChallenge = async () => {
    await completeChallenge(db);
    const updated = await getTodayChallenge(db);
    setChallenge(updated);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleCameraBack = useCallback(() => {
    showTabBar();
    setCapturedPicture(null);
    setScreenState('today');
  }, [showTabBar]);

  if (screenState === 'camera') {
    return <CameraView onCapture={handleCapture} onBack={handleCameraBack} />;
  }

  if (screenState === 'preview' && capturedPicture) {
    return (
      <PhotoPreview
        uri={capturedPicture.uri}
        onConfirm={handleConfirm}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>Bonjour</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>

        {challenge && (
          <ChallengeCard
            challenge={challenge}
            onComplete={handleCompleteChallenge}
          />
        )}

        {loading ? null : photo ? (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: getPhotoUri(photo) }}
              style={styles.todayPhoto}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={openCamera}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-reverse" size={20} color={colors.text} />
              <Text style={styles.retakeText}>Reprendre</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={openCamera}
            activeOpacity={0.7}
          >
            <View style={styles.captureRing}>
              <View style={styles.captureInner} />
            </View>
            <Text style={styles.captureText}>Prendre la photo du jour</Text>
          </TouchableOpacity>
        )}
      </View>

      <CustomAlert {...alertProps} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.xxl,
    color: colors.text,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: -spacing.sm,
  },
  photoSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  todayPhoto: {
    flex: 1,
    width: '100%',
    borderRadius: borderRadius.lg,
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    marginBottom: 85,
  },
  retakeText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  captureButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  captureRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  captureInner: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: colors.text,
  },
  captureText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '400',
  },
});
