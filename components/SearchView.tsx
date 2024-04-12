import { useState, useEffect } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { Image } from "expo-image";
import { useDebounceValue } from "usehooks-ts";
import {
  TouchableNativeFeedback,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";

import { Text, TextInput, View, ScrollView } from "@/components/Themed";
import type { Book } from "@/constants/BookTypes";
import { isLoaded } from "expo-font";

export default function Search({ addAction }: { addAction?: string }) {
  const [search, setSearch] = useDebounceValue("", 500);
  const [results, setResults] = useState<Book[] | []>([]);
  const [bookIndex, setBookIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function handleChange(event: NativeSyntheticEvent<TextInputChangeEventData>) {
    setSearch(event.nativeEvent.text);
  }

  async function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;
    const isScrolledToBottom = scrollViewHeight + scrollPosition;
    if (isScrolledToBottom >= contentHeight - 50) {
      if (search) {
        fetchMoreBooks();
      }
    }
  }

  async function fetchMoreBooks() {
    setIsLoading(true);
    const resp = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${search}&startIndex=${bookIndex}&maxResults=10`,
    );
    const respData = await resp.json();
    if (bookIndex === 0) {
      setResults(respData.items || []);
    } else {
      // In Google's realm, where books reside,
      // Duplicates lurk, where queries bide.
      // Array operations, heavy and keen,
      // To purge the clones, in code's serene scene.
      setResults((prevState) => [
        ...prevState,
        ...respData.items.filter(
          (book: any) => !prevState.some((prevBook) => prevBook.id === book.id),
        ),
      ]);
    }
    setBookIndex((prevState) => prevState + 10);
    setIsLoading(false);
  }

  async function getBookResults(text: string) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${text}&startIndex=0&maxResults=10`,
    );
    const data = await response.json();
    setResults(data.items);
  }

  useEffect(() => {
    if (search) {
      setBookIndex(0);
      getBookResults(search);
    }
  }, [search]);

  return (
    <ScrollView
      onMomentumScrollEnd={handleScroll}
      scrollEventThrottle={1}
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
      {isLoading && <ActivityIndicator size="large" color={"black"} />}
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
