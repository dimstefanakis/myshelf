import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import BookScreen from "@/components/JournalBookQuotes/bookNotes";
import JournalScreen from "@/components/JournalBookQuotes/journal";
import QuoteScreen from "@/components/JournalBookQuotes/quotes";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";

const JournalLanding = () => {
  const navigation = useNavigation();

  const [pageIndex, setPageIndex] = useState(0);

  useLayoutEffect(() => {
    const titles = ["Journal", "Book Notes", "Quotes"];
    const headerColors = ['#ff9999', '#99ccff', '#99ff99']; 

    navigation.setOptions({ headerTitle: titles[pageIndex], 
    headerRight: pageIndex === 0 ? () => (
      <Entypo name="camera" size={24} color="black" />
    ) : undefined ,
    headerStyle: {
      backgroundColor: headerColors[pageIndex], 
    },
    headerTintColor: '#fff',
  });
}, [pageIndex, navigation]);



  return (
    <View style={{ height: "100%" }}>
      {/* Buttons to switch views */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 10,
        }}
      >
        <Button title="Journal" onPress={() => setPageIndex(0)} />
        <Button title="Book Notes" onPress={() => setPageIndex(1)} />
        <Button title="Quotes" onPress={() => setPageIndex(2)} />
      </View>
      {/* View to display */}
      <View style={{ height: "100%" }}>
        {pageIndex === 0 && <JournalScreen />}
        {pageIndex === 1 && <BookScreen />}
        {pageIndex === 2 && <QuoteScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    color: "black",
  },
});

export default JournalLanding;
