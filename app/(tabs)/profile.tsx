import { Button, View, Text, ScrollView } from "@/components/Themed";
import React from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "@/utils/supabase";

export default function TabTwoScreen() {
  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };
  return (
    <ScrollView style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity>
          <MaterialIcons name="edit" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ display: "flex", alignItems: "center" }}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Ionicons name="person-circle-outline" size={80} color="white" />
        </View>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="white" />
        </TouchableOpacity>
      </View> */}
      <View style={styles.rewardsSection}>
        <Text
          style={{
            textAlign: "left",
            color: "#336E79",
            fontWeight: "bold",
            marginBottom: 5,
          }}
        >
          YOUR ACCOUNT & PLUS REWARDS
        </Text>
        <Text
          style={{ textAlign: "left", fontWeight: "bold", marginBottom: 5 }}
        >
          Get more with Waterstones Plus
        </Text>
        <Text style={{ marginBottom: 20 }}>
          Join Plus today and earn and redeem rewards as you spend in our shops,
          cafes, and online.
        </Text>
        <Image
          source={require("./../../assets/images/profile_waterstones_plus.png")}
          style={styles.cardsImage}
        />
        <View style={styles.buttons}>
          <Button style={styles.signInButton}>
            <Text
              style={{ color: "#336E79", fontSize: 18, fontWeight: "bold" }}
            >
              {" "}
              Sign in
            </Text>
          </Button>
          <Button style={styles.registerButton}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              Register
            </Text>
          </Button>
        </View>
      </View>
      <View>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Manage Account</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={30}
            color="#788490"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Contact Us</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={30}
            color="#788490"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleSignout}>
          <Text style={styles.menuItemText}>Sign Out</Text>
          <MaterialIcons
            name="keyboard-arrow-right"
            size={30}
            color="#788490"
          />
        </TouchableOpacity>
        <Image
          source={require("./../../assets/images/waterstone_plus_banner.png")}
          style={styles.waterstonesPlusImage}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
  },
  buttons: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    height: 51,
  },
  header: {
    backgroundColor: "#00A7E1",
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    height: 130,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  rewardsSection: {
    // backgroundColor: "#ffffff",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#B8C0CB",
  },
  cardsImage: {
    height: 100,
    resizeMode: "contain",
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: "white",
    width: "50%",
    borderWidth: 2,
    borderColor: "#336E79",
  },
  registerButton: {
    backgroundColor: "#336E79",
    width: "50%",
    alignItems: "center",
    padding: 50,
  },
  menuItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#B8C0CB",
    height: 65,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#788490",
  },
  waterstonesPlusImage: {
    width: "100%",
    marginVertical: 20,
  },
});
