import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryPie,
} from "victory-native";
import { Button, XStack } from "tamagui";
import StatisticsView from "@/components/StatisticsView";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import { useRouter } from "expo-router";
import { ChevronLeft } from "@tamagui/lucide-icons";

function StatisticsScreen() {
  const router = useRouter();
  return (
    <SafeAreaViewFixed style={{ flex: 1 }}>
      <StatisticsView />
    </SafeAreaViewFixed>
  );
}
export default StatisticsScreen;
