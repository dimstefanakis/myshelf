import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useGlobalSearchParams, Link } from "expo-router";
import {
  Platform,
  StyleSheet,
  Button,
  TouchableNativeFeedback,
} from "react-native";

import { Text, View } from "@/components/Themed";
import type { Book } from "@/constants/BookTypes";

export default function BookModalScreen() {
  const [book, setBook] = useState<Book | null>(null);
  const localSearchParams = useLocalSearchParams();
  const globalSearchParams = useGlobalSearchParams();
  const bookId = localSearchParams.id;

  async function getBookById() {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`,
    );
    const data = await response.json();
    return data;
  }

  useEffect(() => {
    getBookById().then((data) => {
      setBook(data);
    });
  }, [bookId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book?.volumeInfo.title}</Text>
      <Text style={styles.author}>{book?.volumeInfo.authors?.[0]}</Text>
      <Text style={styles.description}>{book?.volumeInfo.description}</Text>
      {/* <Link to="BookList">
        <Button title="Close" onPress={() => {}} />
      </Link> */}
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
