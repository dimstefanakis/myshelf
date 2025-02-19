import { useState, useEffect } from "react";
import {
  useRouter,
  useNavigation,
  useFocusEffect,
  useLocalSearchParams,
  router,
} from "expo-router";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useDebounceValue } from "usehooks-ts";
import {
  TouchableNativeFeedback,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  NativeScrollEvent,
  ActivityIndicator,
} from "react-native";

import { Text, Input, View, ScrollView, Button } from "tamagui";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import type { Book } from "@/constants/BookTypes";
import { isLoaded } from "expo-font";
import { Pressable } from "react-native";

const API_KEY = 'AIzaSyDAxF1uGveMkZz0ySXJnziEF9oO3z2rTXY';

type SearchProps = {
  addAction?: string;
  filter?: string;
  category?: string;
  showCategories?: boolean;
};

export default function Search({
  addAction,
  showCategories = true,
  ...rest
}: SearchProps) {
  const localSearchParams = useLocalSearchParams();
  const filter = localSearchParams.filter || (rest.filter as string);
  const category = localSearchParams.category || (rest.category as string);

  const [search, setSearch] = useDebounceValue("", 500);
  const [results, setResults] = useState<Book[] | []>([]);
  const [bookIndex, setBookIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);

  function handleChange(event: NativeSyntheticEvent<TextInputChangeEventData>) {
    setSearch(event.nativeEvent.text);
    if (event.nativeEvent.text == "") {
      setResults([]);
    }
  }

  function chooseUlr(): string {
    const isbnCode: number = Number(search);
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    const params = new URLSearchParams({
      key: API_KEY,
      startIndex: bookIndex.toString(),
      maxResults: '10',
    });

    if (filter) {
      if (search.length > 0) {
        params.append('q', `${search}&${filter}`);
      } else {
        params.append('q', filter as string);
      }
    } else {
      if (!isNaN(isbnCode) && (search.length === 10 || search.length === 13)) {
        params.append('q', `isbn:${search}`);
      } else {
        params.append('q', search);
      }
    }

    return `${baseUrl}?${params.toString()}`;
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

  async function getFeaturedBooks() {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=orderBy=relevance&maxResults=15&key=${API_KEY}`
    );
    const data = await response.json();
    setFeaturedBooks(data.items || []);
  }

  useEffect(() => {
    if (search || filter) {
      setBookIndex(0);
      getBookResults();
    }
  }, [search, filter]);

  useEffect(() => {
    if (!search && !filter) {
      getFeaturedBooks();
    }
  }, []);

  return (
    <SafeAreaViewFixed style={{ flex: 1, backgroundColor: 'white' }}>
      <Button
        borderRadius={100}
        w={50}
        h={50}
        chromeless
        icon={<ChevronLeft size={24} color="$gray10" />}
        onPress={() => router.back()}
      />

      {/* Search Header */}
      <View style={{ padding: 16, backgroundColor: 'white' }}>
        <Input
          backgroundColor="$orange2"
          borderRadius={8}
          paddingHorizontal={16}
          fontSize={16}
          placeholder="Search by title, author, or ISBN..."
          onChange={handleChange}
        />
      </View>

      {/* Main Content */}
      <ScrollView
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Initial Screen - Featured Content */}
        {!search && !filter && (
          <>
            {/* Categories Section */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: "600",
                marginHorizontal: 16,
                marginBottom: 12,
                color: '$orange11'
              }}>
                Browse Categories
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
              >
                <CategoryPill title="Fiction" value="subject:fiction" />
                <CategoryPill title="Non-Fiction" value='subject:"non-fiction"' />
                <CategoryPill title="Fantasy" value="subject:fantasy" />
                <CategoryPill title="Mystery" value="subject:mystery" />
                <CategoryPill title="Romance" value="subject:romance" />
                <CategoryPill title="Science" value="subject:science" />
              </ScrollView>
            </View>

            {/* Featured Books Section */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 20,
                fontWeight: "600",
                marginHorizontal: 16,
                marginBottom: 12,
                color: '$orange11'
              }}>
                Featured Books
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 16,
                gap: 12,
              }}>
                {featuredBooks.map((book) => (
                  <FeaturedBook key={book.id} book={book} action={addAction || ""} />
                ))}
              </View>
            </View>
          </>
        )}

        {/* Search Results */}
        {(search || filter) && (
          <View style={{ padding: 16 }}>
            {results.map((book: Book) => (
              <SearchResult key={book.id} book={book} action={addAction || ""} />
            ))}
          </View>
        )}

        {isLoading && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="$orange10" />
          </View>
        )}
      </ScrollView>
    </SafeAreaViewFixed>
  );
}

function FeaturedBook({ book, action }: { book: Book; action: string }) {
  const router = useRouter();
  const blurhash = "...";

  return (
    <Pressable
      onPress={() => router.push({
        pathname: `/book/${book.id}`,
        params: { addAction: action },
      })}
      style={({ pressed }) => ({
        width: '31%',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Image
        source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
        style={{
          width: '100%',
          aspectRatio: 2 / 3,
          borderRadius: 8
        }}
        placeholder={blurhash}
        transition={1000}
      />
      <View style={{ marginTop: 8 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: "500",
            marginBottom: 4,
          }}
        >
          {book.volumeInfo.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 11,
            color: 'gray',
          }}
        >
          {book.volumeInfo.authors?.[0]}
        </Text>
      </View>
    </Pressable>
  );
}

function SearchResult({ book, action }: { book: Book; action: string }) {
  const router = useRouter();
  const blurhash = "...";

  return (
    <Pressable
      onPress={() => router.push({
        pathname: `/book/${book.id}`,
        params: { addAction: action },
      })}
      style={({ pressed }) => ({
        backgroundColor: pressed ? '$orange2' : 'white',
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
      })}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "center",
      }}>
        <Image
          source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
          style={{ width: 60, height: 90, borderRadius: 8 }}
          placeholder={blurhash}
          transition={1000}
        />
        <View style={{
          flex: 1,
          marginLeft: 12,
        }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {book.volumeInfo.title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: 'gray',
          }}>
            {book.volumeInfo.authors?.join(", ")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function CategoryPill({ title, value }: { title: string; value: string }) {
  const router = useRouter();

  return (
    <Button
      onPress={() => router.push({
        pathname: "/searchCategory",
        params: {
          category: title,
          filter: value,
          action: "currently_reading",
        },
      })}
      backgroundColor="$orange4"
      pressStyle={{ backgroundColor: "$orange8" }}
      borderRadius={20}
      paddingHorizontal={16}
      paddingVertical={8}
    >
      <Text style={{
        color: '$orange11',
        fontWeight: "500",
      }}>
        {title}
      </Text>
    </Button>
  );
}
