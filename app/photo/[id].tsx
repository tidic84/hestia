import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useDatabase } from '../../src/hooks/useDatabase';
import { getPhotoByDate } from '../../src/db/queries/photos';
import { getPhotoUri } from '../../src/services/photo.service';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import type { Photo } from '../../src/types';

export default function PhotoViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useDatabase();
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (id) {
      // id is the date (YYYY-MM-DD)
      getPhotoByDate(db, id).then(setPhoto);
    }
  }, [db, id]);

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Photo introuvable</Text>
      </View>
    );
  }

  const dateLabel = format(parseISO(photo.date), 'EEEE d MMMM yyyy', { locale: fr });
  const timeLabel = format(parseISO(photo.created_at), 'HH:mm');

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: getPhotoUri(photo) }}
        style={styles.image}
        contentFit="contain"
      />
      <SafeAreaView style={styles.overlay} edges={['top']}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
      </SafeAreaView>
      <SafeAreaView style={styles.infoOverlay} edges={['bottom']}>
        <Text style={styles.dateText}>{dateLabel}</Text>
        <Text style={styles.timeText}>{timeLabel}</Text>
        {photo.latitude && photo.longitude && (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={colors.textSecondary} />
            <Text style={styles.locationText}>
              {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(28, 24, 22, 0.6)',
  },
  dateText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: '400',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  text: {
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
    marginTop: 100,
  },
});
