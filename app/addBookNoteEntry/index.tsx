import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import SelectDropdown from "react-native-select-dropdown";
import { Text, TextInput, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Image, Modal } from "react-native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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
  // if id exists then we are editing an existing book entry
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
    <View style={{ flex: 1, alignItems: "center" }}>
      {cover_image && (
        <>
          <Image
            source={{ uri: cover_image }}
            style={{ width: 100, height: 100, borderRadius: 10 }}
          />
        </>
      )}
      <TextInput
        placeholder="Title"
        style={styles.input}
        onChangeText={(text) => handleChange("title", text)}
        defaultValue={bookToEdit.title ? bookToEdit.title : ""}
      />
      <TextInput
        placeholder="Description"
        multiline={true}
        numberOfLines={4}
        style={styles.multilineInput}
        onChangeText={(text) => handleChange("description", text)}
        defaultValue={bookToEdit.description ? bookToEdit.description : ""}
      />
      {id ? (
        <>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              width: "80%",
            }}
          >
            <Button onPress={updateBookNoteEntry} style={styles.Touchable}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white" }}>Update Note</Text>
              )}
            </Button>
            <Button onPress={deleteBookNoteEntry} style={styles.deleteButton}>
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white" }}>Delete Note</Text>
              )}
            </Button>
          </View>
        </>
      ) : (
        <>
          <SelectDropdown
            data={books.map((book) => book.book.title) || []}
            onSelect={(selectedItem, index) => {
              handleChange("users_book", books[index].id);
            }}
            buttonTextAfterSelection={(selectedItem) => selectedItem}
            rowTextForSelection={(item) => item}
            buttonStyle={styles.dropdown1BtnStyle}
            defaultButtonText="Select a book"
          />
          <Button onPress={uploadData} style={styles.Touchable}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: "white" }}>Create Note</Text>
            )}
          </Button>
        </>
      )}
      {images.length > 0 && images[0].includes("http") && (
        <>
          <Text style={{ fontSize: 20, margin: 10 }}>
            {/* bookname */}
            {bookName}
          </Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", width: "100%" }}
          >
            {images.map((imgUrl, index) => (
              <TouchableOpacity
                key={index}
                style={{ maxWidth: "32%" }}
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
        </>
      )}
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
    </View>
  );
};

export default AddBookNoteEntryScreen;

const styles = StyleSheet.create({
  input: {
    height: 40,
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  multilineInput: {
    height: 120,
    borderWidth: 1,
    width: "80%",
    padding: 10,
    borderRadius: 10,
    textAlignVertical: "top",
    marginTop: 20,
    marginBottom: 20,
  },
  dropdown1BtnStyle: {
    width: "80%",
    height: 50,
    backgroundColor: "#e7e7e7",
    borderRadius: 8,
    marginBottom: 20,
  },
  galleryImage: {
    width: 110,
    height: 110,
    // borderRadius: 10,
    margin: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  fullSizeImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },
  modalCloseButton: {
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },

  Touchable: {
    backgroundColor: "black",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: "40%",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    width: "40%",
    borderRadius: 10,
    marginVertical: 10,
  },
});
