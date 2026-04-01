import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseContext } from '../src/hooks/useDatabase';
import { TabBarVisibilityProvider } from '../src/hooks/useTabBarVisibility';
import { getDatabase } from '../src/db/client';
import { setupNotifications, scheduleNextNotification } from '../src/services/notification.service';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);

  useEffect(() => {
    getDatabase().then(setDb);
  }, []);

  useEffect(() => {
    if (!db) return;
    setupNotifications().then((granted) => {
      if (granted) {
        scheduleNextNotification(db);
      }
    });
  }, [db]);

  if (!db) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>
      <TabBarVisibilityProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="photo/[id]"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="recap"
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="settings"
          options={{ presentation: 'modal' }}
        />
      </Stack>
      <StatusBar style="light" />
      </TabBarVisibilityProvider>
    </DatabaseContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
