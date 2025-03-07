import { View, StyleSheet, ActivityIndicator, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import React, { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button, XStack, Text as TamaguiText, Input, YStack, Select, Adapt, Sheet, TextArea } from "tamagui";
import { ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import SafeAreaView from "@/components/SafeAreaView";
import { KeyboardAvoidingView, Platform } from "react-native";

const AddQuoteEntryScreen = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    title: "",
    author: "",
    users_book: "",
  });
  
  const [quoteToEdit, setQuoteToEdit] = useState<{
    id: string;
    title: string | null;
    author: string | null;
    users_book: string | null;
  }>({ id: "", title: null, author: null, users_book: null });
  
  const navigation = useNavigation();
  const router = useRouter();
  const user = useUser();
  const { books } = useUserBooksStore();

  // useEffect to fetch quote data when editing
  useEffect(() => {
    if (id) {
      const getQuoteEntry = async () => {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", id || "")
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }
        setQuoteToEdit(data);
      };
      getQuoteEntry();
    }
  }, [id]);

  const handleChange = (name: string, value: any) => {
    if (id) {
      setQuoteToEdit({ ...quoteToEdit, [name]: value });
    } else {
      setQuoteData({
        ...quoteData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!quoteData.users_book && !id) {
      Alert.alert("Error", "Please select a book");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("quotes")
      .insert([{ ...quoteData }]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    setLoading(false);
    router.back();
  };

  const updateQuoteEntry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quotes")
      .update({
        title: quoteToEdit.title,
        author: quoteToEdit.author,
      })
      .eq("id", quoteToEdit.id);

    if (error) {
      console.error("Error updating data:", error);
      return;
    }
    setLoading(false);
    router.back();
  };

  const deleteQuoteEntry = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("quotes")
      .delete()
      .eq("id", quoteToEdit.id);

    if (error) {
      console.error("Error deleting data:", error);
      return;
    }
    setLoading(false);
    router.back();
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

          <TamaguiText style={styles.headerText} marginVertical={20}>
            {id ? "Edit Quote" : "New Quote"}
          </TamaguiText>

          <View style={styles.contentContainer}>
            <YStack space="$4" style={styles.inputContainer}>
              <Input
                size="$4"
                placeholder="Author (optional)"
                onChangeText={(text) => handleChange("author", text)}
                defaultValue={quoteToEdit.author || ""}
                backgroundColor="$orange2"
                borderColor="$orange4"
              />
              
              {!id && (
                <Select
                  value={quoteData.users_book}
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
                  placeholder="Quote"
                  onChangeText={(text) => handleChange("title", text)}
                  defaultValue={quoteToEdit.title || ""}
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
                  onPress={updateQuoteEntry}
                  backgroundColor="$orange10"
                  color="white"
                  pressStyle={{ backgroundColor: "$orange8" }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Save Changes"}
                </Button>
                <Button
                  size="$6"
                  width="100%"
                  onPress={deleteQuoteEntry}
                  backgroundColor="#FF4444"
                  color="white"
                  pressStyle={{ opacity: 0.8 }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Delete Quote"}
                </Button>
              </>
            ) : (
              <Button
                size="$6"
                width="100%"
                onPress={handleSubmit}
                backgroundColor="$orange10"
                color="white"
                pressStyle={{ backgroundColor: "$orange8" }}
              >
                {loading ? <ActivityIndicator color="white" /> : "Create Quote"}
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

export default AddQuoteEntryScreen;
