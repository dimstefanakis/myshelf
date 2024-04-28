import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import PagerView from "react-native-pager-view";
import { View, Text, Button, TextInput } from "@/components/Themed";
import useUser, { User } from "@/hooks/useUser";
import type { Database } from "@/types_db";
import { supabase } from "@/utils/supabase";

type Goal = Database["public"]["Tables"]["goals"]["Row"];

type GoalLog = {
  time_type: string;
  logs: Database["public"]["Tables"]["goal_logs"]["Row"][];
  week_count?: number;
  month_count?: number;
};

const width = Dimensions.get("window").width;
const tabs = [
  {
    title: "Daily",
    value: "daily",
  },
  {
    title: "Weekly",
    value: "weekly",
  },
  {
    title: "Monthly",
    value: "monthly",
  },
  {
    title: "Yearly",
    value: "yearly",
  },
];

function GoalTrackerScreen() {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalLogs, setGoalLogs] = useState<GoalLog[]>([]);
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const markers = [
    { day: "6", completed: true },
    { day: "7", completed: false },
    { day: "8", completed: true },
    { day: "9", completed: true },
    { day: "10", completed: false },
  ];

  async function fetchGoals() {
    setLoading(true);
    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user", user?.id || "");

    setGoals((goals as Goal[]) || []);
    setLoading(false);
  }

  async function getGoalProgress() {
    // starts from the beginning of the day
    const dailyStart = new Date();
    dailyStart.setUTCHours(0, 0, 0, 0);

    // ends at the end of the day
    const dailyEnd = new Date();
    dailyEnd.setDate(dailyStart.getDate() + 1);

    const weeklyStart = new Date();
    // should start at the beginning of the week
    weeklyStart.setUTCHours(0, 0, 0, 0);
    if (weeklyStart.getDay() !== 0) {
      weeklyStart.setDate(weeklyStart.getDate() - weeklyStart.getDay());
    } else {
      weeklyStart.setDate(weeklyStart.getDate() - 7);
    }
    const weeklyEnd = new Date();
    weeklyEnd.setDate(weeklyStart.getDate() + 7);

    const monthlyStart = new Date();
    // should start at the beginning of the month
    monthlyStart.setUTCHours(0, 0, 0, 0);
    monthlyStart.setDate(1);
    const monthlyEnd = new Date();
    monthlyEnd.setMonth(monthlyStart.getMonth() + 1);

    const yearlyStart = new Date();
    // should start at the beginning of the year
    yearlyStart.setUTCHours(0, 0, 0, 0);
    yearlyStart.setMonth(0);
    yearlyStart.setDate(1);
    const yearlyEnd = new Date();
    yearlyEnd.setFullYear(yearlyStart.getFullYear() + 1);

    setLoadingLogs(true);
    const { data: allLogs, error: allLogsError } = await supabase
      .from("goal_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "");

    const { data: dayGoals, error: dayGoalsError } = await supabase
      .from("goal_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "")
      .or("type.eq.pages,type.eq.minutes")
      .gte("created_at", dailyStart.toISOString())
      .lt("created_at", dailyEnd.toISOString());

    const { data: weekGoals, error: weekGoalsError } = await supabase
      .from("goal_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "")
      .eq("type", "pages")
      .gte("created_at", weeklyStart.toISOString())
      .lt("created_at", weeklyEnd.toISOString());

    const { data: monthGoals, error: monthGoalsError } = await supabase
      .from("goal_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "")
      .eq("type", "books")
      .gte("created_at", monthlyStart.toISOString())
      .lt("created_at", monthlyEnd.toISOString());

    const { data: yearGoals, error: yearGoalsError } = await supabase
      .from("goal_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "")
      .eq("type", "books")
      .gte("created_at", yearlyStart.toISOString())
      .lt("created_at", yearlyEnd.toISOString());

    if (
      allLogsError ||
      dayGoalsError ||
      weekGoalsError ||
      monthGoalsError ||
      yearGoalsError
    ) {
      return;
    }
    const combinedGoals = [
      {
        time_type: "daily",
        logs: dayGoals,
      },
      {
        time_type: "weekly",
        logs: weekGoals,
      },
      {
        time_type: "monthly",
        logs: monthGoals,
      },
      {
        time_type: "yearly",
        logs: yearGoals,
      },
      {
        time_type: "all",
        logs: allLogs,
        // count days where there is a log
        // use the allLogs to get the unique days, starting from the weekly_start to weekly_end
        // multiple logs in a day should be counted as one
        week_count: allLogs
          .filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= weeklyStart && logDate < weeklyEnd;
          })
          .reduce<number[]>((acc, log) => {
            const logDate = new Date(log.created_at);
            const logDay = logDate.getDate();
            if (!acc.includes(logDay)) {
              acc.push(logDay);
            }
            return acc;
          }, []).length,
        month_count: allLogs
          .filter((log) => {
            const logDate = new Date(log.created_at);
            return logDate >= monthlyStart && logDate < monthlyEnd;
          })
          .reduce<number[]>((acc, log) => {
            const logDate = new Date(log.created_at);
            const logDay = logDate.getDate();
            if (!acc.includes(logDay)) {
              acc.push(logDay);
            }
            return acc;
          }, []).length,
      },
    ];
    setGoalLogs(combinedGoals);
    setLoadingLogs(false);
  }

  async function listenToLogUpdates() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goal_logs",
        },
        () => {
          fetchGoals();
        },
      )
      .subscribe();

    return channel;
  }

  useEffect(() => {
    if (user?.id) {
      fetchGoals();
      getGoalProgress();
      listenToLogUpdates();
    }
  }, [user]);

  return (goals.length == 0 || goalLogs.length == 0) &&
    (loadingLogs || loading) ? (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  ) : (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginBottom: 30,
          paddingTop: 10,
          width: "100%",
        }}
      >
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            onPress={() => setSelectedTab(tab)}
            style={{
              width: width / tabs.length - 3,
              backgroundColor:
                tab.value === selectedTab.value ? "black" : "white",
            }}
          >
            <Text
              style={{
                color: tab.value === selectedTab.value ? "white" : "black",
              }}
            >
              {tab.title}
            </Text>
          </Button>
        ))}
      </View>
      {goalLogs.length > 0 && goals.length > 0 && (
        <PagerView
          key={selectedTab.value}
          initialPage={0}
          onPageSelected={(e) => setCurrentIndex(e.nativeEvent.position)}
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {goals
            .filter((goal) => goal.time_type === selectedTab.value)
            .map((goal, i) => {
              let progress = 0;
              if (goal.type != "days") {
                const timelogs = goalLogs.find((log) => {
                  return log.time_type == selectedTab.value;
                });
                if (timelogs) {
                  const logs = timelogs.logs.filter(
                    (log) => log.type === goal.type,
                  );
                  progress = logs.reduce(
                    (acc, log) => acc + (log.unit_amount ?? 0),
                    0,
                  );
                }
              } else {
                // get count of unique days where a log was created
                // multiple logs in one day should only count as one
                const logs = goalLogs.find((log) => {
                  return log.time_type == "all";
                });
                if (logs) {
                  progress = logs.week_count || 0;
                }
              }

              const percentage =
                ((progress ?? 0) / (goal.unit_amount ?? 1)) * 100;
              return (
                <View
                  key={i + 1}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AnimatedCircularProgress
                    size={200}
                    width={2}
                    fill={percentage}
                    tintColor="#5A6978"
                    backgroundColor="#b4cbcf"
                    arcSweepAngle={260}
                    rotation={230}
                  >
                    {(fill) => (
                      <View style={{ alignItems: "center" }}>
                        <Text style={styles.points}>
                          {progress || 0}/{goal.unit_amount}
                        </Text>
                        <Text>{goal.type}</Text>
                      </View>
                    )}
                  </AnimatedCircularProgress>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[styles.progressBar, { width: `${percentage}%` }]}
                    />
                  </View>
                </View>
              );
            })}
        </PagerView>
      )}
      {selectedTab.value != "yearly" ? (
        <View style={{ flexDirection: "row" }}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === 0 ? "#507C82" : "#B4CBCF",
                marginRight: 5,
              },
            ]}
          ></View>
          <View
            style={[
              styles.dot,
              { backgroundColor: currentIndex === 1 ? "#507C82" : "#B4CBCF" },
            ]}
          ></View>
        </View>
      ) : (
        <View style={{ height: 10 }}></View>
      )}

      {user && (
        <UpdateGoals
          tab={selectedTab}
          user={user}
          goals={goals}
          refresh={() => {
            fetchGoals();
            getGoalProgress();
          }}
        />
      )}
      <View style={{ flexDirection: "row" }}>
        <Button style={{ marginTop: 30, marginRight: 10 }}>
          <Text style={{ color: "white" }}>View history</Text>
        </Button>
        <EditGoals tab={selectedTab} />
      </View>
      <View style={{ flex: 1 }}></View>
      {/* <StreakChallenge week={2} days={7} markers={markers} /> */}
    </View>
  );
}

function EditGoals({ tab }: { tab: (typeof tabs)[0] }) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  function getGoalTabs() {
    if (tab.value === "daily") {
      return [
        {
          title: "Pages",
          value: "pages",
        },
        {
          title: "Minutes",
          value: "minutes",
        },
      ];
    }
    if (tab.value === "weekly") {
      return [
        {
          title: "Days",
          value: "days",
        },
        {
          title: "Pages",
          value: "pages",
        },
      ];
    }
    if (tab.value === "monthly") {
      return [
        {
          title: "Books",
          value: "books",
        },
        {
          title: "Days",
          value: "days",
        },
      ];
    }
    if (tab.value === "yearly") {
      return [
        {
          title: "Books",
          value: "books",
        },
      ];
    }
    return [
      {
        title: "Pages",
        value: "pages",
      },
      {
        title: "Minutes",
        value: "minutes",
      },
    ];
  }

  const goalTabs = getGoalTabs();
  const [selectedTab, setSelectedTab] = useState(goalTabs[0]);

  useEffect(() => {
    setSelectedTab(goalTabs[0]);
  }, [tab]);

  return (
    <>
      <Button
        style={{ marginTop: 30 }}
        onPress={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <Text style={{ color: "white" }}>Edit goals</Text>
      </Button>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        // onRequestClose={() => {
        //   setIsModalVisible(!isModalVisible);
        // }}
      >
        <Pressable
          onPress={() => setIsModalVisible(!isModalVisible)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
            }}
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "80%",
                borderRadius: 10,
                paddingBottom: 20,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#356B75",
                  paddingVertical: 20,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                >
                  Edit your goals
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 10,
                  width: "100%",
                  paddingHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    // justifyContent: "space-between",
                  }}
                >
                  {goalTabs.map((goal) => (
                    <Button
                      key={goal.value}
                      style={{
                        marginTop: 20,
                        backgroundColor:
                          selectedTab.value == goal.value ? "#507C82" : "white",
                      }}
                      onPress={() => setSelectedTab(goal)}
                      // onPress={() => setIsModalVisible(!isModalVisible)}
                    >
                      <Text
                        style={{
                          color:
                            selectedTab.value == goal.value ? "white" : "black",
                        }}
                      >
                        {goal.title}
                      </Text>
                    </Button>
                  ))}
                </View>
                <TextInput
                  textAlign="center"
                  style={{
                    width: "80%",
                    marginTop: 20,
                  }}
                  placeholder={`Number of ${selectedTab.title.toLowerCase()}`}
                />
                <Button
                  style={{
                    backgroundColor: "#507C82",
                    width: "80%",
                    marginTop: 6,
                  }}
                  onPress={() => setIsModalVisible(!isModalVisible)}
                >
                  <Text style={{ color: "white" }}>Save</Text>
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function UpdateGoals({
  tab,
  user,
  goals,
  refresh,
}: {
  tab: (typeof tabs)[0];
  user: User;
  goals: Goal[];
  refresh: () => void;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [progress, setProgress] = useState(0);

  function getGoalTabs() {
    if (tab.value === "daily") {
      return [
        {
          title: "Pages",
          value: "pages",
        },
        {
          title: "Minutes",
          value: "minutes",
        },
      ];
    }
    if (tab.value === "weekly") {
      return [
        {
          title: "Pages",
          value: "pages",
        },
      ];
    }
    if (tab.value === "monthly") {
      return [
        {
          title: "Books",
          value: "books",
        },
      ];
    }
    if (tab.value === "yearly") {
      return [
        {
          title: "Books",
          value: "books",
        },
      ];
    }
    return [
      {
        title: "Pages",
        value: "pages",
      },
      {
        title: "Minutes",
        value: "minutes",
      },
    ];
  }

  const goalTabs = getGoalTabs();
  const [selectedTab, setSelectedTab] = useState(goalTabs[0]);

  useEffect(() => {
    setSelectedTab(goalTabs[0]);
  }, [tab]);

  async function updateGoal(value: number) {
    const goal = goals.find(
      (goal) => goal.type === selectedTab.value && goal.time_type === tab.value,
    );
    if (goal) {
      const { data, error } = await supabase.from("goal_logs").insert({
        goal: goal.id,
        user: user.id,
        type: selectedTab.value,
        unit_amount: value,
      });
      if (error) {
        console.error(error);
      } else {
        refresh();
      }
    }
  }

  return (
    <>
      <Button
        style={{ marginTop: 30 }}
        onPress={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <Text style={{ color: "white" }}>Update progress</Text>
      </Button>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        // onRequestClose={() => {
        //   setIsModalVisible(!isModalVisible);
        // }}
      >
        <Pressable
          onPress={() => setIsModalVisible(!isModalVisible)}
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
            }}
            style={{
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "80%",
                borderRadius: 10,
                paddingBottom: 20,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "#356B75",
                  paddingVertical: 20,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                >
                  Update your goals
                </Text>
              </View>
              <View
                style={{
                  borderRadius: 10,
                  width: "100%",
                  paddingHorizontal: 10,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    // justifyContent: "space-between",
                  }}
                >
                  {goalTabs.map((goal) => (
                    <Button
                      style={{
                        marginTop: 20,
                        backgroundColor:
                          selectedTab.value == goal.value ? "#507C82" : "white",
                      }}
                      onPress={() => setSelectedTab(goal)}
                      // onPress={() => setIsModalVisible(!isModalVisible)}
                    >
                      <Text
                        style={{
                          color:
                            selectedTab.value == goal.value ? "white" : "black",
                        }}
                      >
                        {goal.title}
                      </Text>
                    </Button>
                  ))}
                </View>
                <TextInput
                  textAlign="center"
                  style={{
                    width: "80%",
                    marginTop: 20,
                  }}
                  keyboardType="numeric"
                  onChangeText={(text) => setProgress(parseInt(text))}
                  placeholder={`Number of ${selectedTab.title.toLowerCase()}`}
                />
                <Button
                  style={{
                    backgroundColor: "#507C82",
                    width: "80%",
                    marginTop: 6,
                  }}
                  onPress={() => {
                    updateGoal(progress);
                    setIsModalVisible(!isModalVisible);
                  }}
                >
                  <Text style={{ color: "white" }}>Save</Text>
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const StreakChallenge = ({
  days,
  week,
  markers,
}: {
  days: number;
  week: number;
  markers: { day: string }[];
}) => {
  // Adjust this function according to how you calculate the position of the markers
  const calculateLeftPosition = (day: string) => {
    // Example calculation, you will need to adjust this logic
    const dayOffset = new Date(day).getDay() - 1;
    return `${dayOffset * 14}%`; // Assuming 14% per day in a week for simplicity
  };

  return (
    <View style={styles.streakContainer}>
      <Text style={styles.title}>Streak Challenge</Text>
      <Text style={styles.days}>{days} days</Text>
      <Text style={styles.week}>Week {week}</Text>
      <View style={styles.card}>
        <View style={styles.timeline} />
        {markers.map((marker, index) => (
          <View
            key={index}
            style={[styles.marker, { left: calculateLeftPosition(marker.day) }]}
          >
            <Text style={styles.markerText}>{marker.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 100,
    backgroundColor: "#507C82",
  },
  points: {
    textAlign: "center",
    color: "#507C82",
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBarContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: -40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#5A6978",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5A6978",
    borderRadius: 10,
  },
  streakContainer: {
    padding: 20,
    alignItems: "center",
    // backgroundColor: "red",
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  days: {
    fontSize: 24,
    fontWeight: "bold",
  },
  week: {
    fontSize: 16,
  },
  card: {
    width: "100%",
    height: 100,
    backgroundColor: "#f3eac2",
    borderRadius: 10,
    marginTop: 10,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  timeline: {
    height: 2,
    backgroundColor: "black",
    width: "100%",
    position: "absolute",
    top: "50%",
  },
  marker: {
    position: "absolute",
    top: "30%",
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "black",
    borderWidth: 2,
  },
  markerText: {
    fontSize: 12,
  },
});

export default GoalTrackerScreen;
