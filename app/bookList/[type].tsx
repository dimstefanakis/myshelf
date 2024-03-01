import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { ScrollView, Dimensions } from "react-native";
import { View, Text, Button } from "@/components/Themed";
import useUser from "@/hooks/useUser";

export default function App() {
  const router = useRouter();
  const { user } = useUser();
  const localSearchParams = useLocalSearchParams();
  const type = localSearchParams.type;
  const height = Dimensions.get("window").height;
  const width = Dimensions.get("window").width;
  const bookImageWidth = width / 3 - 20;
  const bookImageHeight = bookImageWidth * 1.5;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-evenly",
          alignItems: "flex-start",
          marginTop: 20,
        }}
      >
        {user?.books.map((userBook) => {
          return (
            <View
              key={userBook.id}
              style={{
                width: "30%",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Image
                source={{ uri: userBook.book.cover_url || "" }}
                style={{ width: bookImageWidth, height: bookImageHeight }}
                contentFit="contain"
              />
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  marginTop: 10,
                }}
              >
                {userBook.book.title}
              </Text>
              {/* <Button
            title="View"
            onPress={()=>{
              router.push('/book', {id: book.id});
            }}
          /> */}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
