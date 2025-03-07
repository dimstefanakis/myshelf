import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button, XStack, Text, Input, YStack, Select, Adapt, Sheet, TextArea } from "tamagui";
import SafeAreaView from "@/components/SafeAreaView";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronDown } from "@tamagui/lucide-icons";

const AddJournalEntryScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const [textAreaHeight, setTextAreaHeight] = useState(200);

  const uploadData = async () => {
    // if (!journalData.title || !journalData.description) {
    //   Alert.alert("Error", "Please fill in all fields");
    //   return;
    // }
    setLoading(true);

    const { data, error } = await supabase
      .from("journals")
      .insert([journalData]);

    if (error) {
      console.error("Error inserting data", error);
      Alert.alert("Error", "Failed to insert journal data.");
    } else {
      setLoading(false);
      router.back();
    }
  };

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
    setLoading(true);
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
    setLoading(false);
    router.back();
  };

  const deleteJournalEntry = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("journals")
      .delete()
      .eq("id", journalToEdit.id);

    if (error) {
      console.error("Error deleting data:", error);
      return;
    }
    setLoading(false);
    router.back();
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
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Button
            borderRadius={100}
            w={50}
            h={50}
            chromeless
            icon={<ChevronLeft size={24} color="$gray10" />}
            onPress={() => router.back()}
          />

          <Text style={styles.headerText} marginVertical={20}>
            {id ? "Edit Journal Entry" : "New Journal Entry"}
          </Text>

          <View style={styles.contentContainer}>
            <YStack space="$4" style={styles.inputContainer}>
              <Input
                size="$4"
                placeholder="Title (optional)"
                onChangeText={(text) => handleChange("title", text)}
                defaultValue={journalToEdit.title ? journalToEdit.title : ""}
                backgroundColor="$orange2"
                borderColor="$orange4"
              />

              {!id && (
                <Select
                  value={journalData.users_book}
                  onValueChange={(value) => handleChange("users_book", value)}
                >
                  <Select.Trigger
                    width="100%"
                    backgroundColor="$orange2"
                    borderColor="$orange4"
                    borderWidth={1}
                    borderRadius={12}
                    height={50}
                    iconAfter={ChevronDown}
                  >
                    <Select.Value placeholder="Select a book" />
                  </Select.Trigger>

                  <Adapt when="sm" platform="touch">
                    <Sheet dismissOnSnapToBottom>
                      <Sheet.Frame>
                        <Sheet.ScrollView>
                          <Adapt.Contents />
                        </Sheet.ScrollView>
                      </Sheet.Frame>
                      <Sheet.Overlay />
                    </Sheet>
                  </Adapt>

                  <Select.Content>
                    <Select.Viewport>
                      <Select.Group>
                        {books.map((book, index) => (
                          <Select.Item
                            index={index}
                            key={book.id}
                            value={book.id}
                          >
                            <Select.ItemText>{book.book.title}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Viewport>
                  </Select.Content>
                </Select>
              )}
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
                keyboardVerticalOffset={Platform.OS === "ios" ? 150 : 0}
              >
                <TextArea
                  placeholder="Write your thoughts..."
                  onChangeText={(text) => handleChange("description", text)}
                  defaultValue={journalToEdit.description ? journalToEdit.description : ""}
                  backgroundColor="$orange2"
                  borderColor="$orange4"
                  size="$4"
                  mb={50}
                  flex={1}
                />
              </KeyboardAvoidingView>
            </YStack>
          </View>

          <View style={styles.buttonContainer}>
            {id ? (
              <>
                <Button
                  size="$6"
                  width="100%"
                  mb="$4"
                  onPress={updateJournalEntry}
                  backgroundColor="$orange10"
                  color="white"
                  pressStyle={{ backgroundColor: "$orange8" }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Save Changes"}
                </Button>
                <Button
                  size="$6"
                  width="100%"
                  onPress={deleteJournalEntry}
                  backgroundColor="#FF4444"
                  color="white"
                  pressStyle={{ opacity: 0.8 }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Delete Entry"}
                </Button>
              </>
            ) : (
              <Button
                size="$6"
                width="100%"
                onPress={uploadData}
                backgroundColor="$orange10"
                color="white"
                pressStyle={{ backgroundColor: "$orange8" }}
              >
                {loading ? <ActivityIndicator color="white" /> : "Create Entry"}
              </Button>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  innerContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  contentContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "$orange11",
    textAlign: "center",
  },
  keyboardAvoid: {
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  inputContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },
});

export default AddJournalEntryScreen;
