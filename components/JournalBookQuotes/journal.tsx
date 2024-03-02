import React, { useEffect, useState } from "react";
import { Text, View, Modal, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";

interface JournalEntry {
  created_at: string;
  description: string | null;
  id: string | null;
  image_url: string | null;
  title: string | null;
  users_book: string | null;
}

const JournalScreen = () => {
  const [data, setData] = useState<JournalEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
    const navigation = useRouter();

  const handleScroll = (event:any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (scrollY < -50) { // Threshold for closing the modal, adjust as needed
      setModalVisible(false);
    }
  };

  const getData = async () => {
    let { data, error } = await supabase.from("journals").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setData(data ? data : []);
    console.log(data);
  };

  useEffect(() => {
    getData().then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <View style={{ height: "100%", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.createJournalButton}
        onPress={() => navigation.navigate('modalContent')} // Navigate to the modal screen
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
          Create New Journal
        </Text>
      </TouchableOpacity>

      {/* Your existing map function for displaying data */}
    </View>
  );
};

const styles = StyleSheet.create({
    createJournalButton: {
        backgroundColor: "blue",
        padding: 10,
        alignItems: "center",
        width: 200, 
        borderRadius: 10,
        marginVertical: 10,
      },
      centeredView: {
        flex: 1,
        justifyContent: "flex-end", // Align the modal at the bottom
        alignItems: "center",
      },
      modalView: {
        width: '100%', 
        height: '90%', 
        backgroundColor: "white",
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20, 
      },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default JournalScreen;
