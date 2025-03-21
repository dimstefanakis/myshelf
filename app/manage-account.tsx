import { View, Text, ScrollView } from "@/components/Themed";
import { Button as TamaguiButton } from "@tamagui/button";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, Linking, Modal, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import { supabase } from "@/utils/supabase";
import { ChevronLeft } from "@tamagui/lucide-icons";
import useUser from "@/hooks/useUser";

export default function ManageAccountScreen() {
  const router = useRouter();
  const { session } = useUser();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  useEffect(() => {
    const getUserEmail = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };

    getUserEmail();
  }, []);

  const handleSignout = async () => {
    supabase.auth.signOut();
  };

  const showDeleteConfirmation = () => {
    setIsDeleteModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);

      // Call the delete API endpoint directly instead of sending email
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/users/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: session?.access_token,
          refresh_token: session?.refresh_token,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      // Account deleted successfully, sign out the user
      await handleSignout();
      // router.push("/");
      // toast.success('Your account has been deleted successfully');
    } catch (error) {
      console.error("Error deleting account:", error);
      // toast.error('Failed to delete your account. Please try again later.');
    } finally {
      setIsDeleteModalVisible(false);
      setIsLoading(false);
    }
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
        <View>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={showDeleteConfirmation}
          >
            <Text style={styles.menuItemText}>Delete Account</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={30}
              color="#788490"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          onPress={() => setIsDeleteModalVisible(false)}
          style={styles.centeredView}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={styles.modalView}
          >
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>
            <View style={styles.buttonContainer}>
              <TamaguiButton
                style={styles.cancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TamaguiButton>
              <TamaguiButton
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                disabled={isLoading}
              >
                <Text style={styles.deleteButtonText}>
                  {isLoading ? "Deleting..." : "Delete Account"}
                </Text>
              </TamaguiButton>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaViewFixed>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "white",
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "$orange11",
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: "45%",
  },
  cancelButtonText: {
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: "45%",
  },
  deleteButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
});
