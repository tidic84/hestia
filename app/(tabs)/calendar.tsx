import { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { format, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import CalendarGrid from '../../src/components/CalendarGrid';
import { useCalendarPhotos } from '../../src/hooks/useCalendarPhotos';
import { colors, fontSize, spacing, borderRadius } from '../../src/constants/theme';

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const { photos, refresh } = useCalendarPhotos(year, month);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const goToPrevMonth = () => setCurrentDate((d) => subMonths(d, 1));
  const goToNextMonth = () => setCurrentDate((d) => addMonths(d, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handlePhotoPress = (date: string) => {
    router.push(`/photo/${date}`);
  };

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: fr });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthTitle}>{monthLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <CalendarGrid
        year={year}
        month={month}
        photos={photos}
        onPhotoPress={handlePhotoPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
  },
  monthTitle: {
    fontSize: fontSize.xl,
    fontWeight: '300',
    color: colors.text,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
});
