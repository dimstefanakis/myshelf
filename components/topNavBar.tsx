import React from "react";
import { Text, View } from "@/components/Themed";
import { Image } from "react-native";

function TopNavBar() {
  return (
    <View
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        backgroundColor: "inherit",
        alignItems: "center",
      }}
    >
      <Image
        source={require("../assets/images/myshelf_logo.png")}
        style={{ width: 70, height: 70 }}
      />
      <Text style={{ fontSize: 16, color: "#326E78", marginVertical: 10 }}>
        Explore and visualise your reading!
      </Text>
    </View>
  );
}

export default TopNavBar;
