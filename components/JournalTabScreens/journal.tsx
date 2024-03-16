import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { Image } from "react-native-elements";
import { Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { View, Text, ScrollView } from "../Themed";
import { useJournalStore } from "@/store/journalStore";
import useUser from "@/hooks/useUser";
import type { Journal } from "@/store/journalStore";
import { useNavigation } from "expo-router";

interface NavigationProp<T> {
  navigate: (screen: keyof T, params?: any) => void;
}
interface RootStackParamList {
  AddJournalEntryScreen: { id: string };
}

const JournalScreen = () => {
  const { session } = useUser();
  const { journal, setJournal } = useJournalStore();
  const [modalVisible, setModalVisible] = useState(false);
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const getData = async () => {
    let { data, error } = await supabase
      .from("journals")
      .select("*, users_book(*)")
      .eq("users_book.user", session?.user?.id || "");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setJournal(data as Journal[]);
  };

  async function listenToJournalUpdates() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "journals",
          // filter: `users_book.user=eq.${session?.user?.id}`,
        },
        () => {
          getData();
        },
      )
      .subscribe();

    return channel;
  }

  useEffect(() => {
    if (session?.user?.id) {
      getData();
      const channel = listenToJournalUpdates();
    }
  }, [session?.user?.id]);

  const handleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <View style={{ height: "100%", alignItems: "center" }}>
      {/* <TouchableOpacity
        style={styles.createJournalButton}
        onPress={() => navigation.navigate("modalContent")}
      >
        <Text style={styles.createButtonText}>Create New Journal</Text>
      </TouchableOpacity> */}
      {journal.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          // contentContainerStyle={{ paddingVertical: 30 }}
          // scrollEventThrottle={20}
        >
          {journal.map((journal, index) => {
            return (
              <View key={index} style={styles.journalEntry}>
                <View style={styles.dateAndTitle}>
                  <Text>
                    <Text style={styles.createdAt}>
                      {new Date(journal.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </Text>
                    <Text> - </Text>
                    <Text style={styles.createdAt}>{journal.title}</Text>
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      display: "flex",
                      flexDirection: "row",
                    }}
                  >
                    <AntDesign
                      name="edit"
                      size={15}
                      color="black"
                      style={{ marginRight: 12 }}
                      onPress={() =>
                        nav.navigate("AddJournalEntryScreen", {
                          id: journal.id,
                        })
                      }
                    />
                    <AntDesign
                      name="eye"
                      size={15}
                      color="black"
                      onPress={handleModal}
                    />
                  </View>
                  <View style={styles.modalContainer}>
                    <Modal
                      animationType="slide"
                      visible={modalVisible}
                      onRequestClose={handleModal}
                      presentationStyle="formSheet"
                      style={{
                        backgroundColor: "rgba(0, 0, 255, 0.7)",
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: "black",
                        borderStyle: "solid",
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: "80%",
                            height: "80%",
                          }}
                        >
                          <Image
                            source={{
                              uri: `http://127.0.0.1:54321/storage/v1/object/public/images/${journal.image_url}`,
                            }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        </View>
                      </View>
                    </Modal>
                  </View>
                </View>
                <Text style={{ fontSize: 12, marginTop: 10 }}>
                  {journal.description}
                </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    margin: 0,
    borderBottomColor: "#ddd",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  dateAndTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  createdAt: {
    color: "#326E78",
    fontWeight: "bold",
    fontSize: 12,
  },
  modalContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
});

export default JournalScreen;
