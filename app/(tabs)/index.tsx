import React from "react";
import { Text, View, Image, SafeAreaView } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import TopNavBar from "@/components/topNavBar";
import { registerRootComponent } from "expo";

const data = [
  {
    title: "Journal",
    image: require("./../../assets/images/placeholder.jpg"),
  },
  {
    title: "Habit Logbook",
    image: require("./../../assets/images/placeholder.jpg"),
  },
  {
    title: "Map",
    image: require("./../../assets/images/placeholder.jpg"),
  },
  {
    title: "Chronology",
    image: require("./../../assets/images/placeholder.jpg"),
  },
  {
    title: "Goal Tracker",
    image: require("./../../assets/images/placeholder.jpg"),
  },
  {
    title: "Community",
    image: require("./../../assets/images/placeholder.jpg"),
  },
];

function HomepageContainers() {
  const navigation = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <TopNavBar />
        {data.map((item, index) => (
          <View key={index} style={styles.item}>
            <TouchableOpacity
              // navigate to /components/JournalRoutes/index.tsx
              onPress={() =>
                item.title === "Journal"
                  ? navigation.navigate("LandingPage/journalLanding")
                  : item.title === "Habit Logbook"
                    ? navigation.navigate("LandingPage/habitLogbook")
                    : item.title === "Map"
                      ? navigation.navigate("LandingPage/mapLanding")
                      : item.title === "Chronology"
                        ? navigation.navigate("LandingPage/chronology")
                        : item.title === "Goal Tracker"
                          ? navigation.navigate("LandingPage/goalTracker")
                          : item.title === "Community"
                            ? navigation.navigate("LandingPage/community")
                            : null
              }
            >
              <View style={styles.textcontainer}>
                <Text style={styles.text}>{item.title}</Text>
              </View>
              <View style={styles.imagecontainer}>
                <Image source={item.image} style={styles.image} />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    padding: 10,
    height: "100%",
    backgroundColor: "white",
  },
  item: {
    width: "35%",
    backgroundColor: "blue",
    margin: "5%",
    marginTop: "4%",
    height: 150,
  },
  textcontainer: {
    height: "50%",
    backgroundColor: "#e0bf90",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 17,
    color: "black",
    textAlign: "center",
    flexWrap: "wrap",
    padding: 8,
  },
  imagecontainer: {
    height: "50%",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default HomepageContainers;
