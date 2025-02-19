import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { YStack, XStack, Text, Circle, View } from "tamagui";
import { supabase } from "@/utils/supabase";
import { VictoryPie } from "victory-native";

interface GenreData {
  x: string;
  y: number;
  label: string;
}

const StatisticsBlock = () => {
  const { user } = useUser();
  const router = useRouter();
  const { books } = useUserBooksStore();
  const [topGenres, setTopGenres] = useState<GenreData[]>([]);

  const getBooksGenre = async () => {
    let query = supabase
      .from("users_books")
      .select(
        `
        id,
        book:books (
          id,
          book_tags (*,
            tags (name)
          )
        )
      `
      )
      .eq("user", user?.id ? user.id : "")

    let { data: fetchedBooks, error } = await query;

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    if (fetchedBooks) {
      const genreCounts = fetchedBooks.reduce<Record<string, number>>(
        (acc, book) => {
          const tags = book?.book?.book_tags.map((tag: any) => tag.tags.name);
          tags?.forEach((tag: any) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
          return acc;
        },
        {}
      );

      const totalGenreAssignments = Object.values(genreCounts).reduce(
        (total, count) => total + count,
        0
      );

      const dataForGenre: GenreData[] = Object.keys(genreCounts)
        .map((genre) => ({
          x: genre,
          y: (genreCounts[genre] / totalGenreAssignments) * 100,
          label: ``,
        }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 3);

      setTopGenres(dataForGenre);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getBooksGenre();
    }
  }, [user?.id, books]);

  const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D"];

  return (
    <YStack
      width="100%"
      backgroundColor='$orange2'
      borderRadius="$2"
      borderColor="$orange6"
      borderWidth={1}
      onPress={() => router.push('/statistics')}
    >
      <XStack justifyContent="space-between" alignItems="center" padding="$3">
        <Text fontSize="$5" fontWeight="bold">Statistics</Text>
      </XStack>

      <YStack flex={1} padding="$3" alignItems="center">
        <View pointerEvents="none">
          {topGenres.length > 0 && (
            <VictoryPie
              data={topGenres}
              width={130}
              height={130}
              innerRadius={35}
              padding={0}
              colorScale={colors}
              labels={() => null}
              style={{
                data: {
                  strokeWidth: 0,
                }
              }}
            />
          )}
        </View>

        <YStack space="$2" marginTop="$3" width="100%">
          <Text fontSize="$3" fontWeight="bold" textAlign="left">Top Genres</Text>
          {topGenres.map((genre, index) => (
            <XStack key={genre.x} alignItems="center" space="$2" width="100%" justifyContent="space-between">
              <XStack alignItems="center" space="$2">
                <Circle size={10} backgroundColor={colors[index]} />
                <Text fontSize="$3" numberOfLines={1} ellipsizeMode='tail' maxWidth={100}>{genre.x}</Text>
              </XStack>
              <Text fontSize="$3" color="$gray10" >
                {genre.label}
              </Text>
            </XStack>
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
};

export default StatisticsBlock;