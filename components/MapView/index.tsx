import "react-native-get-random-values";
import React, { useEffect, useState, useRef } from "react";
import { router, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { View, Button, Text, XStack } from "tamagui";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";

// Define an interface for your markers
interface MarkerType {
  type: string;
  latitude: number;
  longitude: number;
  key: string;
  title?: string;
}

type Geometry = {
  location: {
    lat: number;
    lng: number;
  };
};

export default function MapViewScreen({ navigation, sortCategory }: any) {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const user = useUser();
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    router.push({
      pathname: "/addMarker",
      params: { latitude, longitude }
    });
  };

  const handleAutoComplete = (data: Geometry) => {
    const { lat, lng } = data.location;
    router.push({
      pathname: "/addMarker",
      params: { latitude: lat, longitude: lng }
    });
  };

  useEffect(() => {
    fetchMarkers();
  }, []);

  const handleEditMarker = () => {
    router.push("/editMarkers");
  };

  const fetchMarkers = async () => {
    if (!user.user?.id) {
      return;
    }
    let { data, error } = await supabase
      .from("book_origins")
      .select(
        `
        id,
        setting_origin_lat,
        setting_origin_long,
        author_nationality_lat,
        author_nationality_long,
        country_published_lat,
        country_published_long,
        user_book: users_books(*, book: books(*) )
      `
      )
      .eq("user_book.user", user?.user?.id || "");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (data) {
      const markersData = data
        .map((marker) => {
          let type, latitude, longitude;

          if (
            sortCategory === "author_nationality" &&
            marker.author_nationality_lat &&
            marker.author_nationality_long
          ) {
            type = "Author National";
            latitude = marker.author_nationality_lat;
            longitude = marker.author_nationality_long;
          } else if (
            sortCategory === "country_published" &&
            marker.country_published_lat &&
            marker.country_published_long
          ) {
            type = "Country Published";
            latitude = marker.country_published_lat;
            longitude = marker.country_published_long;
          } else if (
            sortCategory === "setting_origin" &&
            marker.setting_origin_lat &&
            marker.setting_origin_long
          ) {
            type = "Setting Origin";
            latitude = marker.setting_origin_lat;
            longitude = marker.setting_origin_long;
          } else if (!sortCategory) {
            type =
              marker.setting_origin_lat && marker.setting_origin_long
                ? "Setting Origin"
                : marker.author_nationality_lat &&
                  marker.author_nationality_long
                  ? "Author National"
                  : marker.country_published_lat && marker.country_published_long
                    ? "Country Published"
                    : null;
            latitude =
              marker.setting_origin_lat ||
              marker.author_nationality_lat ||
              marker.country_published_lat;
            longitude =
              marker.setting_origin_long ||
              marker.author_nationality_long ||
              marker.country_published_long;
          }

          return type
            ? {
              type,
              latitude,
              longitude,
              key: marker.id.toString(),
              title: marker.user_book?.book?.title,
            }
            : null;
        })
        .filter((marker) => marker !== null);

      // @ts-ignore
      // TODO: fix this
      setMarkers(markersData);
    }
  };

  return (
    <View style={styles.container}>
      <XStack
        space="$2"
        style={{
          position: "absolute",
          top: 80,
          width: "100%",
          height: 50,
          zIndex: 100,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Button
          borderRadius={100}
          w={50}
          h={50}
          icon={<ChevronLeft size={24} color="$gray10" />}
          onPress={() => router.back()}
        />
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <GooglePlacesAutocomplete
            placeholder="Search"
            fetchDetails
            textInputProps={{
              placeholderTextColor: "black",
            }}
            styles={{
              container: {
                width: "100%",
                height: "100%",
              },
              textInput: {
                color: "black",
                height: 50,
              },
            }}
            onPress={(data, details = null) => {
              // 'details' is provided when fetchDetails = true
              if (details?.geometry) {
                mapRef?.current?.animateToRegion({
                  latitude: details.geometry.location.lat || 0,
                  longitude: details.geometry.location.lng || 0,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1,
                });
                setTimeout(() => {
                  handleAutoComplete(details.geometry);
                }, 1000);
              }
            }}
            query={{
              key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
              language: "en",
            }}
          />
        </View>
      </XStack>
      {markers.length > 0 && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditMarker()}
        >
          <Text style={styles.editButtonText}>Edit Markers</Text>
        </TouchableOpacity>
      )}
      {Platform.OS === "android" ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={(region, { isGesture }) => { }}
          ref={mapRef}
          style={styles.map}
          onPress={(e: any) => handleMapPress(e)}
        >
          {markers.map((marker) => {
            console.log(marker);
            return (
              <Marker
                key={marker.key}
                coordinate={{
                  latitude: marker.latitude || 0,
                  longitude: marker.longitude || 0,
                }}
                title={marker.title}
              />
            );
          })}
        </MapView>
      ) : (
        <MapView
          onRegionChangeComplete={(region, { isGesture }) => { }}
          ref={mapRef}
          style={styles.map}
          onPress={(e: any) => handleMapPress(e)}
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  searchContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    zIndex: 10,
    // height: 500,
    backgroundColor: "transparent",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  editButton: {
    position: "absolute",
    zIndex: 10,
    right: 20,
    bottom: 40,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 4,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
  },
});
