import { StyleSheet } from "react-native";

// import EditScreenInfo from '@/components/topNavBar';
import { Text, View,Button } from "@/components/Themed";
import {supabase} from "@/utils/supabase";

export default function TabTwoScreen() {
  const handleSignout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log("Error logging out:", error.message);
  };
  return (
    <View>
      <Text>Profile</Text>
      {/* signout */}
      <View >
        <Button onPress={handleSignout}><Text style={{color:"white"}}>
          Signout
          </Text>
          </Button>
        </View>
    </View>
  );
}
