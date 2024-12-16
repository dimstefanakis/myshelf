import { useState, useEffect } from "react";
import {
  useLocalSearchParams,
  useGlobalSearchParams,
  useRouter,
} from "expo-router";
import { Image } from "expo-image";
import { ActivityIndicator, ScrollView, useWindowDimensions } from "react-native";
import { supabase } from "@/utils/supabase";
import { YStack, XStack, Text, Button, Card, Paragraph, H2, H4 } from "tamagui";
import { StyleSheet } from "react-native";
import RenderHtml from 'react-native-render-html';

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
  const action = localSearchParams.addAction as keyof typeof actionTypes;

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    getBookById().then((data) => {
      setCoverUrl(`${data?.volumeInfo.imageLinks?.thumbnail}&fife=w800`);
      setBook(data);
      setLoading(false);
    });
  }, [bookId]);

  const { width } = useWindowDimensions();

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" />
      </YStack>
    );
  }

  return (
    <ScrollView>
      <YStack f={1} padding="$4">
        <XStack space="$4">
          <Image
            source={{ uri: coverUrl }}
            style={styles.coverImage}
            contentFit="contain"
            placeholder={blurhash}
            transition={1000}
          />
          
          <YStack flex={1} space="$2">
            <H2>{book?.volumeInfo.title}</H2>
            <Text color="$gray11">{book?.volumeInfo.authors?.join(', ')}</Text>
            <Text color="$gray10" fontSize="$3">
              Published: {getReleaseYear(book?.volumeInfo.publishedDate || "")}
            </Text>
            {book?.volumeInfo.pageCount && (
              <Text color="$gray10" fontSize="$3">
                {book.volumeInfo.pageCount} pages
              </Text>
            )}
          </YStack>
        </XStack>

        <Card marginVertical="$4" bordered padding="$4" backgroundColor="$orange2">
          <H4 marginBottom="$2" color="$orange11">About this book</H4>
          <YStack 
            height={isDescriptionExpanded ? 'auto' : 150} 
            overflow="hidden"
          >
            <RenderHtml
              contentWidth={width - 48}
              source={{ 
                html: book?.volumeInfo.description || 'No description available'
              }}
              baseStyle={{
                color: '$gray11',
                fontSize: 14,
                lineHeight: 20
              }}
            />
          </YStack>
          {book?.volumeInfo.description && (
            <Text
              color="$blue10"
              marginTop="$2"
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? 'Show less' : 'Show more'}
            </Text>
          )}
        </Card>

        {book?.volumeInfo.categories && (
          <Card bordered padding="$4" backgroundColor="$orange2">
            <H4 marginBottom="$2" color="$orange11">Categories</H4>
            <XStack flexWrap="wrap" gap="$2">
              {book.volumeInfo.categories.map((category, index) => (
                <Card
                  key={index}
                  backgroundColor="$orange4"
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$10"
                >
                  <Text color="$orange11" fontSize="$3">{category}</Text>
                </Card>
              ))}
            </XStack>
          </Card>
        )}

        <Button
          size="$6"
          marginVertical="$4"
          borderRadius="$10"
          backgroundColor="$orange10"
          pressStyle={{ backgroundColor: '$orange8' }}
          onPress={addBookToMyShelf}
        >
          {addingBook ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text color="white">
              Add to {action ? actionTypes[action] : "future reading"}
            </Text>
          )}
        </Button>
      </YStack>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  coverImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
});

