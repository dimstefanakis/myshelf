import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { Text, TextInput, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

const AddQuoteEntryScreen = () => {
  const [quoteData, setQuoteData] = useState({
    title: "",
    author: "",
    users_book: "",
  });
  const navigation = useNavigation();
  const user = useUser();

  useEffect(() => {
    if (user?.user?.books?.length && !quoteData.users_book) {
      setQuoteData((prevData) => ({
        ...prevData,
        users_book: user?.user?.books[0]?.id || "",
      }));
    }
  }, [user]);

  const handleChange = (name: string, value: any) => {
    setQuoteData({
      ...quoteData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from("quotes")
      .insert([{ ...quoteData }]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
      <TextInput
        placeholder="Author (optional)"
        style={styles.input}
        onChangeText={(text) => handleChange("author", text)}
      />
      <TextInput
        placeholder="Quote"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        onChangeText={(text) => handleChange("title", text)}
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
        <Text style={{ color: "white" }}>Create Quote</Text>
      </Button>
    </View>
  );
};

export default AddQuoteEntryScreen;

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
