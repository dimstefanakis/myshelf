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
import Search from "../search";
import HomeStack from "../navigators/gridNavigator";
import ChronologyScreen from "../gridNavigation/chronology";
import StatisticsScreen from "../statistics";
import ProfileScreen from "../profile";
import MyShelfScreen from "../shelves";

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const router = useRouter();
  const { user, session, initialLoaded, loading } = useUser();

  if (initialLoaded && (!user || !session)) {
    return <Redirect href="/login" />;
  }

  return <HomeStack />;
}
