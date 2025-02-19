import React, { useState, useEffect } from "react";
import { StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "@/utils/supabase";
import useUser from "@/hooks/useUser";
import { ChevronLeft } from '@tamagui/lucide-icons';
import { XStack, YStack, Button, Text, View, Input, ScrollView } from "tamagui";
import SafeAreaViewFixed from "@/components/SafeAreaView";
import { useGoalTrackerStore } from "@/store/goalTrackerStore";
import type { Database } from "@/types_db";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

export default function EditGoalScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { fetchGoals } = useGoalTrackerStore();
  const params = useLocalSearchParams();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchGoal(params.id as string);
    }
  }, [params.id]);

  async function fetchGoal(id: string) {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setGoal(data);
      setValue(data.unit_amount?.toString() || "");
    }
  }

  async function handleSave() {
    if (!value || !user?.id || !goal) return;

    setLoading(true);
    const { error } = await supabase
      .from("goals")
      .update({
        unit_amount: parseInt(value),
      })
      .eq("id", goal.id);

    fetchGoals(user.id);

    setLoading(false);
    if (!error) {
      router.back();
    }
  }

  if (!goal) return null

  return (
    <SafeAreaViewFixed style={{ flex: 1 }}>
      <YStack flex={1}>
        <XStack justifyContent="space-between" alignItems="center">
          <Button
            borderRadius={100}
            w={50}
            h={50}
            chromeless
            icon={<ChevronLeft size={24} color="$gray10" />}
            onPress={() => router.back()}
          />
          <Text fontSize="$5" fontWeight="bold" textTransform="capitalize">
            {goal.type} {goal.time_type}
          </Text>
          <View style={{ width: 50 }} />
        </XStack>

        <YStack width="100%" p="$4" f={1}>
          <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
            <Text fontSize="$4" color="$gray10">Target Amount</Text>
            <Input
              size="$8"
              width={200}
              textAlign="center"
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
              fontSize={40}
            />
          </YStack>

          <Button
            size="$6"
            width="100%"
            mb="$4"
            backgroundColor="$orange10"
            color="white"
            pressStyle={{ backgroundColor: "$orange8" }}
            onPress={handleSave}
            disabled={loading || !value}
          >
            {loading ? "Saving..." : "Save Goal"}
          </Button>
        </YStack>
      </YStack>
    </SafeAreaViewFixed>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 