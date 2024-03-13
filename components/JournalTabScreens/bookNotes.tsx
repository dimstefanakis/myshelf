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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useJournalStore } from "@/store/journalStore";
import type { Note } from "@/store/journalStore";

const BookScreen: React.FC = () => {
  const { session } = useUser();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notes, setNotes } = useJournalStore();

  const getThumbnailUrl = (item: Note): string => {
    return item.users_book?.book?.cover_url ?? "default_thumbnail_url";
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
    console.log("Listening to notes updates");
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
          console.log("Notes table changed");
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

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.createBookButton}
        onPress={() => {
          navigation.navigate("AddBookNoteEntryScreen");
        }}
      >
        <Text style={styles.createButtonText}>Create New Note</Text>
      </TouchableOpacity>
      {notes.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.booksContainer}
          scrollEventThrottle={20}
        >
          {notes.map((item, index) => {
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
        <Text>No notes to display</Text>
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
