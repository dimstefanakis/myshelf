import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

const ModalContentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [journalData, setJournalData] = useState({
    title: "",
    book: "",
    description: "",
  });

  const user = useUser();

  useEffect(() => {
    if (
      user?.user?.books?.length
        ? user.user.books.length > 0 && !journalData.book
        : ""
    ) {
      setJournalData({
        ...journalData,
        book: user?.user?.books[0].id ? user.user.books[0].id : "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (route.params?.imageUri) {
      setImageUri(route.params.imageUri);
    }
  }, [route.params]);

  const handleChange = (name, value) => {
    setJournalData({ ...journalData, [name]: value });
  };

  const selectImage = async () => {
    const options : ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.cancelled) {
      const img =result.assets[0]
      const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
      const filePath =`${new Date().getTime()}.${img.type === 'image' ? 'png' : 'mp4'} ` 
      const contentType = img.type === 'image' ? 'image/png' : 'video/mp4'
      await supabase.storage.from('images').upload(filePath, decode(base64), { contentType });

    }
  }
 
    const handleSubmit =() => {
      selectImage()
      }



  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
      <TextInput
        placeholder="Title"
        style={styles.input}
        onChangeText={(text) => handleChange("title", text)}
      />
      <SelectDropdown
        data={user?.user?.books.map((book) => book.book.title) || []}
        onSelect={(selectedItem, index) => {
          handleChange("book", user?.user?.books[index].id);
        }}
        buttonTextAfterSelection={(selectedItem, index) => {
          return selectedItem;
        }}
        rowTextForSelection={(item, index) => {
          return item;
        }}
        buttonStyle={styles.dropdown1BtnStyle}
      />
      <TextInput
        placeholder="Description"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        onChangeText={(text) => handleChange("description", text)}
      />
      <Text style={styles.submitButtonText} onPress={handleSubmit}>
        Capture & Submit
      </Text>
    </View>
  );
};

export default ModalContentScreen;

// Styles remain unchanged

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
  multilineInput: {
    height: 120,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    textAlignVertical: "top",
    margin: 20,
  },
  submitButton: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    width: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  submitButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdown1BtnStyle: {
    width: "80%",
    height: 50,
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#444",
    marginBottom: 20,
  },
});
