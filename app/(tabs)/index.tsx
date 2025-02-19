import React from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Dimensions, View, LayoutChangeEvent } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import { Stack, XStack, YStack, Text, Button, useTheme } from "tamagui";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SafeAreaViewFixed from "@/components/SafeAreaView";
import JournalBlock from "@/components/Dashboard/JournalBlock";
import ShelvesBlock from "@/components/Dashboard/ShelvesBlock";
import StatisticsBlock from "@/components/Dashboard/StatisticsBlock";
import GoalTrackerBlock from "@/components/Dashboard/GoalTrackerBlock";
import MapBlock from "@/components/Dashboard/MapBlock";
import { FlashList, MasonryFlashList } from "@shopify/flash-list";
import Colors from "@/constants/Colors";

const data = [
  {
    type: 'journal',
    title: "Journal Block",
    image: '',
  },
  {
    type: 'shelves',
    title: "Shelves Block",
    image: '',
  },
  {
    type: 'regular',
    title: "Journal",
    image: require("./../../assets/images/journal.jpg"),
  },
  {
    type: 'regular',
    title: "Habit Logbook",
    image: require("./../../assets/images/habit_logbook.jpg"),
  },
  {
    type: 'regular',
    title: "Map",
    image: require("./../../assets/images/map.jpg"),
  },
  {
    type: 'regular',
    title: "Chronology",
    image: require("./../../assets/images/chronology.jpg"),
  },
  {
    type: 'goalTracker',
    title: "Goal Tracker",
    image: require("./../../assets/images/goals.jpg"),
  },
  {
    type: 'map',
    title: "Map",
    image: require("./../../assets/images/map.jpg"),
  },
  {
    type: '',
    title: "",
    image: '',
  },
  {
    type: 'statistics',
    title: "Statistics",
    image: require("./../../assets/images/stats-min.jpeg"),
  },
].map((item, index) => ({ ...item, id: index }));

export type RootStackParamList = {
  Home: undefined;
  Journal: undefined;
  Map: undefined;
  Chronology: undefined;
  Search: undefined;
  HabitLogBook: undefined;
  GoalTracker: undefined;
  Statistics: undefined;
};

type Item = {
  type: 'journal' | 'shelves' | 'regular' | 'goalTracker' | 'statistics' | 'map';
  title: string;
  image?: any;
  id: number;
};

function HomepageContainers() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const spacing = 16;

  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === 'journal') {
      return (
        <YStack
          marginHorizontal={spacing / 2}
          marginBottom={spacing / 2}
          width={(screenWidth - spacing * 2) / 2}
        >
          <JournalBlock />
        </YStack>
      );
    }

    if (item.type === 'shelves') {
      return (
        <YStack
          marginHorizontal={spacing / 2}
          marginBottom={spacing / 2}
          width={(screenWidth - spacing * 2) / 2}
        >
          <ShelvesBlock />
        </YStack>
      );
    }

    if (item.type === 'statistics') {
      return (
        <YStack
          marginHorizontal={spacing / 2}
          marginBottom={spacing / 2}
          width={(screenWidth - spacing * 2) / 2}
        >
          <StatisticsBlock />
        </YStack>
      );
    }

    if (item.type === 'goalTracker') {
      return (
        <YStack
          marginHorizontal={spacing / 2}
          marginBottom={spacing / 2}
          width={(screenWidth - spacing * 2) / 2}
        >
          <GoalTrackerBlock />
        </YStack>
      );
    }

    if (item.type === 'map') {
      return (
        <YStack
          marginHorizontal={spacing / 2}
          marginBottom={spacing / 2}
          width={(screenWidth - spacing * 2) / 2}
        >
          <MapBlock />
        </YStack>
      );
    }

    return null;
  };

  return (
    <YStack bg="white" flex={1}>
      <SafeAreaViewFixed style={{ flex: 1 }}>
        <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2" paddingHorizontal="$4">
          <Button
            icon={<Feather name="user" size={24} color="$color" />}
            unstyled
            onPress={() => router.push('/profile')}
          />
          <Button
            icon={<Feather name="search" size={24} color="$color" />}
            onPress={() => router.push('/search')}
            unstyled
          />
        </XStack>

        <YStack flex={1} justifyContent="center" paddingTop="$3" paddingLeft="$1" paddingRight="$2">
          <MasonryFlashList
            data={data as Item[]}
            renderItem={renderItem}
            estimatedItemSize={200}
            numColumns={2}
          />
        </YStack>
      </SafeAreaViewFixed>
    </YStack>
  );
}

export default HomepageContainers;
