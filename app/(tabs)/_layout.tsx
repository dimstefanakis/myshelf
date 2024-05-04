import React, { useEffect } from "react";
import { useRouter, Redirect } from "expo-router";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Entypo,
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
} from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import useUser from "@/hooks/useUser";
import Search from "./search";
import HomeStack from "../navigators/gridNavigator";
import ChronologyScreen from "../gridNavigation/chronology";
import StatisticsScreen from "../gridNavigation/statistics";
import ProfileScreen from "./profile";
import MyShelfScreen from "./myshelf";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const router = useRouter();
  const { user, session, initialLoaded, loading } = useUser();
  const colorScheme = useColorScheme();

  if (initialLoaded && (!user || !session)) {
    return <Redirect href="/login" />;
  }
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors["light"].tint,
        headerShown: false,
      }}
    >
      {/* Points to the grid navigator to enable nested routes */}
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          // tabBarButton:()=> null,
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="search1" size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyShelf"
        component={MyShelfScreen}
        options={{
          title: "MyShelf",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="bookshelf" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle" size={24} color={color} />
          ),
          // tabBarButton: () => null,
        }}
      />
    </Tab.Navigator>
  );
}
