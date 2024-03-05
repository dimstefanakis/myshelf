import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Touchable } from "react-native";
import BookScreen from "@/components/JournalBookQuotes/bookNotes";
import JournalScreen from "@/components/JournalBookQuotes/journal";
import QuoteScreen from "@/components/JournalBookQuotes/quotes";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router"
import useUser from "@/hooks/useUser";


const JournalLanding = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const user = useUser();
  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
    });
  
    if (!result?.canceled) {
      // Assuming you have a mechanism to pass the image data to ModalContentScreen
      // For example, using React Navigation's parameter passing
      router.navigate('modalContent', { image: result.assets[0],user:user });
    }
  };

  const [pageIndex, setPageIndex] = useState(0);

  useLayoutEffect(() => {
    const titles = ["Journal", "Book Notes", "Quotes"];
    const headerColors = ['#ff9999', '#99ccff', '#99ff99']; 

    navigation.setOptions({ headerTitle: titles[pageIndex], 
    headerRight: pageIndex === 0 ? () => (
      <TouchableOpacity onPress={
        openCamera
      }>

      <Entypo name="camera" size={24} color="black" />
      </TouchableOpacity>
    ) : undefined ,
    headerStyle: {
      backgroundColor: headerColors[pageIndex], 
    },
    headerTintColor: '#fff',
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
        <Button title="Journal" onPress={() => setPageIndex(0)} />
        <Button title="Book Notes" onPress={() => setPageIndex(1)} />
        <Button title="Quotes" onPress={() => setPageIndex(2)} />
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
});

export default JournalLanding;
