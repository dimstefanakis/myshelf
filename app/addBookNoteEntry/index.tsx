import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Text, Button } from "tamagui";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Button as TamaguiButton, XStack, Text as TamaguiText, Input, YStack, Select, Adapt, Sheet, TextArea } from "tamagui";
import { ChevronDown, ChevronLeft } from "@tamagui/lucide-icons";
import SafeAreaView from "@/components/SafeAreaView";
import { useRouter } from 'expo-router';

const AddBookNoteEntryScreen = ({ route, nav }: any) => {
  const [loading, setLoading] = useState(false);
  const [bookData, setBookData] = useState({
    title: "",
    description: "",
    users_book: "",
  });
  const [bookName, setBookName] = useState("");
  const [bookToEdit, setBookToEdit] = useState<{
    id: string;
    title: string | null;
    description: string | null;
  }>({ id: "", title: null, description: null });
  const [images, setImages] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigation = useNavigation();
  const user = useUser();
  const { books } = useUserBooksStore();
  const { image, id, cover_image } = route.params ?? {};
  const router = useRouter();

  const uploadData = async () => {
    setLoading(true);

    if (!image) {
      // upload the data without the image
      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...bookData, image_url: "" }]);
      if (error) {
        setLoading(false);
        console.error("Error inserting data", error);
        return;
      }
      setLoading(false);
      navigation.goBack();
    }

    const base64 = await FileSystem.readAsStringAsync(image.uri, {
      encoding: "base64",
    });
    const filePath = `booknotes/${new Date().getTime()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, decode(base64), { contentType: "image/jpg" });

    if (uploadError) {
      console.error("Error uploading file", uploadError);
    } else {
      setLoading(false);
      const { data, error } = await supabase
        .from("notes")
        .insert([{ ...bookData, image_url: filePath ? filePath : "" }]);
      if (error) {
        console.error("Error inserting data", error);
      } else {
        setLoading(false);
        navigation.goBack();
      }
    }
  };

  useEffect(() => {
    if (id) {
      const getBookNoteEntry = async () => {
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", id || "")
          .single();

        if (error) {
          console.error("Error fetching data:", error);
          return;
        }
        setBookToEdit(data);
      };
      getBookNoteEntry();
    }
  }, [id]);

  // Changed fetchImages to fetch all images associated with the book instead of a specific note
  useEffect(() => {
    const fetchImages = async () => {
      if (!id) return;
      setLoading(true);

      // Fetch all images linked to the same book
      const { data: bookNotesData, error: bookNotesError } = await supabase
        .from("notes")
        .select("users_book")
        .eq("id", id) // Get the book ID from the current note
        .single();

      if (bookNotesError || !bookNotesData.users_book) {
        console.error("Error fetching book info:", bookNotesError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("notes")
        .select("image_url")
        .eq("users_book", bookNotesData.users_book); // Use the book ID to fetch all images

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(data.map((note) => note.image_url));
      }
      setLoading(false);
    };

    fetchImages();
  }, [id]);

  const updateBookNoteEntry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: bookToEdit.title,
        description: bookToEdit.description,
      })
      .eq("id", bookToEdit.id);

    if (error) {
      console.error("Error updating data:", error);
      return;
    }
    setLoading(false);
    console.log("Data updated:", data);
    navigation.goBack();
  };

  const deleteBookNoteEntry = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", bookToEdit.id);

    if (error) {
      console.error("Error deleting data:", error);
      return;
    }
    setLoading(false);
    navigation.goBack();
  };

  useEffect(() => {
    if (books?.length && !bookData.users_book) {
      setBookData((prevData) => ({
        ...prevData,
        users_book: books[0]?.id || "",
      }));
    }
  }, [user, books]);

  const handleChange = (name: string, value: any) => {
    if (id) {
      setBookToEdit({
        ...bookToEdit,
        [name]: value,
      });
      return;
    } else {
      setBookData({
        ...bookData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from("notes")
      .insert([{ ...bookData, user: user?.user?.id }]);
    if (error) {
      console.error("Error inserting data", error);
      return;
    }
    navigation.goBack();
  };

  const getPublicUrl = async (filePath: string) => {
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  //  get the image urls for the same book and set them in the state
  const fetchImages = async () => {
    if (!id) return;
    setLoading(true);

    // Fetch all images linked to the same book
    const { data: bookNotesData, error: bookNotesError } = await supabase
      .from("notes")
      .select("users_book")
      .eq("id", id) // Get the book ID from the current note
      .single();

    if (bookNotesError || !bookNotesData.users_book) {
      console.error("Error fetching book info:", bookNotesError);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*,image_url")
      .eq("users_book", bookNotesData.users_book); // Use the book ID to fetch all images

    if (error) {
      console.error("Error fetching images:", error);
    }

    //  set the images to the public url of the images
    const imageUrls = await Promise.all(
      data
        ? data.map(async (note: any) => {
            const { data } = await supabase.storage
              .from("images")
              .getPublicUrl(note.image_url);

            return data.publicUrl;
          })
        : [],
    );

    setImages(imageUrls);

    setLoading(false);
  };

  // get the book name from the book id
  const getBookName = (bookId: string) => {
    const book = books.find((book) => book.id === bookId);

    // setbookname
    setBookName(book?.book.title || "");
  };

  useEffect(() => {
    if (!id) return;

    fetchImages();
    getBookName(bookData.users_book);
  }, [id]);

  const openImage = (imgUrl: any) => {
    setSelectedImage(imgUrl);
    setModalVisible(true);
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
            onPress={() => navigation.goBack()}
          />

          <TamaguiText style={styles.headerText} marginVertical={20}>
            {id ? "Edit Note" : "New Note"}
          </TamaguiText>

          <View style={styles.contentContainer}>
            <YStack space="$4" style={styles.inputContainer}>
              {cover_image && (
                <Image
                  source={{ uri: cover_image }}
                  style={{ width: 100, height: 100, borderRadius: 10, alignSelf: 'center' }}
                />
              )}
              
              <Input
                size="$4"
                placeholder="Title"
                onChangeText={(text) => handleChange("title", text)}
                defaultValue={bookToEdit.title ? bookToEdit.title : ""}
                backgroundColor="$orange2"
                borderColor="$orange4"
              />

              {!id && (
                <Select
                  value={bookData.users_book}
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
                  placeholder="Description"
                  onChangeText={(text) => handleChange("description", text)}
                  defaultValue={bookToEdit.description ? bookToEdit.description : ""}
                  backgroundColor="$orange2"
                  borderColor="$orange4"
                  size="$4"
                  mb={50}
                  flex={1}
                />
              </KeyboardAvoidingView>
            </YStack>
          </View>

          {images.length > 0 && images[0].includes("http") && (
            <View style={styles.galleryContainer}>
              <Text style={styles.galleryTitle}>
                {bookName}
              </Text>
              <View style={styles.galleryGrid}>
                {images.map((imgUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.galleryImageContainer}
                    onPress={() => openImage(imgUrl)}
                  >
                    <Image
                      key={index}
                      source={{ uri: imgUrl }}
                      style={styles.galleryImage}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {id ? (
              <>
                <Button
                  size="$6"
                  width="100%"
                  mb="$4"
                  onPress={updateBookNoteEntry}
                  backgroundColor="$orange10"
                  color="white"
                  pressStyle={{ backgroundColor: "$orange8" }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Save Changes"}
                </Button>
                <Button
                  size="$6"
                  width="100%"
                  onPress={deleteBookNoteEntry}
                  backgroundColor="#FF4444"
                  color="white"
                  pressStyle={{ opacity: 0.8 }}
                >
                  {loading ? <ActivityIndicator color="white" /> : "Delete Note"}
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
                {loading ? <ActivityIndicator color="white" /> : "Create Note"}
              </Button>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.textStyle}>Close</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullSizeImage}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddBookNoteEntryScreen;

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
  galleryContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  galleryTitle: {
    fontSize: 20,
    margin: 10,
    color: "$orange11",
    fontWeight: "600",
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
  },
  galleryImageContainer: {
    maxWidth: "32%",
    margin: 2,
  },
  galleryImage: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    backgroundColor: "black",
  },
  fullSizeImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: "$orange10",
    borderRadius: 8,
    zIndex: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
