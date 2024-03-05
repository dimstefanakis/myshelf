import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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

  return (
    <View style={{ height: "100%", alignItems: "center" }}>
      <TouchableOpacity
        style={styles.createJournalButton}
        onPress={() => navigation.navigate('modalContent')}
      >
        <Text style={styles.createButtonText}>
          Create New Journal
        </Text>
      </TouchableOpacity>
      {data.length > 0 ? (
        <ScrollView style={styles.scrollView}>
          {data.map((journal, index) => {
            return (
              <View key={index} style={styles.journalEntry}>
                <Text style={styles.dateAndTitle}>
                  <Text style={styles.createdAt}>{new Date(
                    journal.created_at
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                    })}</Text>
                  <Text> - </Text>
                  <Text style={styles.createdAt}>{journal.title}</Text>
                </Text>
                <Text>{journal.description}</Text>
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
  },
  journalEntry: {
    padding: 10,
    borderBottomWidth: 1,
    margin:0,
    borderBottomColor: "#ddd",
  },
  dateAndTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  createdAt: {
    color: "blue",
    fontWeight: "bold",
  },
});

export default JournalScreen;
