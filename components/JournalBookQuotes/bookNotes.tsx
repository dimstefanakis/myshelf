import React, { useEffect } from "react";
import {
  Text,
  View,
  Button,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import useUser from "@/hooks/useUser";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
// import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";

const BookScreen = () => {
  const [bookData, setBookData] = useState([
    {
      title: "",
      description: "",
      users_book: "",
      user: "",
    },
  ]);

  const navigation = useNavigation();

  const getThumbnailUrl = (item: any) => {
    return item.users_books?.book?.cover_url ?? "default_thumbnail_url";
  };

  const user = useUser();

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
    setBookData([]);
    data?.forEach((item) => {
      setBookData((prevData) => [...prevData, item]);
    });
  };

  useEffect(() => {
    getBookData();
  }, []);
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* button to open modal */}
      <TouchableOpacity
        style={styles.createBookButton}
        onPress={() => navigation.navigate("ModalBookScreen")}
      >
        <Text style={styles.createButtonText}>Create New BookNotes</Text>
      </TouchableOpacity>
      {bookData.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 46 }}
          scrollEventThrottle={20}
        >
          {bookData.map((item: any, index) => {
            const thumbnailUrl = getThumbnailUrl(item);
            item;
            return (
              <View key={item.id} style={{ padding: 20 }}>
                <Image
                  source={{ uri: thumbnailUrl }}
                  style={{ width: 100, height: 100 }}
                />
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Text>{item.description}</Text>
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
  createBookButton: {
    backgroundColor: "#ff9999",
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
    paddingBottom: 50,
  },
});
