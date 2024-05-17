import { useState, useEffect } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useUserBooksStore } from "@/store/userBooksStore";
import { supabase } from "@/utils/supabase";

// import EditScreenInfo from '@/components/topNavBar';
import { Text, View, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";

const tabs = [
  {
    id: "gallery",
    title: "Gallery",
  },
  {
    id: "shelves",
    title: "Shelves",
  },
];

const shelves = [
  {
    id: "currently_reading",
    title: "Currently Reading",
    image: require("./../../assets/images/currently_reading.png"),
  },
  {
    id: "completed",
    title: "Completed",
    image: require("./../../assets/images/completed.png"),
  },
  {
    id: "future_reading",
    title: "To Read",
    image: require("./../../assets/images/to_read.png"),
  },
];

export default function MyShelfScreen() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              selectedTab.id === tab.id && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabTitle,
                selectedTab.id === tab.id && styles.selectedTabTitle,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {
        {
          gallery: <Gallery />,
          shelves: <Shelves />,
        }[selectedTab.id]
      }
    </View>
  );
}

function Gallery() {
  const router = useRouter();

  function onCurrentReadingPress() {
    router.push("/bookList/currently_reading");
  }

  function onCompletedPress() {
    router.push("/bookList/completed");
  }

  function onToReadPress() {
    router.push("/bookList/future_reading");
  }

  return (
    <View>
      <View style={styles.galleryItem}>
        <Button
          style={styles.galleryItemButton}
          onPress={onCurrentReadingPress}
        >
          <Text style={styles.galleryItemButtonText}>Currently reading</Text>
        </Button>
        <Image
          style={{
            width: 150,
            height: 150,
            marginLeft: 20,
          }}
          contentFit="contain"
          source={require("./../../assets/images/currently_reading.png")}
        />
      </View>
      <View style={styles.galleryItem}>
        <Button style={styles.galleryItemButton} onPress={onCompletedPress}>
          <Text style={styles.galleryItemButtonText}>Completed books</Text>
        </Button>
        <Image
          contentFit="contain"
          style={{ width: 150, height: 150, marginLeft: 20 }}
          source={require("./../../assets/images/completed.png")}
        />
      </View>
      <View style={styles.galleryItem}>
        <Button style={styles.galleryItemButton} onPress={onToReadPress}>
          <Text style={styles.galleryItemButtonText}>Books to read</Text>
        </Button>
        <Image
          contentFit="contain"
          style={{ width: 150, height: 150, marginLeft: 20 }}
          source={require("./../../assets/images/to_read.png")}
        />
      </View>
    </View>
  );
}

function Shelves() {
  const { user } = useUser();
  const { books } = useUserBooksStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const openModal = (book: any) => {
    setSelectedBook(book);
    setModalVisible(true);
  };
  const deleteBook = async (bookId: any) => {
    console.log("Deleting book with ID:", bookId);
    const { data, error } = await supabase
      .from("users_books")
      .delete()
      .match({ id: bookId });

    if (error) {
      console.error("Error deleting book:", error);
      alert("Failed to delete book.");
    } else {
      // console.log("Book deleted successfully:", data);
      alert("Book deleted successfully.");
    }

    setModalVisible(false);
  };

  return (
    <>
      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{
          flex: 1,
        }}
      >
        {shelves.map((shelf) => (
          <View
            key={shelf.id}
            style={{
              minWidth: "100%",
              alignItems: "flex-start",
              position: "relative",
              borderBottomWidth: 3,
              borderColor: "black",
            }}
          >
            <Text style={{ marginVertical: 10, marginHorizontal: 10 }}>
              {shelf.title}
            </Text>
            <View
              style={{
                backgroundColor: "#D2B48C",
                height: 10,
                position: "absolute",
                left: 0,
                bottom: 0,
                width: "100%",
                zIndex: 1000,
              }}
            ></View>
            <ScrollView
              key={shelf.id}
              horizontal={true}
              style={{ height: "25%" }}
              contentContainerStyle={{ minWidth: "100%" }}
            >
              {books
                ?.filter((book) => book.status === shelf.id)
                .map((user_book) => {
                  return (
                    <>
                      <TouchableOpacity
                        key={user_book.id}
                        style={{ width: 100, marginHorizontal: 10, flex: 0 }}
                        onPress={() => openModal(user_book.id)}
                      >
                        <Image
                          contentFit="contain"
                          style={{ width: 100, height: 150 }}
                          source={{ uri: user_book.book.cover_url || "" }}
                        />
                      </TouchableOpacity>
                      <View>
                        <Modal
                          animationType="slide"
                          transparent={true}
                          visible={modalVisible}
                          onRequestClose={() => {
                            setModalVisible(!modalVisible);
                          }}
                        >
                          <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                              <Image
                                contentFit="contain"
                                style={{ width: 100, height: 150 }}
                                source={{ uri: user_book.book.cover_url || "" }}
                              />
                              <Button onPress={() => deleteBook(user_book.id)}>
                                <Text style={{ color: "white" }}>Delete</Text>
                              </Button>
                            </View>
                          </View>
                        </Modal>
                      </View>
                    </>
                  );
                })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 40,
    marginVertical: 20,
  },
  tab: {
    padding: 10,
    marginHorizontal: 4,
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "#ddd",
  },
  selectedTab: {
    backgroundColor: "black",
    borderColor: "black",
  },
  tabTitle: {
    fontSize: 16,
  },
  selectedTabTitle: {
    color: "white",
  },
  placeholderBox: {
    width: 150,
    height: 150,
    backgroundColor: "lightgray",
    marginLeft: 20,
  },
  galleryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  galleryItemButtonText: {
    fontWeight: "600",
    color: "white",
  },
  galleryItemButton: {
    backgroundColor: "#7EB0B8",
    height: 50,
    borderRadius: 10,
    width: "45%",
    paddingHorizontal: 0,
  },
});
