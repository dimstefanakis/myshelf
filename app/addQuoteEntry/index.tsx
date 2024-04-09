import { View, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { Text, TextInput, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

const AddQuoteEntryScreen = () => {
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    title: "",
    author: "",
    users_book: "",
  });
  const navigation = useNavigation();
  const user = useUser();
  const { books } = useUserBooksStore();

  useEffect(() => {
    if (books?.length && !quoteData.users_book) {
      setQuoteData((prevData) => ({
        ...prevData,
        users_book: books[0]?.id || "",
      }));
    }
  }, [user, books]);

  const handleChange = (name: string, value: any) => {
    setQuoteData({
      ...quoteData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .insert([{ ...quoteData }]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    setLoading(false);
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
        data={books.map((book) => book.book.title) || []}
        onSelect={(selectedItem, index) => {
          handleChange("users_book", books[index].id);
        }}
        buttonTextAfterSelection={(selectedItem) => selectedItem}
        rowTextForSelection={(item) => item}
        buttonStyle={styles.dropdown1BtnStyle}
        defaultButtonText="Select a book"
      />
      <Button onPress={handleSubmit} style={styles.Touchable}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white" }}>Create Quote</Text>
        )}
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
