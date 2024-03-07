import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import useUser from "@/hooks/useUser";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";

const ModalBookScreen = () => {
  const [bookData, setBookData] = useState(
    {
      title: "",
      description: "",
      users_book: "",
      //   user: "",
    },
  );
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
    const { data, error } = await supabase.from("notes").insert([{...bookData,user: user?.user?.id}]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    // navigation.navigate("BookScreen");
    navigation.goBack();
  };

  useEffect(() => {
    console.log(bookData);
  }, [bookData]);

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
      />
      <TouchableOpacity onPress={handleSubmit} style={styles.Touchable} >
        <Text style={{color:"white"}}>Submit</Text>
        </TouchableOpacity>
    </View>
  );
};

export default ModalBookScreen;

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
  dropdown1BtnStyle: {
    backgroundColor: "#e7e7e7",
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  Touchable:{
    backgroundColor: "black",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width:"40%",
    alignItems:"center"
  }
});
