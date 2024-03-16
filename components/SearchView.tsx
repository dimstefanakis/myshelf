import { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useDebounceValue } from "usehooks-ts";
import {
  StyleSheet,
  TouchableNativeFeedback,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";

import { Text, TextInput, View, ScrollView } from "@/components/Themed";
import type { Book } from "@/constants/BookTypes";

export default function Search({ addAction }: { addAction?: string }) {
  const [search, setSearch] = useDebounceValue("", 500);
  const [results, setResults] = useState<Book[] | []>([]);

  function handleChange(event: NativeSyntheticEvent<TextInputChangeEventData>) {
    setSearch(event.nativeEvent.text);
  }

  async function getBookResults(text: string) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${text}`,
    );
    const data = await response.json();
    setResults(data.items);
  }

  useEffect(() => {
    if (search) {
      getBookResults(search);
    }
  }, [search]);

  return (
    <ScrollView
      style={{
        flex: 1,
      }}
      contentContainerStyle={{
        alignItems: "center",
      }}
    >
      <TextInput
        style={{
          height: 40,
          borderWidth: 1,
          width: "80%",
          padding: 10,
          borderRadius: 10,
          marginTop: 10,
        }}
        placeholder="Search: Title, Author, ISBN..."
        // value={search}
        onChange={handleChange}
      />
      <View
        style={{
          flex: 1,
          width: "100%",
          padding: 10,
        }}
      >
        {results.map((book: Book) => (
          <SearchResult key={book.id} book={book} action={addAction || ""} />
        ))}
      </View>
    </ScrollView>
  );
}

function SearchResult({ book, action }: { book: Book; action: string }) {
  const router = useRouter();
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  function handlePress() {
    router.push({
      pathname: `/book/${book.id}`,
      params: {
        addAction: action,
      },
    });
  }

  return (
    <TouchableNativeFeedback onPress={handlePress}>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <Image
          source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
          style={{ width: 50, height: 50, borderRadius: 10 }}
          placeholder={blurhash}
          transition={1000}
        />
        <View
          style={{
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            marginLeft: 10,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "bold" }} numberOfLines={2}>
            {book.volumeInfo.title}
          </Text>
          <Text style={{ fontSize: 12, color: "gray" }}>
            {book.volumeInfo.authors?.join(", ")}
          </Text>
        </View>
      </View>
    </TouchableNativeFeedback>
  );
}
