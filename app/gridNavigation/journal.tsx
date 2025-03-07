import React, { useEffect, useState, useRef } from "react";
import { Portal } from "@gorhom/portal";
import { NativeSyntheticEvent, NativeScrollEvent, Pressable, FlatList } from "react-native";
import { Animated } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { router, useNavigation } from "expo-router";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useJournalStore } from "@/store/journalStore";
import { Share } from "react-native";
import { FontAwesome6, Feather, Entypo } from "@expo/vector-icons";
import {
  YStack, XStack, ScrollView, Text, Input, Button, Card, Image,
  styled, View, Paragraph, useTheme, Sheet
} from "tamagui";
import type { Note, Journal, Quote } from "@/store/journalStore";
import { ChevronLeft } from "@tamagui/lucide-icons";

interface CombinedFeedItem extends Note, Journal, Quote {
  type: string;
}

type GroupedFeedItem = {
  bookId: string;
  bookTitle: string;
  coverUrl: string;
  items: CombinedFeedItem[];
};

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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
  const [isBookFilterOpen, setIsBookFilterOpen] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

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

  const getUniqueBooks = () => {
    const books = new Map()
    combinedFeed.forEach(item => {
      const book = item.users_book.book
      if (!books.has(book.id)) {
        books.set(book.id, book)
      }
    })
    return Array.from(books.values())
  }

  const filteredFeed = combinedFeed.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.users_book?.book.title?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesBook = !selectedBookId || item.users_book.book.id === selectedBookId

    if (activeFilter) {
      switch (activeFilter) {
        case 'note':
          return matchesSearch && matchesBook &&
            (item.type === 'journal' || (item.type === 'note' && !item.image_url));
        case 'photo':
          return matchesSearch && item.type === 'note' && item.image_url;
        case 'quote':
          return matchesSearch && matchesBook && item.type === 'quote';
        default:
          return false;
      }
    }

    return matchesSearch && matchesBook &&
      (item.type === 'journal' || item.type === 'quote' ||
        (item.type === 'note' && !item.image_url));
  })

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
    borderWidth: 1,
    borderColor: "$orange6",
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

  const renderItem = ({ item }: { item: any }) => (
    <FeedCard>
      {renderFeedItem(item)}
    </FeedCard>
  );

  const ListHeaderComponent = () => {
    const inputRef = useRef(null);

    return (
      <YStack space="$4">
        <Animated.View
          style={{
            opacity: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
            transform: [{
              translateY: scrollY.interpolate({
                inputRange: [0, 50],
                outputRange: [0, -50],
                extrapolate: 'clamp',
              })
            }]
          }}
        >
          <Input
            ref={inputRef}
            placeholder="Search your entries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="$orange2"
            borderColor="$orange4"
            fontSize="$4"
            autoCorrect
            focusStyle={{ borderColor: "$orange10" }}
          />
        </Animated.View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$2" paddingVertical="$2">
            <Button
              backgroundColor={selectedBookId ? "$orange10" : "$orange2"}
              borderColor="$orange4"
              borderWidth={1}
              borderRadius="$4"
              onPress={() => setIsBookFilterOpen(true)}
            >
              <XStack space="$2" alignItems="center">
                <Feather
                  name="book-open"
                  size={16}
                  color={selectedBookId ? "white" : "$orange11"}
                />
                <Text
                  color={selectedBookId ? "white" : "$orange11"}
                  numberOfLines={1}
                >
                  {selectedBookId
                    ? combinedFeed.find(item => item.users_book.book.id === selectedBookId)?.users_book.book.title
                    : "Select Book"}
                </Text>
              </XStack>
            </Button>
            <FilterPill
              active={activeFilter === 'note'}
              onPress={() => setActiveFilter(activeFilter === 'note' ? null : 'note')}
            >
              <XStack space="$2" alignItems="center">
                <Feather name="book" size={16} color={activeFilter === 'note' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'note' ? "white" : "$orange11"}>Notes</Text>
              </XStack>
            </FilterPill>
            <FilterPill
              active={activeFilter === 'photo'}
              onPress={() => setActiveFilter(activeFilter === 'photo' ? null : 'photo')}
            >
              <XStack space="$2" alignItems="center">
                <Feather name="camera" size={16} color={activeFilter === 'photo' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'photo' ? "white" : "$orange11"}>Photos</Text>
              </XStack>
            </FilterPill>
            <FilterPill
              active={activeFilter === 'quote'}
              onPress={() => setActiveFilter(activeFilter === 'quote' ? null : 'quote')}
            >
              <XStack space="$2" alignItems="center">
                <Entypo name="quote" size={16} color={activeFilter === 'quote' ? "white" : "$orange11"} />
                <Text color={activeFilter === 'quote' ? "white" : "$orange11"}>Quotes</Text>
              </XStack>
            </FilterPill>
          </XStack>
        </ScrollView>
      </YStack>
    );
  };

  const FloatingActionButton = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigation = useNavigation();
    const scale = useRef(new Animated.Value(1)).current;
    const buttonsAnimation = useRef(new Animated.Value(0)).current;

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: isExpanded ? 1 : 0.9,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsAnimation, {
          toValue: isExpanded ? 0 : 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        })
      ]).start();
    };

    // Different positions for each button
    const getAnimatedStyle = (position: 'left' | 'topRight' | 'corner') => {
      const positions = {
        left: {
          translateX: buttonsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -80],
          }),
          translateY: 0,
        },
        topRight: {
          translateX: buttonsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -56],
          }),
          translateY: buttonsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -56],
          }),
        },
        corner: {
          translateX: 0,
          translateY: buttonsAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -80],
          }),
        },
      };

      return {
        opacity: buttonsAnimation,
        transform: [
          { translateX: positions[position].translateX },
          { translateY: positions[position].translateY },
          {
            scale: buttonsAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          },
        ],
      };
    };

    return (
      <YStack
        position="absolute"
        bottom={16}
        right={16}
        alignItems="center"
        justifyContent="center"
      >
        <Animated.View
          style={[
            { position: 'absolute' },
            getAnimatedStyle('left')
          ]}
        >
          <Button
            circular
            size="$5"
            backgroundColor="$orange10"
            icon={<Feather name="camera" color="white" size={24} />}
            onPress={() => {
              toggleExpanded();
              openCamera();
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            { position: 'absolute' },
            getAnimatedStyle('topRight')
          ]}
        >
          <Button
            circular
            size="$5"
            backgroundColor="$orange10"
            icon={<Entypo name="quote" color="white" size={24} />}
            onPress={() => {
              toggleExpanded();
              router.push("/addQuoteEntry");
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            { position: 'absolute' },
            getAnimatedStyle('corner')
          ]}
        >
          <Button
            circular
            size="$5"
            backgroundColor="$orange10"
            icon={<Feather name="book" color="white" size={24} />}
            onPress={() => {
              toggleExpanded();
              router.push("/addJournalEntry");
            }}
          />
        </Animated.View>

        <Button
          circular
          size="$6"
          backgroundColor="$orange10"
          icon={<Entypo name={isExpanded ? "cross" : "plus"} color="white" size={24} />}
          onPress={toggleExpanded}
          pressStyle={{ backgroundColor: "$orange8" }}
          animation="quick"
        />
      </YStack>
    );
  };

  const ListEmptyComponent = () => (
    <YStack alignItems="center" padding="$8">
      <Text color="$orange11" fontSize="$5">No entries found</Text>
      <Text color="$orange11" fontSize="$3">Try adjusting your search or filters</Text>
    </YStack>
  );

  const BookFilterSheet = () => (
    <Sheet
      modal
      open={isBookFilterOpen}
      onOpenChange={setIsBookFilterOpen}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay chromeless />
      <Sheet.Frame>
        <Sheet.Handle />
        <YStack padding="$4" space="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$6" fontWeight="bold" color="$orange11">Select Book</Text>
            {selectedBookId && (
              <Button
                size="$3"
                backgroundColor="$orange2"
                borderColor="$orange4"
                borderWidth={1}
                onPress={() => {
                  setSelectedBookId(null)
                  setIsBookFilterOpen(false)
                }}
              >
                <Text color="$orange11">Show All</Text>
              </Button>
            )}
          </XStack>

          <ScrollView>
            <XStack flexWrap="wrap" gap="$4" justifyContent="space-between">
              {getUniqueBooks().map(book => (
                <Button
                  key={book.id}
                  width="47%"
                  height={200}
                  backgroundColor="$orange2"
                  borderColor={selectedBookId === book.id ? "$orange10" : "$orange4"}
                  borderWidth={2}
                  padding="$2"
                  onPress={() => {
                    setSelectedBookId(book.id)
                    setIsBookFilterOpen(false)
                  }}
                >
                  <YStack flex={1} space="$2" alignItems="center">
                    <Image
                      source={{ uri: book.cover_url }}
                      width="100%"
                      height="70%"
                      borderRadius="$2"
                      resizeMode="contain"
                    />
                    <Text
                      color="$orange11"
                      numberOfLines={2}
                      textAlign="center"
                      fontSize="$3"
                    >
                      {book.title}
                    </Text>
                  </YStack>
                </Button>
              ))}
            </XStack>
          </ScrollView>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )

  return (
    <SafeAreaViewFixed style={{ flex: 1 }}>
      <Button
        borderRadius={100}
        w={50}
        h={50}
        chromeless
        icon={<ChevronLeft size={24} color="$gray10" />}
        onPress={() => router.back()}
      />

      <YStack flex={1}>
        <YStack paddingHorizontal="$4">
          <Input
            placeholder="Search journal..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="$orange2"
            borderColor="$orange4"
            fontSize="$4"
            autoCorrect={false}
            selectTextOnFocus
            focusStyle={{ borderColor: "$orange10" }}
          />
        </YStack>
        <AnimatedFlatList
          data={filteredFeed}
          renderItem={renderItem}
          keyExtractor={(item: any) => `${item.type}-${item.id}`}
          ListHeaderComponent={() => (
            <YStack space="$4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack space="$2" paddingVertical="$2">
                  <Button
                    backgroundColor={selectedBookId ? "$orange10" : "$orange2"}
                    borderColor="$orange4"
                    borderWidth={1}
                    borderRadius="$4"
                    onPress={() => setIsBookFilterOpen(true)}
                  >
                    <XStack space="$2" alignItems="center">
                      <Feather
                        name="book-open"
                        size={16}
                        color={selectedBookId ? "white" : "$orange11"}
                      />
                      <Text
                        color={selectedBookId ? "white" : "$orange11"}
                        numberOfLines={1}
                      >
                        {selectedBookId
                          ? combinedFeed.find(item => item.users_book.book.id === selectedBookId)?.users_book.book.title
                          : "Select Book"}
                      </Text>
                    </XStack>
                  </Button>
                  <FilterPill
                    active={activeFilter === 'note'}
                    onPress={() => setActiveFilter(activeFilter === 'note' ? null : 'note')}
                  >
                    <XStack space="$2" alignItems="center">
                      <Feather name="book" size={16} color={activeFilter === 'note' ? "white" : "$orange11"} />
                      <Text color={activeFilter === 'note' ? "white" : "$orange11"}>Notes</Text>
                    </XStack>
                  </FilterPill>
                  <FilterPill
                    active={activeFilter === 'photo'}
                    onPress={() => setActiveFilter(activeFilter === 'photo' ? null : 'photo')}
                  >
                    <XStack space="$2" alignItems="center">
                      <Feather name="camera" size={16} color={activeFilter === 'photo' ? "white" : "$orange11"} />
                      <Text color={activeFilter === 'photo' ? "white" : "$orange11"}>Photos</Text>
                    </XStack>
                  </FilterPill>
                  <FilterPill
                    active={activeFilter === 'quote'}
                    onPress={() => setActiveFilter(activeFilter === 'quote' ? null : 'quote')}
                  >
                    <XStack space="$2" alignItems="center">
                      <Entypo name="quote" size={16} color={activeFilter === 'quote' ? "white" : "$orange11"} />
                      <Text color={activeFilter === 'quote' ? "white" : "$orange11"}>Quotes</Text>
                    </XStack>
                  </FilterPill>
                </XStack>
              </ScrollView>
            </YStack>
          )}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={{ padding: 16, gap: 16 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />

        <FloatingActionButton />
        <BookFilterSheet />
      </YStack>
    </SafeAreaViewFixed>
  );
};

const NoteItem = ({ item }: { item: Note }) => (
  <Pressable
    onPress={() => {
      router.push({
        pathname: "/addBookNoteEntry",
        params: {
          id: item.id,
          cover_image: item.users_book?.book?.cover_url
        }
      });
    }}
  >
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
  </Pressable>
);

const JournalItem = ({ item }: { item: Journal }) => (
  <Pressable
    onPress={() => {
      router.push({
        pathname: "/addJournalEntry",
        params: { id: item.id }
      });
    }}
  >
    <YStack space="$2">
      <Text color="$orange11" fontSize="$4" fontWeight="bold">
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      <Text fontSize="$5" fontWeight="bold">{item.title}</Text>
      <Paragraph>{item.description}</Paragraph>
    </YStack>
  </Pressable>
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
    <Pressable
      onPress={() => {
        router.push({
          pathname: "/addQuoteEntry",
          params: { id: item.id }
        });
      }}
    >
      <YStack space="$4">
        <XStack space="$3" alignItems="center">
          <Image
            source={{ uri: item.users_book.book.cover_url || "" }}
            width={40}
            height={60}
            borderRadius="$2"
          />
          <YStack flex={1}>
            <Text fontSize="$3" fontWeight="bold" color="$orange11" numberOfLines={1}>
              {item.users_book.book.title}
            </Text>
            <Text fontSize="$2" color="$orange11" opacity={0.8}>
              {item.author}
            </Text>
          </YStack>
        </XStack>

        <YStack
          backgroundColor="$orange4"
          padding="$4"
          borderRadius="$4"
          borderLeftWidth={4}
          borderLeftColor="$orange10"
        >
          <Text fontSize="$5" fontStyle="italic" color="$orange11">
            "{item.title}"
          </Text>
        </YStack>

        <XStack justifyContent="flex-end" space="$2">
          <Button
            size="$3"
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: "$orange4" }}
            onPress={onShare}
            icon={
              <XStack space="$2" alignItems="center">
                <FontAwesome6 name="share-square" size={16} color="$orange11" />
                <Text color="$orange11">Share</Text>
              </XStack>
            }
          />
          <Button
            size="$3"
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: "$orange4" }}
            onPress={toggleLike}
            icon={
              <XStack space="$2" alignItems="center">
                <FontAwesome6
                  name={liked ? "heart" : "heart"}
                  size={16}
                  color={liked ? "$red10" : "$orange11"}
                />
                <Text color={liked ? "$red10" : "$orange11"}>
                  {liked ? "Liked" : "Like"}
                </Text>
              </XStack>
            }
          />
        </XStack>
      </YStack>
    </Pressable>
  );
};

export default CombinedFeedScreen;
