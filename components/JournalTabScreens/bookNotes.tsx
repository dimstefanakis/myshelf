import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  StyleProp,
  ViewStyle,
  Pressable,
  Modal,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

// import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter, useNavigation } from "expo-router";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useJournalStore } from "@/store/journalStore";
import type { Note } from "@/store/journalStore";
import { Button, View, ScrollView, Text, TextInput } from "@/components/Themed";
import { AntDesign } from "@expo/vector-icons";

const BookScreen: React.FC = () => {
  const { session, user } = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notes, setNotes } = useJournalStore();
  const [imageUrls, setImageUrls] = useState({}); // State to hold image URLs
  const [searchQuery, setSearchQuery] = useState("");

  const getThumbnailUrl = (item: Note): string => {
    return item.users_book?.book?.cover_url ?? "default_thumbnail_url";
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<Note | null>(null);

  const handleModal = (item: any) => {
    setCurrentItem(item); // If item is provided, set it, otherwise null
    setModalVisible(!modalVisible);
  };

  const getPublicUrl = (filePath: any, coverUrl: string) => {
    if (!filePath) return coverUrl;

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    return data.publicUrl;
  };

  const loadImageUrls = async (notes: any) => {
    const urls = await Promise.all(
      notes.map(async (note: any) => ({
        // [note.id]: getPublicUrl(note.image_url, note.users_book.book.cover_url),
        [note.id]: note.users_book.book.cover_url,
      })),
    );

    setImageUrls(urls.reduce((acc, url) => ({ ...acc, ...url }), {}));
  };

  const getNotes = async () => {
    let { data, error } = await supabase
      .from("notes")
      .select(
        `
      id,
      title,
      description,
      created_at,
      user,
      image_url,
      users_book (*,
        book (
          *,
          google_api_data
        )
      )
    `,
      )
      .eq("users_book.user", session?.user?.id || "");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    let userNotes = data as unknown as Note[];
    setNotes(userNotes ? userNotes : []);
  };

  async function listenToNotesUpdates() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notes",
          // filter: `users_book.user=eq.${session?.user?.id}`,
        },
        () => {
          getNotes();
        },
      )
      .subscribe();

    return channel;
  }

  useEffect(() => {
    if (session?.user?.id) {
      getNotes();
      listenToNotesUpdates();
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (notes.length) {
      loadImageUrls(notes);
      // console.log("notes", notes);
    }
  }, [notes]);

  function navigateToNoteEntry() {
    navigation.navigate("AddBookNoteEntryScreen");
  }

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result?.canceled) {
        navigation.navigate("AddBookNoteEntryScreen", {
          image: result.assets[0],
          user: user,
        });
      }
    } else {
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
          }}
        >
          <TouchableOpacity onPress={openCamera} style={{ marginRight: 10 }}>
            <Entypo name="camera" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToNoteEntry}>
            <Entypo name="plus" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const filteredBookNotes = notes.filter(
    (entry) =>
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.users_book?.book.title
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />
      {notes.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.booksContainer}
          scrollEventThrottle={20}
        >
          {filteredBookNotes.map((item, index) => {
            const thumbnailUrl = getThumbnailUrl(item);
            // Calculate dynamic styling for alignment
            const remainder = (index + 1) % 3; // Determine position in the row
            let additionalStyle: StyleProp<ViewStyle> = {};
            if (remainder === 1) {
              additionalStyle = { marginRight: "auto", marginLeft: 0 };
            } else if (remainder === 0) {
              additionalStyle = { marginLeft: "auto", marginRight: 0 };
            }
            return (
              <>
                <View style={[styles.bookItem, additionalStyle]}>
                  <Pressable
                    key={item.id.toString()}
                    onPress={() => {
                      navigation.navigate("AddBookNoteEntryScreen", {
                        id: item.id,
                        cover_image: thumbnailUrl,
                      });
                    }}
                  >
                    <Image
                      source={{
                        // @ts-ignore
                        uri: imageUrls[item.id],
                      }}
                      style={styles.bookImage}
                    />
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookDescription} numberOfLines={4}>
                      {item.description}
                    </Text>
                  </Pressable>
                </View>
              </>
            );
          })}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#326E78",
              marginBottom: 20,
            }}
          >
            No notes yet!
          </Text>
          <Button onPress={() => navigation.navigate("AddBookNoteEntryScreen")}>
            <Text style={{ color: "white" }}>Create a new note</Text>
          </Button>
        </View>
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
  createButtonContainer: {
    width: "100%",
    alignItems: "center",
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
    width: "32%",
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: "1.5%",
  },
  bookImage: {
    width: 70,
    height: 100,
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "bold",
  },
  bookDescription: {
    textAlign: "left",
    fontSize: 9,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchBar: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    height: 40,
  },
});
