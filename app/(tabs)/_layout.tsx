import React, { useEffect } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import useUser from "@/hooks/useUser";
import { Entypo, AntDesign, MaterialCommunityIcons, Ionicons  } from '@expo/vector-icons';

export default function TabLayout() {
  const router = useRouter();
  const { user, session, loading } = useUser();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if ((session && !session?.access_token) || (!loading && !session)) {
      router.replace("/login");
    }
  }, [session, loading]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
          <Entypo name="home" size={24} color={color} />
          ),
        }}
        
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
          <AntDesign name="search1" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="myshelf"
        options={{
          title: "MyShelf",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookshelf" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="chronology"
        options={{
          title: "Chronology",
          tabBarIcon: ({ color }) => null,
          // tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="statistics"
        options={{
          title: "Statistics",
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart-sharp" size={24} color="black" />
        // tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person-circle" size={24} color="black" />
        // tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
