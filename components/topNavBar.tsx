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
        source={require("../assets/images/alogo.png")}
        style={{ width: 50, height: 90 }}
      />
      <Text style={{ fontSize: 20, color: "black" }}>
        Explore and visualise your reading!
      </Text>
    </View>
  );
}

export default TopNavBar;
