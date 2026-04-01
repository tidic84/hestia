import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { format, isToday } from 'date-fns';
import { getPhotoUri } from '../services/photo.service';
import { colors, fontSize, borderRadius } from '../constants/theme';
import type { Photo } from '../types';

type Props = {
  date: Date;
  photo: Photo | null;
  isCurrentMonth: boolean;
  onPress: (date: string) => void;
  cellWidth: number;
  cellHeight: number;
};

export default function CalendarCell({ date, photo, isCurrentMonth, onPress, cellWidth, cellHeight }: Props) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayNum = date.getDate();
  const today = isToday(date);

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { width: cellWidth, height: cellHeight },
        !isCurrentMonth && styles.otherMonth,
      ]}
      onPress={() => photo && onPress(dateStr)}
      disabled={!photo}
      activeOpacity={0.7}
    >
      {photo ? (
        <Image
          source={{ uri: getPhotoUri(photo) }}
          style={styles.thumbnail}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.emptyCell, today && styles.todayCell]}>
          <Text
            style={[
              styles.dayText,
              !isCurrentMonth && styles.otherMonthText,
              today && styles.todayText,
            ]}
          >
            {dayNum}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    padding: 2,
  },
  otherMonth: {
    opacity: 0.25,
  },
  thumbnail: {
    flex: 1,
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  emptyCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
  },
  todayCell: {
    backgroundColor: colors.surfaceLight,
  },
  dayText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  otherMonthText: {
    color: colors.textMuted,
  },
  todayText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
