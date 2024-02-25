import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useGlobalSearchParams, Link } from "expo-router";
import { Image } from "expo-image";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  ActivityIndicator,
} from "react-native";
import { supabase } from "@/utils/supabase";

import { Text, View, Button } from "@/components/Themed";
import type { Book } from "@/constants/BookTypes";

export default function BookModalScreen() {
  const [addingBook, setAddingBook] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const localSearchParams = useLocalSearchParams();
  const globalSearchParams = useGlobalSearchParams();
  const bookId = localSearchParams.id;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  async function getBookById() {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`,
    );
    const data = await response.json();
    return data;
  }

  function getReleaseYear(date: string) {
    try {
      return date.split("-")[0];
    } catch (e) {
      return "N/A";
    }
  }

  async function addBookToMyShelf() {
    setAddingBook(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setAddingBook(false);
      return;
    }

    // Add book if it doesn't exist
    const isbn10 = book?.volumeInfo.industryIdentifiers?.find(
      (identifier) => identifier.type === "ISBN_10",
    )?.identifier;

    const isbn13 = book?.volumeInfo.industryIdentifiers?.find(
      (identifier) => identifier.type === "ISBN_13",
    )?.identifier;

    const { data: existingBook, error: existingBookError } = await supabase
      .from("books")
      .select("*")
      .eq("isbn_10", isbn10 || "")
      .eq("isbn_13", isbn13 || "")
      .single();

    if (existingBookError) {
      console.error(existingBookError);
      setAddingBook(false);
      return;
    }

    if (!existingBook) {
      const { data: newBook, error: newBookError } = await supabase
        .from("books")
        .insert([
          {
            title: book?.volumeInfo.title,
            isbn_10: isbn10,
            isbn_13: isbn13,
            cover_url: book?.volumeInfo.imageLinks?.thumbnail,
          },
        ])
        .select("*")
        .single();

      if (newBookError) {
        console.error(newBookError);
        setAddingBook(false);
        return;
      } else {
        await supabase.from("user_books").insert([
          {
            user_id: session.user.id,
            book_id: newBook?.id,
          },
        ]);
      }
    } else {
      await supabase.from("user_books").insert([
        {
          user_id: session.user.id,
          book_id: existingBook.id,
        },
      ]);
    }
    setAddingBook(false);
  }

  useEffect(() => {
    getBookById().then((data) => {
      setBook(data);
    });
  }, [bookId]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: book?.volumeInfo.imageLinks?.thumbnail }}
        style={{ width: 128, height: 192 }}
        placeholder={blurhash}
        transition={1000}
      />

      <Text style={styles.title}>{book?.volumeInfo.title}</Text>
      <Text style={styles.author}>{book?.volumeInfo.authors?.[0]}</Text>
      {/* release year */}
      <Text style={styles.description}>
        {getReleaseYear(book?.volumeInfo.publishedDate || "")}
      </Text>

      {/* <Link to="BookList">
        <Button title="Close" onPress={() => {}} />
      </Link> */}
      <Button
        onPress={addBookToMyShelf}
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "row",
        }}
      >
        {addingBook && (
          <ActivityIndicator
            size="small"
            color="white"
            style={{
              marginRight: 10,
              marginLeft: -10,
            }}
          />
        )}
        <Text style={{ color: "white", fontWeight: "700" }}>
          Add to MyShelf
        </Text>
      </Button>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  author: {
    fontSize: 16,
    color: "gray",
  },
  description: {
    fontSize: 16,
  },
});
