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
        author_nationality_lat,
        author_nationality_long,
        country_published_lat,
        country_published_long,
        user_book: users_books(*, book: books(*))
      `)
      .eq("user_book.user", user.id);

    if (error) {
      console.error("Error fetching markers:", error);
      return;
    }

    if (data) {
      const markersData: MarkerType[] = [];
      
      data.forEach((item) => {
        // Setting origin markers
        if (item.setting_origin_lat && item.setting_origin_long) {
          markersData.push({
            type: "Setting Origin",
            latitude: parseFloat(item.setting_origin_lat),
            longitude: parseFloat(item.setting_origin_long),
            key: `setting-${item.id}`,
            title: `Setting: ${item.user_book?.book?.title}`,
          });
        }
        
        // Author nationality markers
        if (item.author_nationality_lat && item.author_nationality_long) {
          markersData.push({
            type: "Author Origin",
            latitude: parseFloat(item.author_nationality_lat),
            longitude: parseFloat(item.author_nationality_long),
            key: `author-${item.id}`,
            title: `Author: ${item.user_book?.book?.title}`,
          });
        }
        
        // Publication country markers
        if (item.country_published_lat && item.country_published_long) {
          markersData.push({
            type: "Published In",
            latitude: parseFloat(item.country_published_lat),
            longitude: parseFloat(item.country_published_long),
            key: `published-${item.id}`,
            title: `Published: ${item.user_book?.book?.title}`,
          });
        }
      });

      // @ts-ignore
      setMarkers(markersData);
    }
  };

  useEffect(() => {
    fetchMarkers();
  }, [user]);

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
      backgroundColor="$orange2"
      borderRadius="$2"
      borderColor="$orange6"
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
                  latitude: marker.latitude,
                  longitude: marker.longitude,
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