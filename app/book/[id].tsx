import { useState, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import {
  useLocalSearchParams,
  useGlobalSearchParams,
  useRouter,
  Link,
} from "expo-router";
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
import { UserBook, useUserBooksStore } from "@/store/userBooksStore";

const actionTypes = {
  currently_reading: "currently reading",
  completed: "completed pile",
  future_reading: "future reading",
};

export default function BookModalScreen() {
  const router = useRouter();
  const { setBooks } = useUserBooksStore();
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [addingBook, setAddingBook] = useState(false);
  const [book, setBook] = useState<Book | null>(null);
  const localSearchParams = useLocalSearchParams();
  const globalSearchParams = useGlobalSearchParams();
  const bookId = localSearchParams.id;
  const action = localSearchParams.addAction as string;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const getUsersBooks = async (user_id: any) => {
    const data = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("user", user_id);
    if (data?.data) {
      setBooks(data.data as unknown as UserBook[]);
    }
    return data;
  };

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
      .eq("isbn_13", isbn13 || "");

    if (existingBookError) {
      setAddingBook(false);
      return;
    }

    if (existingBook.length == 0) {
      const { data: newBook, error: newBookError } = await supabase
        .from("books")
        .insert([
          {
            title: book?.volumeInfo.title,
            isbn_10: isbn10,
            isbn_13: isbn13,
            cover_url: book?.volumeInfo.imageLinks?.thumbnail,
            google_api_data: book,
          },
        ])
        .select("*")
        .single();

      const googleCategories = book?.volumeInfo.categories.map((category) => {
        return category
          .split("/")
          .flat()
          .map((c) => c.trim());
      });
      const categories = [...new Set(googleCategories?.flat())];
      if (categories) {
        for (const category of categories) {
          let tagId = null;
          const { data, error } = await supabase
            .from("tags")
            .select("*")
            .eq("name", category);
          if (data && data.length > 0) {
            tagId = data[0].id;
          } else {
            const { data: tagData, error: tagError } = await supabase
              .from("tags")
              .insert({
                name: category,
              })
              .select("*")
              .single();
            tagId = tagData?.id;
          }
          // create a book_tag
          if (tagId) {
            const { data: tagData, error: tagError } = await supabase
              .from("book_tags")
              .insert({
                book: newBook?.id,
                tag: tagId,
              });
          }
        }
      }

      if (newBookError) {
        setAddingBook(false);
        return;
      } else {
        await supabase.from("users_books").insert([
          {
            user: session.user.id,
            book: newBook?.id,
            status: action || "future_reading",
          },
        ]);
      }
    } else {
      await supabase.from("users_books").insert([
        {
          user: session.user.id,
          book: existingBook[0].id,
          status: action || "future_reading",
        },
      ]);
    }
    getUsersBooks(session.user.id);
    setAddingBook(false);
    router.back();
  }

  useEffect(() => {
    getBookById().then((data) => {
      setCoverUrl(`${data?.volumeInfo.imageLinks?.thumbnail}&fife=w800`);
      setBook(data);
    });
  }, [bookId]);

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: coverUrl,
        }}
        style={{ width: 256, height: 384 }}
        contentFit="contain"
        placeholder={blurhash}
        transition={1000}
      />

      <Text style={styles.title}>{book?.volumeInfo.title}</Text>
      <Text style={styles.author}>{book?.volumeInfo.authors?.[0]}</Text>
      {/* release year */}
      <Text style={styles.description}>
        Published: {getReleaseYear(book?.volumeInfo.publishedDate || "")}
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
          width: 200,
        }}
      >
        {addingBook ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "700" }}>
            {/* @ts-ignore */}
            Add to {action ? actionTypes[action] : "future reading"}
          </Text>
        )}
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
    textAlign: "center",
    marginVertical: 10,
  },
  author: {
    fontSize: 16,
    color: "gray",
  },
  description: {
    fontSize: 16,
    marginTop: 10,
  },
});
