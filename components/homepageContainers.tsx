import React from "react";
import { Text, View, Image } from "react-native";
import { StyleSheet } from "react-native";

const data = [
  { title: "Journal", image: require("../assets/images/placeholderimagelibrbary.jpg") },
  { title: "Habit Logbook", image: require("../assets/images/placeholderimagelibrbary.jpg") },
  { title: "Map", image: require("../assets/images/placeholderimagelibrbary.jpg") },
  { title: "Chronology", image: require("../assets/images/placeholderimagelibrbary.jpg") },
  { title: "Goal Tracker", image: require("../assets/images/placeholderimagelibrbary.jpg") },
  { title: "Community", image: require("../assets/images/placeholderimagelibrbary.jpg") }
];

function HomepageContainers() {
  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={styles.textcontainer}>
            <Text style={styles.text}>{item.title}</Text>
          </View>
          <View style={styles.imagecontainer}>
            <Image source={item.image} style={styles.image} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default HomepageContainers;

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
