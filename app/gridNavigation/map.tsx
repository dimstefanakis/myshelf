import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import MapViewScreen from "@/components/MapView";
import { useLayoutEffect } from "react";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window"); // Get the window width for full-width dropdown

const MapScreen = ({ navigation }: any) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sortCategory, setSortCategory] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <FontAwesome
            name="sort"
            size={24}
            color="black"
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, dropdownVisible]);

  return (
    <View style={{ height: "100%" }}>
      <MapViewScreen sortCategory={sortCategory} />
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSortCategory("");
              setDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSortCategory("author_nationality");
              setDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownText}>Author Nationality</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSortCategory("setting_origin");
              setDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownText}>Setting Origin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setSortCategory("country_published");
              setDropdownVisible(false);
            }}
          >
            <Text style={styles.dropdownText}>Country Published</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    top: 0,
    // width is 1/3 of the screen width
    width: width / 2,
    right: 0,
    backgroundColor: "white",
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000, // Make sure the dropdown appears above other content
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#f1f1f1",
  },
  dropdownText: {
    textAlign: "center",
  },
});

export default MapScreen;
