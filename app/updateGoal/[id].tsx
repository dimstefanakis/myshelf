import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { XStack, YStack, Text, Button } from 'tamagui';
import ArcSlider from '@/components/ArcSlider';
import { supabase } from '@/utils/supabase';
import useUser from '@/hooks/useUser';
import { useGoalTrackerStore } from '@/store/goalTrackerStore';
import SafeAreaViewFixed from '@/components/SafeAreaView';
import { ChevronLeft, Pencil } from '@tamagui/lucide-icons';
import Colors from '@/constants/Colors';

export default function UpdateGoalScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { goals, goalLogs, getGoalProgress } = useGoalTrackerStore();
  const [value, setValue] = useState(0);
  const [defaultValue, setDefaultValue] = useState(0);
  const [goal, setGoal] = useState<any>(null);

  useEffect(() => {
    const currentGoal = goals.find(g => g.id === id);
    if (currentGoal) {
      setGoal(currentGoal);

      // Calculate initial progress value
      let progress = 0;
      if (currentGoal.type !== "days") {
        const timelogs = goalLogs.find(log => log.time_type === currentGoal.time_type);
        if (timelogs) {
          const logs = timelogs.logs.filter(log => {
            if (currentGoal.time_type === "daily") {
              return log.type === currentGoal.type && log?.goal?.time_type === "daily";
            } else if (currentGoal.time_type === "weekly") {
              return log.type === currentGoal.type &&
                (log?.goal?.time_type === "weekly" || log?.goal?.time_type === "daily");
            } else if (currentGoal.time_type === "monthly") {
              return log.type === currentGoal.type &&
                (log?.goal?.time_type === "monthly" || log?.goal?.time_type === "weekly" ||
                  log?.goal?.time_type === "daily");
            } else {
              return log.type === currentGoal.type;
            }
          });
          progress = logs.reduce((acc, log) => acc + (log.unit_amount ?? 0), 0);
        }
      } else {
        const logs = goalLogs.find(log => log.time_type === "all");
        if (logs) {
          progress = logs.week_count || 0;
        }
      }
      setDefaultValue(progress);
      setValue(progress);
    }
  }, [id, goals, goalLogs]);

  const handleSave = async () => {
    if (!user?.id || !goal) return;

    try {
      const incrementalValue = value - defaultValue;
      if (incrementalValue <= 0) return; // Don't save if there's no increase

      const { error } = await supabase.from('goal_logs').insert({
        goal: goal.id,
        user: user.id,
        type: goal.type,
        unit_amount: incrementalValue // Save only the incremental amount
      });

      if (error) throw error;

      // Update the goals store with new progress
      await getGoalProgress(user.id);

      router.back();
    } catch (error) {
      console.error('Error saving goal log:', error);
    }
  };

  if (!goal) return null;

  return (
    <SafeAreaViewFixed style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <YStack f={1} ai="center">
        <XStack width="100%">
          <Button
            borderRadius={100}
            w={50}
            h={50}
            chromeless
            icon={<ChevronLeft size={24} color="$gray10" />}
            onPress={() => router.back()}
          />
          <XStack flex={1} />
          <Button
            borderRadius={100}
            w={50}
            h={50}
            chromeless
            icon={<Pencil size={24} color="$gray10" />}
            onPress={() => router.push(`/editGoal?id=${id}`)}
          />
        </XStack>

        <YStack width="100%" p="$4" f={1}>
          <YStack f={1} jc="center" ai="center" p="$4">
            <ArcSlider
              size={300}
              strokeWidth={30}
              startAngle={0}
              endAngle={360}
              min={0}
              max={goal.unit_amount || 1}
              value={value}
              minLock={defaultValue}
              onChange={(newValue) => setValue(newValue)}
            />
            <Text fontSize="$6" fontWeight="bold" mt="$4">
              {value} / {goal.unit_amount} {goal.type}
            </Text>
            <Text fontSize="$4" textAlign="center">
              read
            </Text>
          </YStack>
          <Button
            size="$6"
            width="100%"
            mb="$4"
            onPress={handleSave}
            disabled={value <= defaultValue}
            backgroundColor="$orange10"
            color="white"
            pressStyle={{ backgroundColor: "$orange8" }}
          >
            Save Progress
          </Button>
        </YStack>
      </YStack>
    </SafeAreaViewFixed>
  );
}
