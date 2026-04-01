import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
} from 'date-fns';
import CalendarCell from './CalendarCell';
import { colors, fontSize, spacing } from '../constants/theme';
import type { Photo } from '../types';

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Props = {
  year: number;
  month: number;
  photos: Map<string, Photo>;
  onPhotoPress: (date: string) => void;
};

const HORIZONTAL_PADDING = 8;
const CELL_ASPECT_RATIO = 4 / 3; // taller than wide for portrait photos

export default function CalendarGrid({ year, month, photos, onPhotoPress }: Props) {
  const { width } = useWindowDimensions();
  const cellWidth = (width - HORIZONTAL_PADDING * 2) / 7;
  const cellHeight = cellWidth * CELL_ASPECT_RATIO;

  const currentDate = new Date(year, month - 1, 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <View style={styles.container}>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, i) => (
          <Text key={i} style={[styles.weekdayText, { width: cellWidth }]}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return (
            <CalendarCell
              key={dateStr}
              date={date}
              photo={photos.get(dateStr) ?? null}
              isCurrentMonth={isSameMonth(date, currentDate)}
              onPress={onPhotoPress}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    textAlign: 'center',
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
