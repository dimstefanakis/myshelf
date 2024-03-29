import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../utils/supabase";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";

interface UserBook {
  book: {
    id: any | number;
    title: any;
  };
}

type MarkerType = {
  id: any|null;
  marker_type: string|null;
  book_title: string|null;
  country: string|null;
  setting_origin_lat: number | null;
  setting_origin_long: number | null;
  author_nationality_lat: number | null;
  author_nationality_long: number | null;
  country_published_lat: number | null;
  country_published_long: number | null;
};

const EditMarkers = () => {
  const { user } = useUser();
  const { books } = useUserBooksStore();
  const [markers, setMarkers] = useState<MarkerType[]>([]);

  const fetchCountryName = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    return data.countryName || "Unknown";
  };

  const removeMarker = async (id: number) => {
    const { error } = await supabase
      .from("book_origins")
      .delete()
      .match({ id });

    if (error) {
      console.error("Error deleting marker:", error);
    } else {
      // If the marker is successfully deleted from the database, remove it from the state as well
      setMarkers((currentMarkers) =>
        currentMarkers.filter((marker) => marker.id !== id)
      );
    }
  };

  const fetchMarkers = async () => {
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
      .eq("user_book.user", user?.id || "");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (data) {
      const markerPromises = data.map(async (marker) => {
        let marker_type = "Country Published";
        let latitude: any, longitude: any;

        latitude = marker.country_published_lat ?? 0;
        longitude = marker.country_published_long ?? 0;

        if (marker.author_nationality_lat && marker.author_nationality_long) {
          marker_type = "Author Nationality";
          latitude = marker.author_nationality_lat;
          longitude = marker.author_nationality_long;
        } else if (marker.setting_origin_lat && marker.setting_origin_long) {
          marker_type = "Setting Origin";
          latitude = marker.setting_origin_lat;
          longitude = marker.setting_origin_long;
        }

        const country = await fetchCountryName(latitude, longitude);
        const bookId = books.find(
          (book: UserBook) => book.book.id === marker.user_book?.book?.id
        );
        return {
          ...marker,
          marker_type,
          book_title: bookId?.book.title || "Unknown",
          country,
        };
      });

      const updatedMarkers = await Promise.all(markerPromises);
      setMarkers(updatedMarkers.map((marker:any) => marker));
    }
  };

  useEffect(() => {
    if (user?.id)
      // Ensuring user.id exists before calling fetchMarkers
      fetchMarkers();
    console.log(books);
  }, [user?.id]);

  return (
    <View style={styles.container}>
      {markers.map((marker) => (
        <View key={marker.id} style={styles.markerContainer}>
          <View style={styles.containerTitle}>
            <Text style={styles.bookTitle}>{marker.book_title}</Text>
            <Text style={styles.markerType}>{marker.marker_type}</Text>
            <Text>{marker.country}</Text>
          </View>
          <TouchableOpacity
            onPress={() => removeMarker(marker.id)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  markerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "lightgrey",
    paddingBottom: 10,
    marginBottom: 10,
  },
  containerTitle: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "70%",
  },
  markerContent: {
    flex: 1,
  },
  markerType: {
    fontSize: 14,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: "white",
  },
});

export default EditMarkers;
