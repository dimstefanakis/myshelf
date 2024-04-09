import { View, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { Text, TextInput, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { set } from "react-hook-form";
import { Alert } from "react-native";

const AddBookNoteEntryScreen = ({ route, nav }: any) => {
  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    users_book: "",
  });
  const [bookToEdit, setBookToEdit] = useState<{
    id: string;
    title: string | null;
    description: string | null;
  }>({ id: "", title: null, description: null });

  const navigation = useNavigation();
  const user = useUser();
  const { books } = useUserBooksStore();
  const { image, id } = route.params ?? {};
  console.log("image", books);
  // if id exists then we are editing an existing book entry
  const uploadData = async () => {
    if (!image) {
      // upload the data without the image
      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...bookData, image_url: "" }]);
      if (error) {
        console.error("Error inserting data", error);
        return;
      }
      navigation.goBack();
    }
    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: "base64",
    });
    const filePath = `booknotes/${new Date().getTime()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, decode(base64), { contentType: "image/jpg" });

    if (uploadError) {
      console.error("Error uploading file", uploadError);
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...bookData, image_url: filePath ? filePath : "" }]);
      if (error) {
        console.error("Error inserting data", error);
      } else {
        navigation.goBack();
      }
    }
  };

  useEffect(() => {
    if (id) {
      const getBookNoteEntry = async () => {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", id || "")
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }
        setBookToEdit(data);
      };
      getBookNoteEntry();
      console.log(id);
    }
  }, [id]);

  const updateBookNoteEntry = async () => {
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: bookToEdit.title,
        description: bookToEdit.description,
      })
      .eq("id", bookToEdit.id);

    if (error) {
      console.error("Error updating data:", error);
      return;
    }
    console.log("Data updated:", data);
    navigation.goBack();
  };

  const deleteBookNoteEntry = async () => {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", bookToEdit.id);

    if (error) {
      console.error("Error deleting data:", error);
      return;
    }
    navigation.goBack();
  };

  useEffect(() => {
    if (books?.length && !bookData.users_book) {
      setBookData((prevData) => ({
        ...prevData,
        users_book: books[0]?.id || "",
      }));
    }
    console.log(books);
  }, [user, books]);

  const handleChange = (name: string, value: any) => {
    if (id) {
      setBookToEdit({
        ...bookToEdit,
        [name]: value,
      });
      return;
    } else {
      setBookData({
        ...bookData,
        [name]: value,
      });
    }
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
        defaultValue={bookToEdit.title ? bookToEdit.title : ""}
      />
      <TextInput
        placeholder="Description"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        onChangeText={(text) => handleChange("description", text)}
        defaultValue={bookToEdit.description ? bookToEdit.description : ""}
      />
      {id ? (
        <>
          <Button onPress={updateBookNoteEntry} style={styles.Touchable}>
            <Text style={{ color: "white" }}>Update Note</Text>
          </Button>
          <Button onPress={deleteBookNoteEntry} style={styles.deleteButton}>
            <Text style={{ color: "white" }}>Delete Note</Text>
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
          <Button onPress={uploadData} style={styles.Touchable}>
            <Text style={{ color: "white" }}>Create Note</Text>
          </Button>
        </>
      )}
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
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    width: "40%",
    borderRadius: 10,
    marginVertical: 10,
  },
});
