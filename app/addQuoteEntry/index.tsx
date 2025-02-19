import { View, StyleSheet, ActivityIndicator, Alert } from "react-native";
import React, { useEffect } from "react";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { supabase } from "@/utils/supabase";
import { Button, XStack, Text as TamaguiText, Input, YStack, Select, Adapt, Sheet, TextArea } from "tamagui";
import { ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import SafeAreaView from "@/components/SafeAreaView";
import { KeyboardAvoidingView, Platform } from "react-native";

const AddQuoteEntryScreen = () => {
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState({
    title: "",
    author: "",
    users_book: "",
  });
  const navigation = useNavigation();
  const user = useUser();
  const { books } = useUserBooksStore();

  // useEffect(() => {
  //   if (books?.length && !quoteData.users_book) {
  //     setQuoteData((prevData) => ({
  //       ...prevData,
  //       users_book: books[0]?.id || "",
  //     }));
  //   }
  // }, [user, books]);

  const handleChange = (name: string, value: any) => {
    setQuoteData({
      ...quoteData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!quoteData.users_book) {
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
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button
        borderRadius={100}
        w={50}
        h={50}
        chromeless
        icon={<ChevronLeft size={24} color="$gray10" />}
        onPress={() => navigation.goBack()}
      />

      <TamaguiText style={styles.headerText} marginVertical={20}>
        New Quote
      </TamaguiText>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <YStack f={1} jc="space-between" px="$4">
          <YStack space="$4">
            <Input
              size="$4"
              placeholder="Author (optional)"
              onChangeText={(text) => handleChange("author", text)}
              backgroundColor="$orange2"
              borderColor="$orange4"
            />
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
            <TextArea
              placeholder="Quote"
              onChangeText={(text) => handleChange("title", text)}
              backgroundColor="$orange2"
              borderColor="$orange4"
              size="$4"
              multiline
              minHeight={300}
            />
          </YStack>

          <View style={styles.buttonContainer}>
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
          </View>
        </YStack>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "$orange11",
    textAlign: "center",
  },
  keyboardAvoid: {
    flex: 1,
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    paddingBottom: 20,
  },
});

export default AddQuoteEntryScreen;
