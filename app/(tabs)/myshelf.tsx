import { useState, useEffect } from "react";
import { StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useUserBooksStore } from "@/store/userBooksStore";
import { supabase } from "@/utils/supabase";

// import EditScreenInfo from '@/components/topNavBar';
import { Text, View, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";

const tabs = [
  {
    id: "gallery",
    title: "Gallery",
  },
  {
    id: "shelves",
    title: "Shelves",
  },
];

const shelves = [
  {
    id: "currently_reading",
    title: "Currently Reading",
    image: require("./../../assets/images/currently_reading.png"),
  },
  {
    id: "completed",
    title: "Completed",
    image: require("./../../assets/images/completed.png"),
  },
  {
    id: "future_reading",
    title: "To Read",
    image: require("./../../assets/images/to_read.png"),
  },
  {
    id: "for_studies",
    title: "For Studies",
  },
];

export default function MyShelfScreen() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.id}
            style={[
              styles.tab,
              selectedTab.id === tab.id && styles.selectedTab,
            ]}
          >
            <Text
              style={[
                styles.tabTitle,
                selectedTab.id === tab.id && styles.selectedTabTitle,
              ]}
              onPress={() => setSelectedTab(tab)}
            >
              {tab.title}
            </Text>
          </View>
        ))}
      </View>
      {
        {
          gallery: <Gallery />,
          shelves: <Shelves />,
        }[selectedTab.id]
      }
    </View>
  );
}

function Gallery() {
  const router = useRouter();

  function onCurrentReadingPress() {
    router.push("/bookList/currently_reading");
  }

  function onCompletedPress() {
    router.push("/bookList/completed");
  }

  function onToReadPress() {
    router.push("/bookList/future_reading");
  }

  return (
    <View>
      <View style={styles.galleryItem}>
        <Button
          style={styles.galleryItemButton}
          onPress={onCurrentReadingPress}
        >
          <Text style={styles.galleryItemButtonText}>Currently reading</Text>
        </Button>
        <Image
          style={{ width: 150, height: 150, marginLeft: 20 }}
          source={require("./../../assets/images/currently_reading.png")}
        />
      </View>
      <View style={styles.galleryItem}>
        <Button style={styles.galleryItemButton} onPress={onCompletedPress}>
          <Text style={styles.galleryItemButtonText}>Completed books</Text>
        </Button>
        <Image
          style={{ width: 150, height: 150, marginLeft: 20 }}
          source={require("./../../assets/images/completed.png")}
        />
      </View>
      <View style={styles.galleryItem}>
        <Button style={styles.galleryItemButton} onPress={onToReadPress}>
          <Text style={styles.galleryItemButtonText}>Books to read</Text>
        </Button>
        <Image
          style={{ width: 150, height: 150, marginLeft: 20 }}
          source={require("./../../assets/images/to_read.png")}
        />
      </View>
    </View>
  );
}

function Shelves() {
  const { user } = useUser();
  const { books } = useUserBooksStore();
  return (
    <View style={{ width: "100%" }}>
      {shelves.map((shelf) => (
        <View
          style={{
            minWidth: "100%",
            alignItems: "flex-start",
            position: "relative",
            borderBottomWidth: 3,
            borderColor: "black",
          }}
        >
          <Text style={{ marginVertical: 10, marginHorizontal: 10 }}>
            {shelf.title}
          </Text>
          <View
            style={{
              backgroundColor: "#D2B48C",
              height: 10,
              position: "absolute",
              left: 0,
              bottom: 0,
              width: "100%",
              zIndex: 1000,
            }}
          ></View>
          <ScrollView
            key={shelf.id}
            horizontal={true}
            style={{ height: "17%" }}
            contentContainerStyle={{ minWidth: "100%" }}
          >
            {books
              ?.filter((book) => book.status === shelf.id)
              .map((user_book) => {
                return (
                  <Image
                    key={user_book.id}
                    contentFit="contain"
                    style={{ width: 70, marginHorizontal: 10 }}
                    source={{ uri: user_book.book.cover_url || "" }}
                  />
                );
              })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 40,
    marginVertical: 20,
  },
  tab: {
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 4,
    // borderBottomWidth: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedTab: {
    backgroundColor: "black",
    borderColor: "black",
  },
  tabTitle: {
    fontSize: 20,
  },
  selectedTabTitle: {
    color: "white",
  },
  placeholderBox: {
    width: 150,
    height: 150,
    backgroundColor: "lightgray",
    marginLeft: 20,
  },
  galleryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  galleryItemButtonText: {
    fontWeight: "600",
    color: "white",
  },
  galleryItemButton: {
    backgroundColor: "#7EB0B8",
    height: 50,
    borderRadius: 10,
    width: "45%",
    paddingHorizontal: 0,
  },
});
