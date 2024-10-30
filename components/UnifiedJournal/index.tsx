import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useJournalStore } from "@/store/journalStore";
import { Share } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  YStack, XStack, ScrollView, Text, Input, Button, Card, Image,
  styled, View, Paragraph
} from "tamagui";
import type { Note, Journal, Quote } from "@/store/journalStore";

interface CombinedFeedItem extends Note, Journal, Quote {
  type: string;
}

const CombinedFeedScreen = () => {
  const { session } = useUser();
  const navigation = useNavigation();
  const { notes, journal, quotes, setNotes, setJournal, setQuotes } = useJournalStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [combinedFeed, setCombinedFeed] = useState<CombinedFeedItem[]>([]);

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
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.users_book?.book.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFeedItem = (item: CombinedFeedItem) => {
    switch (item.type) {
      case 'note':
        return <NoteCard item={item} />;
      case 'journal':
        return <JournalCard item={item} />;
      case 'quote':
        return <QuoteCard item={item} />;
      default:
        return null;
    }
  };

  return (
    <YStack flex={1} padding="$4">
        <Input
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          marginBottom="$4"
        />
      <ScrollView>
        <YStack space="$4" paddingBottom="$4">
          {filteredFeed.map((item, index) => (
            <View key={`${item.type}-${item.id}`}>
              {renderFeedItem(item)}
            </View>
          ))}
        </YStack>
      </ScrollView>
    </YStack>
  );
};

const NoteCard = ({ item }: { item: Note }) => (
  <Card elevate size="$4">
    <Card.Header padded>
      <Text fontSize="$5" fontWeight="bold">{item.title}</Text>
    </Card.Header>
    <Card.Footer padded>
      <Paragraph numberOfLines={2}>{item.description}</Paragraph>
    </Card.Footer>
  </Card>
);

const JournalCard = ({ item }: { item: Journal }) => (
  <Card elevate size="$4">
    <Card.Header padded>
      <Text fontSize="$4" fontWeight="bold">
        {new Date(item.created_at).toLocaleDateString()} - {item.title}
      </Text>
    </Card.Header>
    <Card.Footer padded>
      <Paragraph numberOfLines={2}>{item.description}</Paragraph>
    </Card.Footer>
  </Card>
);

const QuoteCard = ({ item }: { item: Quote }) => {
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
    <Card elevate size="$4">
      <Card.Header padded>
        <Paragraph fontSize="$4" fontStyle="italic">"{item.title}"</Paragraph>
      </Card.Header>
      <Card.Footer padded>
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
      </Card.Footer>
    </Card>
  );
};

export default CombinedFeedScreen;