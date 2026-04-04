import { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { getPhotoUri } from '../services/photo.service';
import { colors } from '../constants/theme';
import type { Photo } from '../types';

export const MARKER_SIZE = 48;
const BORDER_WIDTH = 3;
const INNER_SIZE = MARKER_SIZE - BORDER_WIDTH * 2;

type Props = {
  photo: Photo;
  onLoad?: () => void;
};

export default function PhotoMarker({ photo, onLoad }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.ring}>
        <Image
          source={{ uri: getPhotoUri(photo) }}
          style={styles.image}
          contentFit="cover"
          onLoad={onLoad}
        />
      </View>
      <View style={styles.arrow} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: MARKER_SIZE,
    height: MARKER_SIZE + 8,
  },
  ring: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  image: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -1,
  },
});
