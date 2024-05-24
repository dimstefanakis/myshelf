import { Button, Text, TextInput } from "@/components/Themed";
import React, { useEffect } from "react";
import SelectDropdown from "react-native-select-dropdown";
import useUser from "@/hooks/useUser";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { View } from "react-native";
import { supabase } from "@/utils/supabase";
import { useUserBooksStore } from "@/store/userBooksStore";

const AddMarker = ({ navigation, route }: any) => {
  const { longitude, latitude } = route.params;
  const user = useUser();
  const { books } = useUserBooksStore();
  const [markerData, setMarkerData] = useState({
    marker_type: "",
    user_book: "",
    latitude: latitude,
    longitude: longitude,
  });

  const handleChange = (name: string, value: any) => {
    setMarkerData({ ...markerData, [name]: value });
  };

  const handleSubmit = async () => {
    // Prepare the object to be inserted based on the marker_type
    let insertData = {
      user_book: markerData.user_book,
      setting_origin_lat: null,
      setting_origin_long: null,
      author_nationality_lat: null,
      author_nationality_long: null,
      country_published_lat: null,
      country_published_long: null,
    };

    // Add latitude and longitude based on marker_type
    switch (markerData.marker_type) {
      case "Setting Origin":
        insertData.setting_origin_lat = latitude;
        insertData.setting_origin_long = longitude;
        break;
      case "Author National":
        insertData.author_nationality_lat = latitude;
        insertData.author_nationality_long = longitude;
        break;
      case "Country Published":
        insertData.country_published_lat = latitude;
        insertData.country_published_long = longitude;
        break;
      default:
        console.error("Invalid marker type");
        // Handle the error case, possibly showing a message to the user
        return;
    }

    // Insert the data into the books_origin table
    const { data, error } = await supabase
      .from("book_origins")
      .insert([insertData]);

    // Handle the response
    if (error) {
      console.error("Error inserting data:", error);
      // Optionally, show an error message to the user
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    if (user?.user?.books?.length && !markerData.user_book) {
      setMarkerData((prevData) => ({
        ...prevData,
        user_book: user?.user?.books[0]?.id || "",
      }));
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <SelectDropdown
        data={books.map((book) => book.book.title)}
        onSelect={(selectedItem, index) => {
          handleChange("user_book", books[index].id);
        }}
        buttonTextAfterSelection={(selectedItem) => selectedItem}
        rowTextForSelection={(item) => item}
        buttonStyle={styles.dropdown1BtnStyle}
        defaultButtonText="Select a book"
      />
      <SelectDropdown
        data={["Author National", "Setting Origin", "Country Published"]}
        onSelect={(selectedItem, index) => {
          handleChange("marker_type", selectedItem);
        }}
        buttonTextAfterSelection={(selectedItem) => selectedItem}
        rowTextForSelection={(item) => item}
        buttonStyle={styles.dropdown1BtnStyle}
        defaultButtonText="Select a type"
      />
      <Button onPress={handleSubmit} style={styles.submitButton}>
        <Text style={{ color: "white" }}>Add</Text>
      </Button>
    </View>
  );
};

export default AddMarker;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  dropdown1BtnStyle: {
    width: "80%",
    height: 50,
    backgroundColor: "#e7e7e7",
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "blue",
    padding: 10,
    alignItems: "center",
    width: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
});
