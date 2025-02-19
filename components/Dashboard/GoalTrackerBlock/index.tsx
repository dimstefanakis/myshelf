import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { YStack, Text, View, Separator } from "tamagui";
import useUser from "@/hooks/useUser";
import { useNavigation } from "expo-router";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useGoalTrackerStore } from "@/store/goalTrackerStore";

function isConsecutive(prevDate: string, currentDate: string) {
  const prev = new Date(prevDate);
  const current = new Date(currentDate);
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.abs((current.getTime() - prev.getTime()) / oneDay) === 1;
}

const GoalTrackerBlock = () => {
  const { user } = useUser();
  const navigation = useNavigation();
  const { 
    goals, 
    goalLogs, 
    streak,
    fetchGoals, 
    getGoalProgress,
    calculateStreak,
    listenToLogUpdates,
    listenToGoalUpdates 
  } = useGoalTrackerStore();

  console.log(streak, 'steak');
  const [checkmarks, setCheckmarks] = useState([
    { day: "Su", hasGoal: false },
    { day: "Mo", hasGoal: false },
    { day: "Tu", hasGoal: false },
    { day: "We", hasGoal: false },
    { day: "Th", hasGoal: false },
    { day: "Fr", hasGoal: false },
    { day: "Sa", hasGoal: false },
  ]);

  // Calculate current goal from store data
  const currentGoal = {
    pages: goalLogs.find(log => log.time_type === 'daily')?.logs.reduce(
      (acc, log) => acc + (log.unit_amount || 0), 
      0
    ) || 0,
    target: goals.find(
      goal => goal.time_type === 'daily' && goal.type === 'pages'
    )?.unit_amount || 15
  };

  useEffect(() => {
    if (user?.id) {
      fetchGoals(user.id);
      getGoalProgress(user.id);
      listenToLogUpdates(user.id);
      listenToGoalUpdates(user.id);
    }
  }, [user]);

  // Update checkmarks whenever goalLogs changes
  useEffect(() => {
    if (goalLogs.length > 0) {
      const allLogs = goalLogs.find(log => log.time_type === 'all')?.logs || [];
      
      // Sort logs by date in descending order
      const sortedLogs = allLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      let currentStreak = 0;
      let prevDate;

      // Check if there's a log for today
      const today = new Date().toISOString().slice(0, 10);
      const lastLog = sortedLogs[0] ? new Date(sortedLogs[0].created_at).toISOString().slice(0, 10) : null;
      
      if (today !== lastLog) {
        calculateStreak(0);
        return;
      }

      // Calculate streak
      for (const log of sortedLogs) {
        const logDate = new Date(log.created_at).toISOString().slice(0, 10);

        if (!prevDate || isConsecutive(prevDate, logDate)) {
          currentStreak++;
          prevDate = logDate;
        } else {
          break;
        }
      }

      calculateStreak(currentStreak);
    }
  }, [goalLogs]);

  return (
    <YStack
      width="100%"
      backgroundColor='$orange2'
      borderRadius="$2"
      borderColor="$orange6"
      borderWidth={1}
      padding="$4"
      space="$4"
      onPress={() => navigation.navigate('GoalTracker')}
    >
      <Text fontSize="$5" fontWeight="bold">Goals</Text>

      <YStack alignItems="center">
        <YStack alignItems="center" marginBottom={-26}>
          <AnimatedCircularProgress
            size={140}
            width={8}
            fill={(currentGoal.pages / currentGoal.target) * 100}
            tintColor="#CD8B65"
            backgroundColor="#FFE8D7"
            arcSweepAngle={180}
            rotation={-90}
            lineCap="round"
          >
            {() => (
              <YStack alignItems="center" space="$1" marginBottom="$3">
                <Text fontSize={25} fontWeight="bold">{currentGoal.pages}</Text>
                <Text fontSize={15} maxWidth={100} textAlign="center" color="$gray10">pages read today</Text>
              </YStack>
            )}
          </AnimatedCircularProgress>
        </YStack>
        <Separator marginVertical={15} width="100%" borderRadius="$2" borderWidth={1} borderColor="$gray5"/>
        <YStack alignItems="center" space="$1">
          <Text fontSize={40} fontWeight="bold">{streak}</Text>
          <Text fontSize={20} color="$gray10">day streak</Text>
          <YStack space="$2" marginTop="$4">
            <View style={styles.dotsContainer}>
              {Array(4).fill(0).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i < streak ? '#CD8B65' : '#FFE8D7' }
                  ]}
                />
              ))}
            </View>
            <View style={[styles.dotsContainer, { justifyContent: 'center' }]}>
              {Array(3).fill(0).map((_, i) => (
                <View
                  key={i + 4}
                  style={[
                    styles.dot,
                    { backgroundColor: (i + 4) < streak ? '#CD8B65' : '#FFE8D7' }
                  ]}
                />
              ))}
            </View>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    elevation: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
  }
});

export default GoalTrackerBlock;