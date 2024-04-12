import React, { useState, useEffect, useLayoutEffect } from "react";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import {
  StyleSheet,
  Touchable,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BookScreen from "@/components/JournalTabScreens/bookNotes";
import JournalScreen from "@/components/JournalTabScreens/journal";
import QuoteScreen from "@/components/JournalTabScreens/quotes";
import { Button, Text, View } from "@/components/Themed";
import useUser from "@/hooks/useUser";

const JournalLanding = ({ navigation }: any) => {
  const user = useUser();
  const [pageIndex, setPageIndex] = useState(0);

  const getButtonStyle = (index: number) => ({
    ...styles.buttonCs,
    backgroundColor: pageIndex === index ? "black" : "white", // Changes the background color
    borderWidth: 0, // Optional: remove border if active for better visibility
  });

  const getTextStyle = (index: number) => ({
    color: pageIndex === index ? "white" : "black", // Changes the text color
  });

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted) {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (!result?.canceled) {
        navigation.navigate("AddBookNoteEntryScreen", {
          image: result.assets[0],
          user: user,
        });
      }
    } else {
    }
  };

  function navigateToNoteEntry() {
    navigation.navigate("AddBookNoteEntryScreen");
  }

  function navigateToQuoteEntry() {
    navigation.navigate("AddQuoteEntryScreen");
  }

  function navigateToJournalEntry() {
    navigation.navigate("AddJournalEntryScreen");
  }

  useEffect(() => {
    const titles = ["Journal", "Book Notes", "Quotes"];
    const headerColors = ["#ff9999", "#99ccff", "#99ff99"];

    navigation.setOptions({
      headerTitle: titles[pageIndex],
      headerRight:
        pageIndex === 1
          ? () => (
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <TouchableOpacity
                  onPress={openCamera}
                  style={{ marginRight: 10 }}
                >
                  <Entypo name="camera" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={navigateToNoteEntry}>
                  <Entypo name="plus" size={24} color="black" />
                </TouchableOpacity>
              </View>
            )
          : pageIndex === 0 || pageIndex === 2
            ? () => (
                <TouchableOpacity
                  onPress={() => {
                    if (pageIndex == 0) {
                      navigateToJournalEntry();
                    } else {
                      navigateToQuoteEntry();
                    }
                  }}
                >
                  <Entypo name="plus" size={24} color="black" />
                </TouchableOpacity>
              )
            : null,
      // headerStyle: {
      //   backgroundColor: headerColors[pageIndex],
      // },
      // headerTintColor: "black",
    });
  }, [pageIndex, navigation]);

  return (
    <View style={{ height: "100%" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 10,
        }}
      >
        <Pressable style={getButtonStyle(0)} onPress={() => setPageIndex(0)}>
          <Text style={getTextStyle(0)}>Journal</Text>
        </Pressable>
        <Pressable style={getButtonStyle(1)} onPress={() => setPageIndex(1)}>
          <Text style={getTextStyle(1)}>Book Notes</Text>
        </Pressable>
        <Pressable style={getButtonStyle(2)} onPress={() => setPageIndex(2)}>
          <Text style={getTextStyle(2)}>Quotes</Text>
        </Pressable>
      </View>
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
  buttonCs: {
    borderWidth: 1,
    borderColor: "black",
    padding: 10,
    borderRadius: 4,
    width: "33%",
    alignItems: "center",
  },
});

export default JournalLanding;
