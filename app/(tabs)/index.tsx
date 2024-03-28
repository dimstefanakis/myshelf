import React, { useEffect } from "react";
import { Text, SafeAreaView } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import TopNavBar from "@/components/topNavBar";
import { View } from "@/components/Themed";
import { supabase } from "@/utils/supabase";

const data = [
  {
    title: "Journal",
    image: require("./../../assets/images/journal.jpg"),
  },
  {
    title: "Habit Logbook",
    image: require("./../../assets/images/habit_logbook.jpg"),
  },
  {
    title: "Map",
    image: require("./../../assets/images/map.jpg"),
  },
  {
    title: "Chronology",
    image: require("./../../assets/images/chronology.jpg"),
  },
  {
    title: "GoalTracker",
    image: require("./../../assets/images/goals.jpg"),
  },
  {
    title: "Community",
    image: require("./../../assets/images/placeholder.jpg"),
  },
];
export type RootStackParamList = {
  Home: undefined;
  Journal: undefined;
  Map: undefined;
  Chronology: undefined;
  Search: undefined;
  GoalTracker: undefined;
};
function HomepageContainers() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

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
      case "GoalTracker":
        navigation.navigate("GoalTracker");
        break;
    }
  };

  return (
    // <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
    <View style={styles.container}>
      <TopNavBar />
      {data.map((item, index) => (
        <View key={index} style={styles.item}>
          <TouchableOpacity onPress={() => handlePress(item.title)}>
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
    // </SafeAreaView>
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
  },
  item: {
    width: "35%",
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
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default HomepageContainers;
