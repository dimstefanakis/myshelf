import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import BookScreen from "@/components/JournalBookQuotes/bookNotes";
import JournalScreen from "@/components/JournalBookQuotes/journal";
import QuoteScreen from "@/components/JournalBookQuotes/quotes";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused } from "@react-navigation/native"; // Import useIsFocused hook

const JournalLanding = () => {

  const [pageIndex, setPageIndex] = useState(0);

  return (
 
    
      <View style={{ height: "100%"}}>
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

// Styles for the header and header text
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