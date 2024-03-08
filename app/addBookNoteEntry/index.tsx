import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { Text, TextInput, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

const AddBookNoteEntryScreen = () => {
  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    users_book: "",
  });
  const navigation = useNavigation();
  const user = useUser();

  useEffect(() => {
    if (user?.user?.books?.length && !bookData.users_book) {
      setBookData((prevData) => ({
        ...prevData,
        users_book: user?.user?.books[0]?.id || "",
      }));
    }
  }, [user]);

  const handleChange = (name: string, value: any) => {
    setBookData({
      ...bookData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from("notes")
      .insert([{ ...bookData, user: user?.user?.id }]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
      <TextInput
        placeholder="Title"
        style={styles.input}
        onChangeText={(text) => handleChange("title", text)}
      />
      <TextInput
        placeholder="Description"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        onChangeText={(text) => handleChange("description", text)}
      />

      <SelectDropdown
        data={user?.user?.books.map((book) => book.book.title) || []}
        onSelect={(selectedItem, index) => {
          handleChange("users_book", user?.user?.books[index].id);
        }}
        buttonTextAfterSelection={(selectedItem) => selectedItem}
        rowTextForSelection={(item) => item}
        buttonStyle={styles.dropdown1BtnStyle}
        defaultButtonText="Select a book"
      />
      <Button onPress={handleSubmit} style={styles.Touchable}>
        <Text style={{ color: "white" }}>Submit</Text>
      </Button>
    </View>
  );
};

export default AddBookNoteEntryScreen;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  multilineInput: {
    height: 120,
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    textAlignVertical: "top",
    marginTop: 20,
    marginBottom: 20,
  },
  dropdown1BtnStyle: {
    width: "80%",
    height: 50,
    backgroundColor: "#e7e7e7",
    borderRadius: 8,
    marginBottom: 20,
  },
  Touchable: {
    backgroundColor: "black",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
});
