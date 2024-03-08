import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Touchable,
  Pressable,
} from "react-native";
import BookScreen from "@/components/JournalTabScreens/bookNotes";
import JournalScreen from "@/components/JournalTabScreens/journal";
import QuoteScreen from "@/components/JournalTabScreens/quotes";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import useUser from "@/hooks/useUser";
import { useLocalSearchParams } from "expo-router";

const JournalLanding = ({ navigation }: any) => {
  const user = useUser();
  const [pageIndex, setPageIndex] = useState(0);

  const getButtonStyle = (index: number) => ({
    ...styles.buttonCs,
    backgroundColor: pageIndex === index ? "black" : "white", // Changes the background color
    borderWidth: pageIndex === index ? 0 : 1, // Optional: remove border if active for better visibility
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
        navigation.navigate("AddJournalEntryScreen", {
          image: result.assets[0],
          user: user,
        });
      }
    } else {
    }
  };

  useLayoutEffect(() => {
    const titles = ["Journal", "Book Notes", "Quotes"];
    const headerColors = ["#ff9999", "#99ccff", "#99ff99"];

    navigation.setOptions({
      headerTitle: titles[pageIndex],
      headerRight:
        pageIndex === 0
          ? () => (
              <TouchableOpacity onPress={openCamera}>
                <Entypo name="camera" size={24} color="black" />
              </TouchableOpacity>
            )
          : undefined,
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
    borderRadius: 5,
    width: "33%",
    alignItems: "center",
  },
});

export default JournalLanding;
