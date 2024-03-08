import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StyleProp,
  ViewStyle,
} from "react-native";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";

// Define types for your data
type BookDataType = {
  id: number;
  title: string;
  description: string;
  created_at: string;
  user: string;
  users_books?: {
    book?: {
      cover_url?: string;
      google_api_data?: any; // Specify the type further based on your data structure
    };
  };
};

const BookScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [bookData, setBookData] = useState<BookDataType[]>([]);

  const getThumbnailUrl = (item: BookDataType): string => {
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
    let userBooks = data as unknown as BookDataType[];
    setBookData(userBooks ? userBooks : []);
  };

  useEffect(() => {
    getBookData();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBookButton}
        onPress={() => {
          navigation.navigate("AddBookNoteEntryScreen");
        }}
      >
        <Text style={styles.createButtonText}>Create New BookNotes</Text>
      </TouchableOpacity>
      {bookData.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.booksContainer}
          scrollEventThrottle={20}
        >
          {bookData.map((item: BookDataType, index) => {
            const thumbnailUrl = getThumbnailUrl(item);
            // Calculate dynamic styling for alignment
            const remainder = (index + 1) % 3; // Determine position in the row
            let additionalStyle: StyleProp<ViewStyle> = {};
            if (remainder === 1) {
              // First item in a row
              additionalStyle = { marginRight: "auto", marginLeft: 0 };
            } else if (remainder === 0) {
              // Last item in a row
              additionalStyle = { marginLeft: "auto", marginRight: 0 };
            } // Middle item naturally centers due to justifyContent
            return (
              <View
                key={item.id.toString()}
                style={[styles.bookItem, additionalStyle]}
              >
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={styles.bookImage}
                />
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookDescription}>{item.description}</Text>
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
    justifyContent: "space-between",
    paddingBottom: 50,
  },
  bookItem: {
    width: "30%",
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: "1.5%",
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
