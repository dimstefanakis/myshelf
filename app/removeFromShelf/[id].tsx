import { useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ActivityIndicator, ScrollView } from "react-native";
import { supabase } from "@/utils/supabase";
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Tabs,
  H2,
  H4,
  Separator,
} from "tamagui";
import { UserBook, useUserBooksStore } from "@/store/userBooksStore";
import useUser from "@/hooks/useUser";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import RenderHtml from 'react-native-render-html';

interface Tag {
  id: number;
  name: string;
}

interface Note {
  id: number;
  title: string;
  description: string;
}

interface Quote {
  id: number;
  content: string;
  page?: number;
}

interface Journal {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

export default function BookProfileScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { books, setBooks } = useUserBooksStore();
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<UserBook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const localSearchParams = useLocalSearchParams();
  const bookId = localSearchParams.id;
  const { width } = useWindowDimensions();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  const getBookData = async () => {
    const { data, error } = await supabase
      .from("users_books")
      .select(`
        *,
        book (
          *,
          book_tags (
            tags (*)
          )
        ),
        notes (*),
        journals (*),
        quotes (*)
      `)
      .eq("id", bookId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setBook(data as UserBook);
      setNotes(data.notes as Note[]);
      setQuotes(data.quotes as Quote[]);
      setJournals(data.journals as Journal[]);
      setTags(data.book.book_tags.map((tag: { tags: Tag }) => tag.tags));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bookId) {
      getBookData();
    }
  }, [bookId]);

  const removeFromShelf = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("users_books")
      .delete()
      .eq("id", bookId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("user", user?.id || "");

    if (data) {
      setBooks(data as unknown as UserBook[]);
    }
    router.back();
  };

  const updateBookStatus = async (newStatus: 'currently_reading' | 'completed' | 'future_reading') => {
    setLoading(true);
    const { error } = await supabase
      .from("users_books")
      .update({ status: newStatus })
      .eq("id", bookId);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("user", user?.id || "");

    if (data) {
      setBooks(data as unknown as UserBook[]);
      setBook(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setLoading(false);
  };

  return (
    <ScrollView>
      <YStack padding="$4" space="$4">
        {/* Book Header Card */}
        <Card backgroundColor="$orange2" padding="$4">
          <XStack space="$4">
            <Image
              source={{ uri: book?.book.cover_url }}
              style={{ width: 120, height: 180 }}
              contentFit="contain"
              placeholder={blurhash}
              transition={1000}
            />

            <YStack flex={1} space="$2">
              <H2>{book?.book.title}</H2>
              <Text color="$gray11">
                {book?.book.google_api_data?.volumeInfo?.authors?.join(", ")}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Reading Status Card */}
        <Card backgroundColor="$orange2" padding="$4">
          <H4 color="$orange11" marginBottom="$2">Reading Status</H4>
          <YStack space="$3">
            <Button
              backgroundColor={book?.status === 'currently_reading' ? '$orange10' : '$orange2'}
              borderColor="$orange4"
              borderWidth={1}
              onPress={() => updateBookStatus('currently_reading')}
              disabled={loading}
              icon={loading && book?.status !== 'currently_reading' ? 
                <ActivityIndicator size="small" color="black" /> :
                <MaterialCommunityIcons 
                  name="book-open-page-variant" 
                  size={20} 
                  color={book?.status === 'currently_reading' ? 'white' : '$orange11'} 
                />
              }
            >
              <Text color={book?.status === 'currently_reading' ? 'white' : '$orange11'}>
                Currently Reading
              </Text>
            </Button>

            <Button
              backgroundColor={book?.status === 'completed' ? '$orange10' : '$orange2'}
              borderColor="$orange4"
              borderWidth={1}
              onPress={() => updateBookStatus('completed')}
              disabled={loading}
              icon={loading && book?.status !== 'completed' ? 
                <ActivityIndicator size="small" color="black" /> :
                <MaterialCommunityIcons 
                  name="bookmark-check" 
                  size={20} 
                  color={book?.status === 'completed' ? 'white' : '$orange11'} 
                />
              }
            >
              <Text color={book?.status === 'completed' ? 'white' : '$orange11'}>
                Completed
              </Text>
            </Button>

            <Button
              backgroundColor={book?.status === 'future_reading' ? '$orange10' : '$orange2'}
              borderColor="$orange4"
              borderWidth={1}
              onPress={() => updateBookStatus('future_reading')}
              disabled={loading}
              icon={loading && book?.status !== 'future_reading' ? 
                <ActivityIndicator size="small" color="black" /> :
                <MaterialCommunityIcons 
                  name="bookmark-plus" 
                  size={20} 
                  color={book?.status === 'future_reading' ? 'white' : '$orange11'} 
                />
              }
            >
              <Text color={book?.status === 'future_reading' ? 'white' : '$orange11'}>
                Want to Read
              </Text>
            </Button>
          </YStack>
        </Card>

        {/* Book Description Card */}
        <Card backgroundColor="$orange2" padding="$4">
          <H4 color="$orange11" marginBottom="$2">About this Book</H4>
          <YStack 
            height={isDescriptionExpanded ? 'auto' : 150} 
            overflow="hidden"
          >
            <RenderHtml
              contentWidth={width - 48}
              source={{
                html: book?.book.google_api_data?.volumeInfo?.description || 'No description available'
              }}
              baseStyle={{
                color: '$gray11',
                fontSize: 14,
                lineHeight: 20
              }}
            />
          </YStack>
          {book?.book.google_api_data?.volumeInfo?.description && (
            <Text
              color="$blue10"
              marginTop="$2"
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            >
              {isDescriptionExpanded ? 'Show less' : 'Show more'}
            </Text>
          )}
        </Card>

        {/* Notes Section */}
        <Card backgroundColor="$orange2" padding="$4">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <H4 color="$orange11">Notes</H4>
            <Button
              backgroundColor="$orange10"
              circular
              onPress={() => router.push('/addBookNoteEntry')}
              icon={<Ionicons name="add" size={20} color="white" />}
            >
            </Button>
          </XStack>
          <YStack space="$3">
            {notes.length > 0 ? (
              notes.map((note) => (
                <Card key={note.id} backgroundColor="$orange4" padding="$3">
                  <Text fontSize="$5" fontWeight="bold">{note.title}</Text>
                  <Text fontSize="$3" marginTop="$2">{note.description}</Text>
                </Card>
              ))
            ) : (
              <Text color="$gray11">No notes yet</Text>
            )}
          </YStack>
        </Card>

        {/* Quotes Section */}
        <Card backgroundColor="$orange2" padding="$4">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <H4 color="$orange11">Quotes</H4>
            <Button
              backgroundColor="$orange10"
              circular
              onPress={() => router.push('/addBookQuoteEntry')}
              icon={<Ionicons name="add" size={20} color="white" />}
            >
            </Button>
          </XStack>
          <YStack space="$3">
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <Card key={quote.id} backgroundColor="$orange4" padding="$3">
                  <Text fontSize="$4" fontStyle="italic">"{quote.content}"</Text>
                  {quote.page && (
                    <Text fontSize="$2" color="$gray11" marginTop="$2">Page {quote.page}</Text>
                  )}
                </Card>
              ))
            ) : (
              <Text color="$gray11">No quotes yet</Text>
            )}
          </YStack>
        </Card>

        {/* Journal Section */}
        <Card backgroundColor="$orange2" padding="$4">
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <H4 color="$orange11">Journal Entries</H4>
            <Button
              backgroundColor="$orange10"
              circular
              onPress={() => router.push('/addBookJournalEntry')}
              icon={<Ionicons name="add" size={20} color="white" />}
            >
            </Button>
          </XStack>
          <YStack space="$3">
            {journals.length > 0 ? (
              journals.map((journal) => (
                <Card key={journal.id} backgroundColor="$orange4" padding="$3">
                  <Text fontSize="$4" fontWeight="bold">{journal.title}</Text>
                  <Text fontSize="$3" marginTop="$2">{journal.content}</Text>
                  <Text fontSize="$2" color="$gray11" marginTop="$2">
                    {new Date(journal.created_at).toLocaleDateString()}
                  </Text>
                </Card>
              ))
            ) : (
              <Text color="$gray11">No journal entries yet</Text>
            )}
          </YStack>
        </Card>

        {/* Remove Button */}
        <Button
          onPress={removeFromShelf}
          backgroundColor="$red2"
          mb="$10"
          borderColor="$red8"
          borderWidth={1}
          disabled={loading}
          icon={loading ? 
            <ActivityIndicator size="small" color="$red10" /> :
            <MaterialCommunityIcons name="bookmark-remove" size={20} color="$red10" />
          }
        >
          <Text color="$red10">Remove from Library</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}