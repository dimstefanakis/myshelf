import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { Button, Text, TextInput } from "@/components/Themed";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { set } from "react-hook-form";

const AddJournalEntryScreen = ({ route, navigation }: any) => {
  const [journalData, setJournalData] = useState<{
    title: string;
    users_book: string;
    description: string;
  }>({
    title: "",
    users_book: "",
    description: "",
  });

  const [journalToEdit, setJournalToEdit] = useState<{
    id: string;
    title: string | null;
    description: string | null;
  }>({ id: "", title: null, description: null });

  const user = useUser();
  const { books } = useUserBooksStore();

  const { id } = route.params || {}; 

  const uploadData = async () => {
    if (!journalData.title || !journalData.description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const { data, error } = await supabase.from("journals").insert([journalData]);

    if (error) {
      console.error("Error inserting data", error);
      Alert.alert("Error", "Failed to insert journal data.");
    } else {
      Alert.alert("Success", "Journal entry created successfully.");
      navigation.goBack();
    }
  }

  // if id exists then we are editing an existing journal entry
  useEffect(() => {
    if (id) {
      const getJournalEntry = async () => {
        const { data, error } = await supabase
          .from("journals")
          .select("*")
          .eq("id", id || "")
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }
        setJournalToEdit(data);
      };
      getJournalEntry();
    }
  }, [id]);

  const updateJournalEntry = async () => {
    const { data, error } = await supabase
      .from("journals")
      .update({
        title: journalToEdit.title,
        description: journalToEdit.description,
      })
      .eq("id", journalToEdit.id);

    if (error) {
      console.error("Error updating data:", error);
      return;
    }
    console.log("Data updated successfully");
    navigation.goBack();
  };

  const deleteJournalEntry = async () => {
    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", journalToEdit.id);

    if (error) {
      console.error("Error deleting data:", error);
      return;
    }
    console.log("Data deleted successfully");
    navigation.goBack();
  };

  useEffect(() => {
    if (books?.length && !journalData.users_book) {
      setJournalData((prevData) => ({
        ...prevData,
        users_book: books[0]?.id || "",
      }));
    }
  }, [user, books]);

  const handleChange = (name: string, value: any) => {
    if (id) {
      setJournalToEdit({ ...journalToEdit, [name]: value });
    } else {
      setJournalData({ ...journalData, [name]: value });
    }
  };

  

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "white" }}>
      {/* {image && (
        <Image source={{ uri: image.uri }} style={{ width: 200, height: 200, margin: 20 }} />
      )} */}
      <TextInput
        style={styles.input}
        onChangeText={(text) => handleChange("title", text)}
        // if id exists then we are editing an existing journal entry
        defaultValue={journalToEdit.title ? journalToEdit.title : ""}
        placeholder="Title"
      />
      <TextInput
        placeholder="Description"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        placeholderTextColor={"#9E9E9E"}
        onChangeText={(text) => handleChange("description", text)}
        defaultValue={
          journalToEdit.description ? journalToEdit.description : ""
        }
      />

      {id ? (
        <>
          <Button style={styles.submitButton} onPress={updateJournalEntry}>
            <Text style={{ color: "white" }}>Update</Text>
          </Button>
          <Button style={styles.deleteButton} onPress={deleteJournalEntry}>
            <Text style={{ color: "white" }}>Delete</Text>
          </Button>
        </>
      ) : (
        <>
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
          <Button style={styles.submitButton} onPress={uploadData}>
            <Text style={{ color: "white" }}>Add</Text>
          </Button>
        </>
      )}
    </View>
  );
};

export default AddJournalEntryScreen;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    margin: 20,
  },
  multilineInput: {
    height: 120,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  submitButton: {
    // backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    width: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  deleteButton: {
    backgroundColor: "red",
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
    backgroundColor: "#e7e7e7",
    borderRadius: 8,
    marginBottom: 20,
  },
});
