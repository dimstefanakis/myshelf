import React, { useEffect, useState, useRef } from "react";
import { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Animated } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router, useNavigation } from "expo-router";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useJournalStore } from "@/store/journalStore";
import { Share } from "react-native";
import { FontAwesome6, Feather, Entypo } from "@expo/vector-icons";
import {
  YStack, XStack, ScrollView, Text, Input, Button, Card, Image,
  styled, View, Paragraph, useTheme
} from "tamagui";
import type { Note, Journal, Quote } from "@/store/journalStore";

interface CombinedFeedItem extends Note, Journal, Quote {
  type: string;
}

const CombinedFeedScreen = () => {
  const { session, user } = useUser();
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notes, journal, quotes, setNotes, setJournal, setQuotes } = useJournalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [combinedFeed, setCombinedFeed] = useState<CombinedFeedItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchHeight = useRef(new Animated.Value(0)).current;
  const searchMargin = useRef(new Animated.Value(0)).current;

  const getNotes = async () => {
    let { data, error } = await supabase
      .from("notes")
      .select(`
        id,
        title,
        description,
        created_at,
        user,
        image_url,
        users_book (*, book (*))
      `)
      .eq("users_book.user", session?.user?.id || "");
    if (error) {
      console.error("Error fetching notes:", error);
      return;
    }
    setNotes(data as unknown as Note[]);
  };

  const getJournal = async () => {
    let { data, error } = await supabase
      .from("journals")
      .select("*, users_book(book(*), *)")
      .eq("users_book.user", session?.user?.id || "");
    if (error) {
      console.error("Error fetching journal entries:", error);
      return;
    }
    setJournal(data as unknown as Journal[]);
  };

  const getQuotes = async () => {
    let { data, error } = await supabase
      .from("quotes")
      .select("*, users_book(*, book(*))")
      .eq("users_book.user", session?.user?.id || "")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching quotes:", error);
      return;
    }
    setQuotes(data as unknown as Quote[]);
  };

  useEffect(() => {
    if (session?.user?.id) {
      getNotes();
      getJournal();
      getQuotes();
      listenToUpdates();
    }
  }, [session?.user?.id]);

  const listenToUpdates = () => {
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, getNotes)
      .on("postgres_changes", { event: "*", schema: "public", table: "journals" }, getJournal)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, getQuotes)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    const combined = [
      ...notes.map(item => ({ ...item, type: 'note' })),
      ...journal.map(item => ({ ...item, type: 'journal' })),
      ...quotes.map(item => ({ ...item, type: 'quote' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setCombinedFeed(combined as unknown as CombinedFeedItem[]);
  }, [notes, journal, quotes]);

  const filteredFeed = combinedFeed.filter(item =>
    (item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.users_book?.book.title?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (!activeFilter || item.type === activeFilter)
  );

  const renderFeedItem = (item: CombinedFeedItem) => {
    switch (item.type) {
      case 'note':
        return <NoteItem item={item} />;
      case 'journal':
        return <JournalItem item={item} />;
      case 'quote':
        return <QuoteItem item={item} />;
      default:
        return null;
    }
  };

  const FilterPill = styled(Button, {
    borderRadius: 9999,
    backgroundColor: "$orange4",
    paddingHorizontal: "$4",
    paddingVertical: "$2",
    variants: {
      active: {
        true: {
          backgroundColor: "$orange10",
        },
      },
    },
  });

  const FeedCard = styled(Card, {
    backgroundColor: "$orange2",
    padding: "$4",
    marginBottom: "$3",
    borderRadius: "$4",
  });

  const ActionBar = styled(XStack, {
    backgroundColor: "$orange10",
    borderRadius: 9999,
    padding: "$2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  });

  const ActionButton = styled(Button, {
    backgroundColor: "transparent",
    // width: 50,
    // height: 50,
    borderRadius: 25,
    marginHorizontal: "$2",
    pressStyle: {
      backgroundColor: "$orange8",
    },
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsSearchVisible(offsetY > 50 || filteredFeed.length === 0);
      }
    }
  );

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result?.canceled) {
        navigation.navigate("AddBookNoteEntryScreen", {
          image: result.assets[0],
          user: user,
        });
      }
    } else {
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(searchHeight, {
        toValue: isSearchVisible ? 50 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(searchMargin, {
        toValue: isSearchVisible ? 16 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isSearchVisible]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" space="$4">
        <Animated.View
          style={{
            height: searchHeight,
            marginBottom: searchMargin,
            opacity: isSearchVisible ? 1 : searchOpacity,
          }}
        >
          <Input
            placeholder="Search your entries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="$orange2"
            borderColor="$orange4"
            fontSize="$4"
          />
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$2" paddingVertical="$2">
            <FilterPill
              active={activeFilter === 'note'}
              onPress={() => setActiveFilter(activeFilter === 'note' ? null : 'note')}
            >
              <XStack space="$2" alignItems="center">
                <Feather name="camera" size={16} color={activeFilter === 'note' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'note' ? "white" : "$orange11"}>Photos</Text>
              </XStack>
            </FilterPill>
            <FilterPill
              active={activeFilter === 'journal'}
              onPress={() => setActiveFilter(activeFilter === 'journal' ? null : 'journal')}
            >
              <XStack space="$2" alignItems="center">
                <Feather name="book" size={16} color={activeFilter === 'journal' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'journal' ? "white" : "$orange11"}>Notes</Text>
              </XStack>
            </FilterPill>
            <FilterPill
              active={activeFilter === 'quote'}
              onPress={() => setActiveFilter(activeFilter === 'quote' ? null : 'quote')}
            >
              <XStack space="$2" alignItems="center">
                <Entypo name="quote" size={16} color={activeFilter === 'quote' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'quote' ? "white" : "$orange11"}>Highlights</Text>
              </XStack>
            </FilterPill>
          </XStack>
        </ScrollView>

        <Animated.ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <YStack space="$4">
            {filteredFeed.length > 0 ? (
              filteredFeed.map((item) => (
                <FeedCard key={`${item.type}-${item.id}`}>
                  {renderFeedItem(item)}
                </FeedCard>
              ))
            ) : (
              <YStack alignItems="center" padding="$8">
                <Text color="$orange11" fontSize="$5">No entries found</Text>
                <Text color="$orange11" fontSize="$3">Try adjusting your search or filters</Text>
              </YStack>
            )}
          </YStack>
        </Animated.ScrollView>
      </YStack>

      <XStack
        position="absolute"
        bottom={16}
        left={0}
        right={0}
        justifyContent="center"
        paddingHorizontal="$4"
      >
        <ActionBar>
          <ActionButton
            onPress={openCamera}
            icon={<Feather name="camera" color="white" size={24} />}
          />
          <ActionButton
            onPress={() => navigation.navigate("AddQuoteEntryScreen")}
            icon={<Entypo name="quote" color="white" size={24} />}
          />
          <ActionButton
            onPress={() => navigation.navigate("AddJournalEntryScreen")}
            icon={<Feather name="book" color="white" size={24} />}
          />
        </ActionBar>
      </XStack>
    </YStack>
  );
};

const NoteItem = ({ item }: { item: Note }) => (
  <YStack space="$2">
    <Text color="$orange11" fontSize="$5" fontWeight="bold">{item.title}</Text>
    <Paragraph>{item.description}</Paragraph>
    {item.image_url && (
      <Image
        source={{ uri: item.image_url }}
        aspectRatio={16 / 9}
        borderRadius="$2"
        objectFit="cover"
      />
    )}
  </YStack>
);

const JournalItem = ({ item }: { item: Journal }) => (
  <YStack space="$2">
    <Text color="$orange11" fontSize="$4" fontWeight="bold">
      {new Date(item.created_at).toLocaleDateString()}
    </Text>
    <Text fontSize="$5" fontWeight="bold">{item.title}</Text>
    <Paragraph>{item.description}</Paragraph>
  </YStack>
);

const QuoteItem = ({ item }: { item: Quote }) => {
  const [liked, setLiked] = useState(item.liked);

  const onShare = async () => {
    await Share.share({
      message: `${item.title}\n- ${item.author}, ${item.users_book.book.title}`,
    });
  };

  const toggleLike = async () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    const { error } = await supabase
      .from("quotes")
      .update({ liked: newLikedState })
      .eq("id", item.id);
    if (error) {
      console.error("Error updating quote like status:", error);
      setLiked(!newLikedState);
    }
  };

  return (
    <YStack space="$3">
      <Paragraph fontSize="$4" fontStyle="italic" color="$orange11">
        "{item.title}"
      </Paragraph>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3">{item.author}, {item.users_book.book.title}</Text>
        <XStack space="$2">
          <Button
            backgroundColor="$orange4"
            pressStyle={{ backgroundColor: "$orange8" }}
            icon={<FontAwesome6 name="share-square" color="$orange11" />}
            onPress={onShare}
          />
          <Button
            backgroundColor="$orange4"
            pressStyle={{ backgroundColor: "$orange8" }}
            icon={<FontAwesome6 
              name={liked ? "heart" : "heart-o"} 
              color={liked ? "$red10" : "$orange11"} 
            />}
            onPress={toggleLike}
          />
        </XStack>
      </XStack>
    </YStack>
  );
};

export default CombinedFeedScreen;
