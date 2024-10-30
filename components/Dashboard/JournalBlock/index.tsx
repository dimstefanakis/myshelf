import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import useUser from "@/hooks/useUser";
import { useJournalStore } from "@/store/journalStore";
import { YStack, XStack, Text, Separator, Image, Paragraph, Button } from "tamagui";
import { Feather } from "@expo/vector-icons";
import type { Note, Journal, Quote } from "@/store/journalStore";

interface CombinedFeedItem extends Note, Journal, Quote {
  type: string;
}

const JournalBlock = () => {
  const { session } = useUser();
  const navigation = useNavigation();
  const { notes, journal, quotes } = useJournalStore();
  const [recentItems, setRecentItems] = useState<CombinedFeedItem[]>([]);

  useEffect(() => {
    if (session?.user?.id) {
      combineAndSortRecentItems();
    }
  }, [session?.user?.id, notes, journal, quotes]);

  const combineAndSortRecentItems = () => {
    const combined = [
      ...notes.map(item => ({ ...item, type: 'note' })),
      ...journal.map(item => ({ ...item, type: 'journal' })),
      ...quotes.map(item => ({ ...item, type: 'quote' }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());


    setRecentItems(combined.slice(0, 3) as CombinedFeedItem[]);
  };

  const renderItem = (item: CombinedFeedItem) => {
    switch (item.type) {
      case 'note':
        return (
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="bold">{item.title}</Text>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} aspectRatio={16 / 9} />
            )}
            <Paragraph numberOfLines={2}>{item.description}</Paragraph>
          </YStack>
        );
      case 'journal':
        return (
          <YStack space="$2">
            <Text fontSize="$3" fontWeight="bold">{item.title}</Text>
            <Paragraph numberOfLines={2}>{item.description}</Paragraph>
          </YStack>
        );
      case 'quote':
        return (
          <YStack space="$2">
            <Paragraph fontSize="$3" fontStyle="italic">"{item.title}"</Paragraph>
            <Text fontSize="$2">{item.author}</Text>
          </YStack>
        );
      default:
        return null;
    }
  };

  return (
    <YStack
      width="100%"
      height={300}
      backgroundColor="$background"
      borderRadius="$2"
      borderColor="$borderColor"
      borderWidth={1}
      onPress={() => navigation.navigate('Journal')}

    >
      <XStack justifyContent="space-between" alignItems="center" padding="$3">
        <Text fontSize="$5" fontWeight="bold">Journal</Text>
      </XStack>
      <YStack space="$3" padding="$3">
        {recentItems.map((item, index) => (
          <React.Fragment key={`${item.type}-${item.id}`}>
            {renderItem(item)}
            {index < recentItems.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </YStack>
    </YStack>
  );
};

export default JournalBlock;
