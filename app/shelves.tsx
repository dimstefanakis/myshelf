import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useUserBooksStore } from "@/store/userBooksStore";
import { supabase } from "@/utils/supabase";
import type { UserBook } from "@/store/userBooksStore";

// import EditScreenInfo from '@/components/topNavBar';
import { Text, View, Button, XStack } from "tamagui";
import useUser from "@/hooks/useUser";
import { ChevronLeft } from '@tamagui/lucide-icons';

type Shelf = {
  id: string;
  title: string;
};

const shelves = [
  {
    id: "currently_reading",
    title: "Currently Reading",
  },
  {
    id: "completed",
    title: "Completed",
  },
  {
    id: "future_reading",
    title: "To Read",
  },
];

export default function MyShelfScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { books } = useUserBooksStore();
  const [customShelves, setCustomShelves] = useState(shelves);

  const addNewShelf = () => {
    // TODO: Add modal/input for new shelf name
    setCustomShelves([...customShelves, {
      id: `custom_${Date.now()}`,
      title: "New Shelf",
    }]);
  };

  const renderShelfContent = (shelf: Shelf, books: UserBook[]) => {
    const shelfBooks = books?.filter((book: UserBook) => book.status === shelf.id) || [];
    
    if (shelfBooks.length === 0) {
      return (
        <View style={styles.emptyShelfContainer}>
          <TouchableOpacity 
            style={styles.skeletonBook}
            onPress={() => router.push('/search')}
          >
            <View style={styles.skeletonBookInner}>
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.addBookText}>Add Book</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.shelfScrollContent}
      >
        {shelfBooks.map((user_book) => (
          <TouchableOpacity
            key={user_book.id}
            style={styles.bookContainer}
            onPress={() => router.push(`/removeFromShelf/${user_book.id}`)}
          >
            <Image
              contentFit="contain"
              style={styles.bookCover}
              source={{ uri: user_book.book.cover_url || "" }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <XStack>
        <Button
          borderRadius={100}
          w={50}
          h={50}
          chromeless
          icon={<ChevronLeft size={24} color="$gray10" />}
          onPress={() => router.back()}
        />
        <XStack flex={1}></XStack>
      </XStack>

      <Text style={styles.header}>My Library</Text>
      {customShelves.map((shelf) => (
        <View key={shelf.id} style={styles.shelfContainer}>
          <Text style={styles.shelfTitle}>{shelf.title}</Text>
          <View style={styles.shelf}>
            {renderShelfContent(shelf, books)}
          </View>
          {/* <View style={styles.shelfEdge} />
          <View style={styles.shelfSupport} />
          <View style={styles.shelfSupportLeft} /> */}
        </View>
      ))}
      
      <Button
        backgroundColor="$orange10"
        pressStyle={{ backgroundColor: '$orange8' }}
        onPress={addNewShelf}
        size="$6"
        marginVertical="$4"
        marginHorizontal="$4"
        borderRadius="$10"
      >
        <Text color="white">+ Add New Shelf</Text>
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$orange2',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '$orange11',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  shelfContainer: {
    marginBottom: 40,
    position: 'relative',
    paddingBottom: 24,
  },
  shelfTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '$orange11',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  shelf: {
    backgroundColor: '$orange4',
    minHeight: 180,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  shelfEdge: {
    height: 15,
    backgroundColor: '$orange8',
    marginTop: -1,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  shelfSupport: {
    position: 'absolute',
    bottom: 0,
    right: 40,
    width: 24,
    height: 24,
    backgroundColor: '$orange8',
    transform: [{ skewX: '45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  shelfSupportLeft: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    width: 24,
    height: 24,
    backgroundColor: '$orange8',
    transform: [{ skewX: '-45deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  shelfScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  emptyShelfContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  skeletonBook: {
    width: 100,
    height: 150,
    backgroundColor: '$orange4',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '$orange8',
  },
  skeletonBookInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    color: '$orange11',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addBookText: {
    color: '$orange11',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyShelfText: {
    color: '$orange11',
    fontSize: 14,
    textAlign: 'center',
  },
  bookContainer: {
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  bookCover: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  addShelfButton: {
    backgroundColor: '$orange10',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  addShelfText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
