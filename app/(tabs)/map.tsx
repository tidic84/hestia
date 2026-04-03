import { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import PhotoMarker from '../../src/components/PhotoMarker';
import { useMapPhotos } from '../../src/hooks/useMapPhotos';
import { colors, fontSize, spacing } from '../../src/constants/theme';

export default function MapScreen() {
  const { photos, loading, refresh } = useMapPhotos();
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const goToMyLocation = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    } catch {
      // Location unavailable
    }
  };

  if (!loading && photos.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Hestia Map</Text>
        <Text style={styles.emptyText}>
          Prends des photos avec la geolocalisation activee pour les voir apparaitre sur la carte.
        </Text>
      </SafeAreaView>
    );
  }

  const initialRegion = photos.length > 0
    ? {
        latitude: photos[0].latitude!,
        longitude: photos[0].longitude!,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsPointsOfInterest={false}
        showsBuildings={false}
        showsTraffic={false}
        showsIndoors={false}
        customMapStyle={mapDarkStyle}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && photos.map((photo) => (
          <Marker
            key={photo.id}
            coordinate={{
              latitude: photo.latitude!,
              longitude: photo.longitude!,
            }}
            onPress={() => router.push(`/photo/${photo.date}`)}
          >
            <PhotoMarker photo={photo} />
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.locateButton}
        onPress={goToMyLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const mapDarkStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1c1816' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#85736e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1c1816' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2420' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#34302d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f2218' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1e2a15' }, { visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  locateButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '300',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
