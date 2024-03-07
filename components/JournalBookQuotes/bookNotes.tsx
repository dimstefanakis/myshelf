import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useNavigation } from "@react-navigation/native";

const BookScreen = () => {
  const [bookData, setBookData] = useState([]);

  const navigation = useNavigation();
  const user = useUser();

  const getThumbnailUrl = (item:any) => {
    return item.users_books?.book?.cover_url ?? "default_thumbnail_url";
  };

  const getBookData = async () => {
    let { data, error } = await supabase.from("notes").select(`
      id,
      title,
      description,
      created_at,
      user,
      users_books (*, 
        book (
          *,
          google_api_data
        )
      )
    `);

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setBookData(data? data: []);
  };

  useEffect(() => {
    getBookData();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBookButton}
        onPress={() => navigation.navigate("ModalBookScreen")}
      >
        <Text style={styles.createButtonText}>Create New BookNotes</Text>
      </TouchableOpacity>
      {bookData.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.booksContainer}
          scrollEventThrottle={20}
        >
          {bookData.map((item:any, index) => {
            const thumbnailUrl = getThumbnailUrl(item);
            // Calculate dynamic styling for alignment
            const remainder = (index + 1) % 3; // Determine position in the row
            let additionalStyle = {};
            if (remainder === 1) { // First item in a row
              additionalStyle = { marginRight: 'auto', marginLeft: 0 };
            } else if (remainder === 0) { // Last item in a row
              additionalStyle = { marginLeft: 'auto', marginRight: 0 };
            } // Middle item naturally centers due to justifyContent
            return (
              <View key={item?.id} style={[styles.bookItem, additionalStyle]}>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.bookImage}
                />
                <Text style={styles.bookTitle}>{item?.title}</Text>
                <Text style={styles.bookDescription}>{item?.description}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text>No BookNotes to display</Text>
      )}
    </View>
  );
};

export default BookScreen;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    alignItems: "center",
  },
  createBookButton: {
    backgroundColor: "black",
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scrollView: {
    width: "100%",
  },
  booksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Adjusted for spacing
    paddingBottom: 50,
  },
  bookItem: {
    width: "30%", // Adjusted for margin inclusion
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    // Add margin for spacing
    marginHorizontal: "1.5%", // Adjust based on desired spacing
  },
  bookImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bookDescription: {
    textAlign: "center",
  },
});
