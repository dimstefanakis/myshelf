import React, { useEffect, useState, useRef } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapEvent from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { View, Button, TextInput, Text } from "../Themed";
import { supabase } from "@/utils/supabase";
import { useNavigation } from "expo-router";
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

export default function MapViewScreen({ navigation }: any) {
  const nav = useNavigation<any>();
  const mapRef = useRef<MapView>(null);
  const user = useUser();
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    // navigate to addMarker
    nav.navigate("AddMarker", {
      latitude,
      longitude,
    });
  };

  const handleAutoComplete = (data: Geometry) => {
    const { lat, lng } = data.location;
    // navigate to addMarker
    nav.navigate("AddMarker", {
      latitude: lat,
      longitude: lng,
    });
  };

  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      fetchMarkers();
    });

    return unsubscribe;
  }, [nav]);

  const handleEditMarker = () => {
    // navigate to editMarker
    nav.navigate("EditMarkers");
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
      `,
      )
      .eq("user_book.user", user?.user?.id || "");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (data) {
      const markersData = data.map((marker) => {
        let type, latitude, longitude;

        if (
          marker.author_nationality_lat !== null &&
          marker.author_nationality_long !== null
        ) {
          type = "Author National";
          latitude = marker.author_nationality_lat;
          longitude = marker.author_nationality_long;
        } else if (
          marker.country_published_lat !== null &&
          marker.country_published_long !== null
        ) {
          type = "Country Published";
          latitude = marker.country_published_lat;
          longitude = marker.country_published_long;
        } else {
          type = "Setting Origin";
          latitude = marker.setting_origin_lat;
          longitude = marker.setting_origin_long;
        }

        return {
          type,
          latitude,
          longitude,
          key: marker.id.toString(),
          title: marker.user_book?.book?.title,
        };
      });

      setMarkers(markersData.map((marker: any) => marker));
    }
  };

  useEffect(() => {
    if (user) fetchMarkers();
  }, [user]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditMarker()}
      >
        <Text style={styles.editButtonText}>Edit Markers</Text>
      </TouchableOpacity>
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            if (details?.geometry) {
              mapRef?.current?.animateToRegion({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
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
      <MapView
        onRegionChangeComplete={(region, { isGesture }) => {}}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    position: "absolute",
    top: 20,
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
