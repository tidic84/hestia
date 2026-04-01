import { View, Image, StyleSheet } from 'react-native';
import { getPhotoUri } from '../services/photo.service';
import { colors } from '../constants/theme';
import type { Photo } from '../types';

export const MARKER_SIZE = 56;
const BORDER_WIDTH = 4;
const INNER_SIZE = MARKER_SIZE - BORDER_WIDTH * 2;

type Props = {
  photo: Photo;
  onLoad?: () => void;
};

export default function PhotoMarker({ photo, onLoad }: Props) {
  return (
    <View style={styles.ring}>
      <Image
        source={{ uri: getPhotoUri(photo) }}
        style={styles.image}
        resizeMode="cover"
        onLoad={onLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    padding: BORDER_WIDTH,
    backgroundColor: colors.primary,
  },
  image: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
  },
});
