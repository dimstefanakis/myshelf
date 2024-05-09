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
import useUser from "@/hooks/useUser";

import { Text, View, Button } from "@/components/Themed";
import type { Book } from "@/constants/BookTypes";
import { UserBook, useUserBooksStore } from "@/store/userBooksStore";

const actionTypes = {
  currently_reading: "currently reading",
  completed: "completed pile",
  future_reading: "future reading",
};

export default function RemoveBookModalScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { setBooks } = useUserBooksStore();
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [removingBook, setRemovingBook] = useState(false);
  const [book, setBook] = useState<UserBook | null>(null);
  const localSearchParams = useLocalSearchParams();
  const bookId = localSearchParams.id;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const getUsersBooks = async () => {
    const data = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("user", user?.id || "");
    if (data?.data) {
      setBooks(data.data as unknown as UserBook[]);
    }
    return data;
  };

  const getBook = async () => {
    const { data, error } = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("id", bookId)
      .single();

    if (error) {
      console.error(error);
    }

    const book_data = data?.book as any;

    if (book_data.google_api_data?.volumeInfo.imageLinks?.thumbnail) {
      setCoverUrl(
        book_data.google_api_data.volumeInfo.imageLinks.thumbnail.replace(
          "http://",
          "https://",
        ),
      );
    }
    setBook(data as unknown as UserBook);
  };

  useEffect(() => {
    if (bookId) {
      getBook();
    }
  }, [bookId]);

  async function removeFromShelf() {
    if (book) {
      setRemovingBook(true);
      const { data, error } = await supabase
        .from("users_books")
        .delete()
        .eq("id", book.id);
      if (error) {
        console.error(error);
      } else {
        getUsersBooks();
        router.back();
      }
    }
  }

  return book ? (
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

      <Text style={styles.title}>
        {book?.book.google_api_data?.volumeInfo.title}
      </Text>
      <Text style={styles.author}>
        {book?.book.google_api_data?.volumeInfo.authors?.[0]}
      </Text>

      {/* <Link to="BookList">
        <Button title="Close" onPress={() => {}} />
      </Link> */}
      <Button
        onPress={removeFromShelf}
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "row",
          width: 200,
        }}
      >
        {removingBook ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "700" }}>
            Remove from shelf
          </Text>
        )}
      </Button>
      <StatusBar style="auto" />
    </View>
  ) : null;
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
