import React, { useEffect, useState } from "react";
import { router, useNavigation } from "expo-router";
import { YStack, XStack, Text } from "tamagui";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, Platform } from "react-native";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";

interface MarkerType {
  type: string;
  latitude: number;
  longitude: number;
  key: string;
  title?: string;
}

const MapBlock = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  const fetchMarkers = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("book_origins")
      .select(`
        id,
        setting_origin_lat,
        setting_origin_long,
        user_book: users_books(*, book: books(*))
      `)
      .eq("user_book.user", user.id);

    if (error) {
      console.error("Error fetching markers:", error);
      return;
    }

    if (data) {
      const markersData = data
        .map((marker) => {
          if (marker.setting_origin_lat && marker.setting_origin_long) {
            return {
              type: "Setting Origin",
              latitude: marker.setting_origin_lat,
              longitude: marker.setting_origin_long,
              key: marker.id.toString(),
              title: marker.user_book?.book?.title,
            };
          }
          return null;
        })
        .filter((marker) => marker !== null);

      // @ts-ignore
      // TODO: fix this
      setMarkers(markersData);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [user]);

  console.log(markers)

  const mapRegion = {
    latitude: markers[markers.length - 1]?.latitude || 37.7749,
    longitude: markers[markers.length - 1]?.longitude || -122.4194,
    latitudeDelta: 10,
    longitudeDelta: 10,
  };

  return (
    <YStack
      width="100%"
      height={200}
      backgroundColor="$background"
      borderRadius="$2"
      borderColor="$borderColor"
      borderWidth={1}
      overflow="hidden"
      onPress={() => router.push('/map')}
    >
      {markers.length > 0 ? (
        Platform.OS === "android" ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            region={mapRegion}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.key}
                coordinate={{
                  latitude: parseFloat(marker.latitude.toString()),
                  longitude: parseFloat(marker.longitude.toString()),
                }}
                title={marker.title}
              />
            ))}
          </MapView>
        ) : (
          <MapView
            style={styles.map}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
            region={mapRegion}
            showsUserLocation={false}
            showsPointsOfInterest={true}
            showsCompass={false}
            showsScale={false}
            showsBuildings={true}
            showsTraffic={false}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.key}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={marker.title}
              />
            ))}
          </MapView>
        )
      ) : (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
          <Text textAlign="center" color="$orange11">
            Add books to your library to see where your reading takes you!
          </Text>
        </YStack>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    flex: 1,
  },
});

export default MapBlock;