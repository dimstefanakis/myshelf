import React, { useEffect, useState } from "react";
import { TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { supabase } from "@/utils/supabase";
import { useRouter } from "expo-router";
import { Image } from "react-native-elements";
import { Modal } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { View, Text, Button, ScrollView } from "../Themed";
import { useJournalStore, Journal } from "@/store/journalStore";
import useUser from "@/hooks/useUser";
import { useNavigation } from "expo-router";
import type { Database } from "@/types_db";
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
  const [searchQuery, setSearchQuery] = useState("");
  const nav = useNavigation<NavigationProp<RootStackParamList>>();
  const getData = async () => {
    let { data, error } = await supabase
      .from("journals")
      .select("*, users_book(book(*), *)  ")
      .eq("users_book.user", session?.user?.id || "");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setJournal(data as unknown as Journal[]);
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
        },
        () => {
          getData();
        }
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

  const filteredJournal = journal.filter(
    (entry) =>
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.users_book?.book.title
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ height: "100%", alignItems: "center" }}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />
      {filteredJournal.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          {filteredJournal.map((entry, index) => (
            <View key={index} style={styles.journalEntry}>
              <View style={styles.dateAndTitle}>
                <Text>
                  <Text style={styles.createdAt}>
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                  <Text> - </Text>
                  <Text style={styles.createdAt}>{entry.title}</Text>
                </Text>
                <View style={styles.iconContainer}>
                  <AntDesign
                    name="edit"
                    size={15}
                    color="black"
                    style={{ marginRight: 12 }}
                    onPress={() =>
                      nav.navigate("AddJournalEntryScreen", { id: entry.id })
                    }
                  />
                </View>
              </View>
              <Text style={{ fontSize: 12, marginTop: 10 }}>
                {entry.description}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.noEntriesContainer}>
          <Text style={styles.noEntriesText}>No entries yet!</Text>
          <Button onPress={() => nav.navigate("AddJournalEntryScreen")}>
            <Text style={styles.buttonText}>Create a new one</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
    paddingBottom: 50,
  },
  journalEntry: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dateAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  createdAt: {
    color: "#326E78",
    fontWeight: "bold",
    fontSize: 12,
  },
  iconContainer: {
    flexDirection: "row",
  },
  noEntriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEntriesText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#326E78",
    marginBottom: 20,
  },
  buttonText: {
    color: "white",
  },
  searchBar: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    height: 40,
  },
});

export default JournalScreen;
