import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import JournalScreen from "../JournalRoutes/journalScreen";
import BookScreen from "../JournalRoutes/bookScreen";
import QuotesScreen from "../JournalRoutes/quoteScreen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native"; // Import useIsFocused hook

const JournalLanding = () => {
  // async function to get data from the database

  // State to track the current view, background color, and header details
  const [currentView, setCurrentView] = useState("Journal");
  const [bgColor, setBgColor] = useState("yellow");
  const [header, setHeader] = useState({
    title: "Journal",
    bgColor: "darkorange",
  });
  const isFocused = useIsFocused(); // Hook to determine if the screen is focused

  // Combined function for changing view, setting background color, and header details
  const changeView = (view: any) => {
    setCurrentView(view);
    switch (view) {
      case "Journal":
        // setBackgroundColor('darkorange');
        setHeader({ title: "Journal", bgColor: "darkorange" });
        break;
      case "Book Notes":
        // setBackgroundColor('navy');
        setHeader({ title: "Book Notes", bgColor: "navy" });
        break;
      case "Quotes":
        // setBackgroundColor('darkgreen');
        setHeader({ title: "Quotes", bgColor: "darkgreen" });
        break;
      default:
        // setBackgroundColor('darkorange'); // Default color
        setHeader({ title: "Journal", bgColor: "darkorange" });
    }
  };

  // Render the current view based on the state
  const renderCurrentView = () => {
    switch (currentView) {
      case "Journal":
        return <JournalScreen />;
      case "Book Notes":
        return <BookScreen />;
      case "Quotes":
        return <QuotesScreen />;
      default:
        return <JournalScreen />;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,

        backgroundColor: header.bgColor,
      }}
      edges={["top"]}
    >
      <View style={{ height: "100%", backgroundColor: bgColor }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: header.bgColor }]}>
          <Text style={styles.headerText}>{header.title}</Text>
        </View>

        {/* Buttons to switch views */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            paddingTop: 10,
          }}
        >
          <Button title="Journal" onPress={() => changeView("Journal")} />
          <Button title="Book Notes" onPress={() => changeView("Book Notes")} />
          <Button title="Quotes" onPress={() => changeView("Quotes")} />
        </View>

        {/* View container for the content */}
        <View style={{ paddingTop: 20 }}>{renderCurrentView()}</View>
      </View>
    </SafeAreaView>
  );
};

// Styles for the header and header text
const styles = StyleSheet.create({
  header: {
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    color: "white",
  },
});

export default JournalLanding;
