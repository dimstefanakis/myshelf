import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import useUser from "@/hooks/useUser";
import { useUserBooksStore, UserBook } from "@/store/userBooksStore";
import { YStack, XStack, Text, Separator, Image, Button } from "tamagui";

interface Book {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  status: 'future_reading' | 'currently_reading' | 'completed';
  created_at: string;
}

const ShelvesBlock = () => {
  const { session } = useUser();
  const navigation = useNavigation();
  const { books } = useUserBooksStore();
  const [organizedBooks, setOrganizedBooks] = useState<{
    future_reading: Book[];
    currently_reading: Book[];
    completed: Book[];
  }>({
    future_reading: [],
    currently_reading: [],
    completed: [],
  });
  books.map((book) => {
    console.log()
  })
  useEffect(() => {
    if (session?.user?.id) {
      organizeBooks();
    }
  }, [session?.user?.id, books]);

  const organizeBooks = () => {
    const sorted = books.reduce((acc, book) => {
      if (book.status && acc[book.status as keyof typeof acc]) {
        acc[book.status as keyof typeof acc] = [...acc[book.status as keyof typeof acc], book].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      return acc;
    }, {
      future_reading: [],
      currently_reading: [],
      completed: [],
    });

    setOrganizedBooks(sorted);
  };

  const renderBookShelf = (title: string, value: string, books: Book[]) => (
    <YStack space="$2" marginTop="0">
      <Text fontSize="$3" fontWeight="bold">{title}</Text>
      <XStack space="$2">
        {books.slice(0, 3).map((book) => (
          <Image
            key={book.id}
            source={{ uri: book.book.cover_url }}
            width={40}
            height={60}
            borderRadius="$2"
          />
        ))}
      </XStack>
    </YStack>
  );

  return (
    <YStack
      width="100%"
      height={350}
      backgroundColor="$background"
      borderRadius="$2"
      borderColor="$borderColor"
      borderWidth={1}
      onPress={() => navigation.navigate('Shelves')}
    >
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$3" marginTop="$3">
        <Text fontSize="$5" fontWeight="bold">Shelves</Text>
      </XStack>
      <YStack space="$2" padding="$3">
        {renderBookShelf("To read", "future_reading", organizedBooks.future_reading)}
        {renderBookShelf("Currently reading", "currently_reading", organizedBooks.currently_reading)}
        {renderBookShelf("Finished", "completed", organizedBooks.completed)}
      </YStack>
    </YStack>
  );
};

export default ShelvesBlock;
