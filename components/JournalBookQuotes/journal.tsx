import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { Image } from "react-native-elements";
import {Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";

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



  const getData = async () => {
    let { data, error } = await supabase.from("journals").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setData(data ? data : []);
  };

  useEffect(() => {
    getData();

  }, []);

  const handleModal = () => {
    setModalVisible(!modalVisible);
  }

  return (
    <View style={{ height: "100%", alignItems: "center" }}>
      {/* <TouchableOpacity
        style={styles.createJournalButton}
        onPress={() => navigation.navigate("modalContent")}
      >
        <Text style={styles.createButtonText}>Create New Journal</Text>
      </TouchableOpacity> */}
      {data.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 46 }}
          scrollEventThrottle={20}
        >
          {data.map((journal, index) => {
            return (
              <View key={index} style={styles.journalEntry}>
                <Text style={styles.dateAndTitle}>
                  <Text style={styles.createdAt}>
                    {new Date(journal.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text> - </Text>
                  <Text style={styles.createdAt}>{journal.title}</Text>
                  <View style={styles.iconContainer}>
                    <AntDesign name="eye" size={15} color="black" onPress={handleModal} />
                    <Modal
                      animationType="slide"
                      visible={modalVisible}
                      onRequestClose={handleModal}
                      style={{
                        backgroundColor: "rgba(0, 0, 255, 0.7)",                        
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <View style={{ width: "80%", height: "80%", backgroundColor: "white" }}>
                          <Image
                            source={{ uri: `http://127.0.0.1:54321/storage/v1/object/public/images/${journal.image_url}`}}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                      </View>
                    </Modal>
                  </View>
                </Text>
                <Text style={{fontSize:11}}>{journal.description}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text>No data</Text>
      )}

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
    marginVertical: 15,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollView: {
    width: "100%",
    paddingBottom: 50,
  },
  journalEntry: {
    padding: 20,
    borderBottomWidth: 1,
    margin: 0,
    borderBottomColor: "#ddd",
    paddingLeft:30
  },
  dateAndTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  createdAt: {
    color: "blue",
    fontWeight: "bold",
    fontSize : 12
  },
  iconContainer: {
    display:"flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
});

export default JournalScreen;
