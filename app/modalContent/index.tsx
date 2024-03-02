import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import SelectDropdown from 'react-native-select-dropdown';
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";

const ModalContentScreen = () => {
  const [journalData, setJournalData] = useState({
    title: "",
    book: "",
    description: "",
  });

  const user = useUser();

  // Assuming useUser() correctly fetches and sets the user data, including their books
  useEffect(() => {
    // Optionally, pre-select a book if necessary
    if (user?.user?.books?.length?user.user.books.length > 0 && !journalData.book : "") {
      setJournalData({ ...journalData, book: user?.user?.books[0].id? user.user.books[0].id : "" });
    }
  }, [user]);

  const handleChange = (name:any, value:any) => {
    setJournalData({ ...journalData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from("journals")
        .insert([{
          title: journalData.title,
          users_book: journalData.book,
          description: journalData.description,
        }]);

      if (error) throw new Error(error.message);
      console.log("Submitted data:", data);
    } catch (error) {
      console.error("error");
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      {/* Text Inputs for Title and Description */}
      <TextInput
        placeholder="Title"
        style={styles.input}
        onChangeText={(text) => handleChange('title', text)}
      />
      <SelectDropdown
        data={user?.user?.books.map(book => book.book.title) || []}
        onSelect={(selectedItem, index) => {
          handleChange('book', user?.user?.books[index].id);
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
        onChangeText={(text) => handleChange('description', text)}
      />
      {/* Submit Button View */}
      <Text style={styles.submitButtonText} onPress={handleSubmit}>
        Submit
      </Text>
    </View>
  );
};

export default ModalContentScreen;


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
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdown1BtnStyle: {
    width: '80%',
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 20
    },
});

