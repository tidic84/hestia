import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTabBarVisibility } from '../../src/hooks/useTabBarVisibility';
import { colors } from '../../src/constants/theme';

export default function TabLayout() {
  const { visible } = useTabBarVisibility();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: visible
          ? {
              position: 'absolute',
              backgroundColor: colors.glass,
              borderTopWidth: 0,
              height: 85,
              paddingBottom: 20,
              paddingTop: 8,
              elevation: 0,
            }
          : { display: 'none' },
        tabBarBackground: visible
          ? () => (
              <BlurView
                intensity={40}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Capture',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Progres',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flame" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Carte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
