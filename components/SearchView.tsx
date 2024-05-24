import { useState, useEffect } from "react";
import {
  useRouter,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
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
import { Pressable } from "react-native";

type SearchProps = {
  addAction?: string;
  filter?: string;
  category?: string;
};

export default function Search({ addAction, ...rest }: SearchProps) {
  const localSearchParams = useLocalSearchParams();
  const filter = localSearchParams.filter || (rest.filter as string);
  const category = localSearchParams.category || (rest.category as string);

  const [search, setSearch] = useDebounceValue("", 500);
  const [results, setResults] = useState<Book[] | []>([]);
  const [bookIndex, setBookIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  function handleChange(event: NativeSyntheticEvent<TextInputChangeEventData>) {
    setSearch(event.nativeEvent.text);
    if (event.nativeEvent.text == "") {
      setResults([]);
    }
  }

  function chooseUlr(): string {
    const isbnCode: number = Number(search);
    if (filter) {
      if (search.length > 0) {
        return `https://www.googleapis.com/books/v1/volumes?q=${search}&${filter}&startIndex=${bookIndex}&maxResults=10`;
      } else {
        return `https://www.googleapis.com/books/v1/volumes?q=${filter}&startIndex=${bookIndex}&maxResults=10`;
      }
    } else {
      return !isNaN(isbnCode) && (search.length === 10 || search.length === 13)
        ? `https://www.googleapis.com/books/v1/volumes?q=isbn:${search}&startIndex=${bookIndex}&maxResults=10`
        : `https://www.googleapis.com/books/v1/volumes?q=${search}&startIndex=${bookIndex}&maxResults=10`;
    }
  }

  async function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;
    const isScrolledToBottom = scrollViewHeight + scrollPosition;
    if (isScrolledToBottom >= contentHeight - 50) {
      if (search || filter) {
        fetchMoreBooks();
      }
    }
  }

  async function fetchMoreBooks() {
    setIsLoading(true);
    const resp = await fetch(chooseUlr());
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

  async function getBookResults() {
    const response = await fetch(chooseUlr());
    const data = await response.json();
    setResults(data.items || []);
  }

  useEffect(() => {
    if (search || filter) {
      setBookIndex(0);
      getBookResults();
    }
  }, [search, filter]);

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
      {category ? (
        <Text
          style={{
            width: "100%",
            paddingHorizontal: 20,
            fontSize: 26,
            fontWeight: "bold",
          }}
        >
          {category}
        </Text>
      ) : null}
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
        {results.length == 0 && !category ? (
          <View style={{ width: "100%", flex: 1 }}>
            <Category title="Fiction" value="subject:fiction" />
            <Category title="Non-Fiction" value='subject:"non-fiction"' />
            <Category title="Fantasy" value="subject:fantasy" />
            <Category title="Mystery" value="subject:mystery" />
            <Category title="Horror" value="subject:horror" />
            <Category title="Romance" value="subject:romance" />
            <Category title="Biography" value="subject:biography" />
            <Category title="History" value="subject:history" />
            <Category title="Science" value="subject:science" />
            <Category title="Self-Help" value="subject:self-help" />
          </View>
        ) : null}
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

function Category({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description?: string;
}) {
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  async function getBooks() {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${value}&maxResults=10`;
    const response = await fetch(url);
    const data = await response.json();
    setResults(data.items || []);
  }

  useEffect(() => {
    getBooks();
  }, []);

  function handlePress() {
    // navigation.push("searchCategory", {
    //   category: value,
    //   filter: `subject:${value}`,
    //   action: "currently_reading",
    // });
    router.push({
      pathname: "/searchCategory",
      params: {
        category: title,
        filter: `${value}`,
        action: "currently_reading",
      },
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        flex: 1,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        // padding: 10,
      }}
    >
      <View
        style={{
          padding: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{title}</Text>
        <Text style={{ fontSize: 12, color: "gray" }}>{description}</Text>
        <ScrollView
          horizontal
          style={{
            flexDirection: "row",
            marginTop: 10,
          }}
        >
          {results.length == 0 ? (
            <ActivityIndicator size="small" color={"black"} />
          ) : (
            results.map((book: any) => (
              <Image
                key={book.id}
                source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
                style={{
                  width: 60,
                  height: 90,
                  borderRadius: 0,
                  marginRight: 10,
                }}
                placeholder={blurhash}
                transition={1000}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Pressable>
  );
}
