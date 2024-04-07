import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {
  Entypo,
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import { Dimensions, Pressable, ActivityIndicator } from "react-native";
import Toast from "react-native-root-toast";
import { supabase } from "@/utils/supabase";
import { View, Text, Button, ScrollView } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";

export default function BookList() {
  const router = useRouter();
  const { user } = useUser();
  const { books } = useUserBooksStore();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const localSearchParams = useLocalSearchParams();
  const type = localSearchParams.type;
  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const bookImageWidth = width / 3 - 20;
  const bookImageHeight = bookImageWidth * 1.5;

  async function onAddToCompletedPile(id: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("users_books")
      .update({ status: "completed" })
      .eq("id", id);
    setLoading(false);
    if (error) {
      let toast = Toast.show(
        "There was an error adding to your completed pile",
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        },
      );
    } else {
      let toast = Toast.show("Successfully added to your completed pile", {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  }
  async function onAddToCurrentlyReading(id: string) {
    setLoading(true);
    const { data, error } = await supabase
      .from("users_books")
      .update({ status: "currently_reading" })
      .eq("id", id);
    setLoading(false);
    if (error) {
      let toast = Toast.show(
        "There was an error adding to your currently reading pile",
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        },
      );
    } else {
      let toast = Toast.show(
        "Successfully added to your currently reading pile",
        {
          duration: Toast.durations.SHORT,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        },
      );
    }
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-around",
          alignItems: "flex-start",
          // alignContent: "flex-start",
          paddingVertical: 20,
        }}
      >
        {books
          .filter((userBook) => {
            return userBook.status == type;
          })
          .map((userBook) => {
            return (
              <View
                key={userBook.id}
                style={{
                  width: "30%",
                  alignItems: "center",
                  marginTop: 20,
                  // marginRight: "auto",
                  // marginLeft: "auto",
                }}
              >
                <Image
                  source={{ uri: userBook.book.cover_url || "" }}
                  style={{ width: bookImageWidth, height: bookImageHeight }}
                  contentFit="contain"
                />
                <Text
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    marginTop: 10,
                  }}
                >
                  {userBook.book.title}
                </Text>
                {type === "future_reading" && (
                  <Button
                    onPress={() => onAddToCurrentlyReading(userBook.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      marginTop: 10,
                      width: "100%",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "500",
                          fontSize: 12,
                        }}
                      >
                        Move to reading pile
                      </Text>
                    )}
                  </Button>
                )}
                {type === "currently_reading" && (
                  <Button
                    onPress={() => onAddToCompletedPile(userBook.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 6,
                      marginTop: 10,
                      width: "100%",
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text
                        style={{
                          color: "white",
                          textAlign: "center",
                          fontWeight: "500",
                          fontSize: 12,
                        }}
                      >
                        Move to finished pile
                      </Text>
                    )}
                  </Button>
                )}
              </View>
            );
          })}
        <AddButton />
      </View>
    </ScrollView>
  );
}

// should look the same as a book item
function AddButton() {
  const router = useRouter();
  const localSearchParams = useLocalSearchParams();
  const type = localSearchParams.type;
  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const bookImageWidth = width / 3 - 20;
  const bookImageHeight = bookImageWidth * 1.5;

  function onClick() {
    router.push(`/searchModal/${type}`);
  }

  return (
    <View
      style={{
        width: bookImageWidth,
        height: bookImageHeight,
        marginTop: 20,
      }}
    >
      <Button
        onPress={onClick}
        style={{
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: "#d3d3d3",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Entypo name="plus" size={24} color="black" />
      </Button>
    </View>
  );
}
