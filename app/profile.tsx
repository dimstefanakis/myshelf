import { Button, View, Text, ScrollView } from "@/components/Themed";
import { Button as TamaguiButton } from "@tamagui/button";
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { Image, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import { supabase } from "@/utils/supabase";
import { ChevronLeft } from "@tamagui/lucide-icons";

export default function TabTwoScreen() {
  const router = useRouter();
  const handleSignout = async () => {
    supabase.auth.signOut();
  };

  const handleContactUs = () => {
    Linking.openURL('mailto:support@bnooks.com');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://bnooks.com/privacy-policy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://bnooks.com/terms-of-use');
  };

  const handleManageAccount = () => {
    router.push('/manage-account');
  };

  return (
    <SafeAreaViewFixed style={{ flex: 1 }}>
      <TamaguiButton
        borderRadius={100}
        w={50}
        h={50}
        chromeless
        icon={<ChevronLeft size={24} color="$gray10" />}
        onPress={() => router.back()}
      />
      
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
        {/* <View style={styles.rewardsSection}>
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
      </View> */}
        <View>
          <TouchableOpacity style={styles.menuItem} onPress={handleManageAccount}>
            <Text style={styles.menuItemText}>Manage Account</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={30}
              color="#788490"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleContactUs}>
            <Text style={styles.menuItemText}>Contact Us</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={30}
              color="#788490"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={30}
              color="#788490"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleTermsOfService}>
            <Text style={styles.menuItemText}>Terms of Service</Text>
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
          {/* <Image
          source={require("./../../assets/images/waterstone_plus_banner.png")}
          style={styles.waterstonesPlusImage}
        /> */}
        </View>
      </ScrollView>
    </SafeAreaViewFixed>
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
