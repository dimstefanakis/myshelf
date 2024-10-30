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

  const FilterButton = styled(Button, {
    borderRadius: 9999,
    variants: {
      active: {
        true: {
          backgroundColor: "$background",
          color: "$color",
          borderWidth: 2,
          borderColor: "$color",
        },
        false: {
          backgroundColor: "$color",
          color: "$background",
        },
      },
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
        toValue: isSearchVisible ? 50 : 0, // Increased from 40 to 50
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

  const FloatingBar = styled(XStack, {
    transform: [
      { translateY: -25 }, // Half of the approximate height of the bar
    ],
    backgroundColor: '$color',
    borderRadius: 9999,
    padding: '$1',
    justifyContent: 'center',
    alignItems: 'center',
  });

  const IconButton = styled(Button, {
    backgroundColor: 'transparent',
    borderRadius: 9999,
    padding: '$4',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  });

  return (
    <YStack flex={1}>
      <YStack padding="$4" space="$4">
        <Animated.View style={{
          height: searchHeight,
          marginBottom: searchMargin,
          opacity: isSearchVisible ? 1 : searchOpacity,
          overflow: 'hidden',
        }}>
          <Input
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <XStack space="$2">
          <FilterButton
            active={activeFilter === 'note'}
            onPress={() => setActiveFilter(activeFilter === 'note' ? null : 'note')}
          >
            Photos
          </FilterButton>
          <FilterButton
            active={activeFilter === 'journal'}
            onPress={() => setActiveFilter(activeFilter === 'journal' ? null : 'journal')}
          >
            Notes
          </FilterButton>
          <FilterButton
            active={activeFilter === 'quote'}
            onPress={() => setActiveFilter(activeFilter === 'quote' ? null : 'quote')}
          >
            Highlights
          </FilterButton>
        </XStack>

        <Animated.ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingTop: 16 }}
        >
          <YStack space="$4">
            {filteredFeed.length > 0 ? (
              filteredFeed.map((item, index) => (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  {index > 0 && <Separator />}
                  {renderFeedItem(item)}
                </React.Fragment>
              ))
            ) : (
              <Text>No results found</Text>
            )}
          </YStack>
        </Animated.ScrollView>
      </YStack>
      <XStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        justifyContent="center"
        alignItems="center"
        paddingBottom="$4"
      >
        <FloatingBar>
          <IconButton
            themeInverse
            onPress={openCamera}
            icon={<Feather name="camera" color={theme?.background?.val} size={20} />}
          />
          <IconButton
            themeInverse
            onPress={() => {
              navigation.navigate("AddQuoteEntryScreen");
            }}
            icon={<Entypo name="quote" color={theme?.background?.val} size={20} />}
          />
          <IconButton
            themeInverse
            onPress={() => {
              navigation.navigate("AddJournalEntryScreen");
            }}
            icon={<Feather name="book" color={theme?.background?.val} size={20} />}
          />
        </FloatingBar>
      </XStack>
    </YStack>
  );
};

const NoteItem = ({ item }: { item: Note }) => (
  <YStack space="$2" paddingVertical="$4">
    <Text fontSize="$5" fontWeight="bold">{item.title}</Text>
    <Paragraph>{item.description}</Paragraph>
    {item.image_url && (
      <Image
        source={{ uri: item.image_url }}
        aspectRatio={16 / 9}
        objectFit="cover"
        marginTop="$2"
      />
    )}
  </YStack>
);

const JournalItem = ({ item }: { item: Journal }) => (
  <YStack space="$2" paddingVertical="$4">
    <Text fontSize="$4" fontWeight="bold">
      {new Date(item.created_at).toLocaleDateString()} - {item.title}
    </Text>
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
      setLiked(!newLikedState); // Revert on error
    }
  };

  return (
    <YStack space="$2" paddingVertical="$4">
      <Paragraph fontSize="$4" fontStyle="italic">"{item.title}"</Paragraph>
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$3">{item.author}, {item.users_book.book.title}</Text>
        <XStack space="$2">
          <Button icon={<FontAwesome6 name="share-square" />} onPress={onShare} />
          <Button
            icon={<FontAwesome6 name={liked ? "heart" : "heart-o"} color={liked ? "$red10" : undefined} />}
            onPress={toggleLike}
          />
        </XStack>
      </XStack>
    </YStack>
  );
};

function Separator() {
  return <View height={1} backgroundColor="$borderColor" marginVertical="$2" />;
}

export default CombinedFeedScreen;
