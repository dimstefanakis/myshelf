import React from "react";
import { Image } from "expo-image";
import { Dimensions, View, LayoutChangeEvent } from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Feather } from '@expo/vector-icons';
import { Stack, XStack, YStack, Text, Button } from "tamagui";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import JournalBlock from "@/components/Dashboard/JournalBlock";
import ShelvesBlock from "@/components/Dashboard/ShelvesBlock";
import { FlashList } from "@shopify/flash-list";

const data = [
  {
    type: 'journal',
    title: "Journal Block",
  },
  {
    type: 'shelves',
    title: "Shelves Block",
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
    type: 'regular',
    title: "Goal Tracker",
    image: require("./../../assets/images/goals.jpg"),
  },
  {
    type: 'regular',
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
  type: 'journal' | 'shelves' | 'regular';
  title: string;
  image?: any;
  id: number;
};

function HomepageContainers() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const spacing = 8;

  const renderItem = ({ item }: { item: Item }) => {
    if (item.type === 'journal') {
      return (
        <YStack 
          marginHorizontal={spacing/2}
          width={(screenWidth - spacing * 3) / 2}
        >
          <JournalBlock />
        </YStack>
      );
    }

    if (item.type === 'shelves') {
      return (
        <YStack 
          marginHorizontal={spacing/2}
          width={(screenWidth - spacing * 3) / 2}
        >
          <ShelvesBlock />
        </YStack>
      );
    }

    return (
      <Button 
        onPress={() => handlePress(item.title)} 
        margin={spacing/2}
        width={(screenWidth - spacing * 3) / 2}
      >
        <YStack
          backgroundColor="#e0bf90"
          padding="$2"
        >
          <Text fontSize={17} color="black" textAlign="center">
            {item.title}
          </Text>
        </YStack>
        <YStack padding="$2">
          <Text>Dynamic content for {item.title}</Text>
        </YStack>
      </Button>
    );
  };

  const handlePress = (name: string) => {
    switch (name) {
      case "Journal":
        navigation.navigate("Journal");
        break;
      case "Chronology":
        navigation.navigate("Chronology");
        break;
      case "Map":
        navigation.navigate("Map");
        break;
      case "Habit Logbook":
        navigation.navigate("HabitLogBook");
        break;
      case "Goal Tracker":
        navigation.navigate("GoalTracker");
        break;
      case "Statistics":
        navigation.navigate("Statistics");
        break;
    }
  };

  return (
    <YStack flex={1} padding="$2">
      <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2" paddingHorizontal="$4">
        <Button
          icon={<Feather name="user" size={24} color="$color" />}
          unstyled
        />
        <Button
          icon={<Feather name="search" size={24} color="$color" />}
          onPress={() => navigation.navigate('Search')}
          unstyled
        />
      </XStack>

      <FlashList
        data={data}
        renderItem={renderItem}
        estimatedItemSize={200}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: spacing/2 }}
      />
    </YStack>
  );
}

export default HomepageContainers;
