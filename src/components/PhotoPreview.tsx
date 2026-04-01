import { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, BackHandler } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, borderRadius } from '../constants/theme';

type Props = {
  uri: string;
  onConfirm: () => void;
  onRetake: () => void;
};

export default function PhotoPreview({ uri, onConfirm, onRetake }: Props) {
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onRetake();
      return true;
    });
    return () => sub.remove();
  }, [onRetake]);
  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} contentFit="cover" />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.retakeButton} onPress={onRetake} activeOpacity={0.7}>
          <Ionicons name="close" size={28} color={colors.text} />
          <Text style={styles.buttonText}>Reprendre</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} activeOpacity={0.7}>
          <Ionicons name="checkmark" size={28} color={colors.text} />
          <Text style={styles.buttonText}>Valider</Text>
        </TouchableOpacity>
      </View>
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
  actions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingHorizontal: spacing.xl,
  },
  retakeButton: {
    alignItems: 'center',
    backgroundColor: colors.glass,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
