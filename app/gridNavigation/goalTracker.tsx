import React, { useEffect, useState } from "react";
import { Modal, Pressable, Dimensions, StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import PagerView from "react-native-pager-view";
import { View, Text, Button, TextInput } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import type { Database } from "@/types_db";
import { supabase } from "@/utils/supabase";

type Goal = Database["public"]["Tables"]["goals"]["Row"] & {
  goal_logs: Database["public"]["Tables"]["goal_logs"]["Row"][];
  progress: {
    sum: number;
  }[];
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const completed = 50;
  const total = 100;

  const markers = [
    { day: "6", completed: true },
    { day: "7", completed: false },
    { day: "8", completed: true },
    { day: "9", completed: true },
    { day: "10", completed: false },
  ];

  function getPercentage() {
    const unitAmount =
      goals.find((goal) => goal.time_type === selectedTab.value)?.unit_amount ||
      0;

    console.log("unitAmount", unitAmount);
  }

  async function getGoals() {
    const { data, error } = await supabase
      .from("goals")
      .select("*, progress:goal_logs(unit_amount.sum())")
      .order("created_at", { ascending: true })
      .eq("user", user?.id || "");
    if (error) {
      console.error("Error fetching goals", error);
      return;
    }
    // @ts-ignore
    setGoals(data);
  }

  useEffect(() => {
    if (user?.id) {
      getGoals();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginBottom: 30,
          width: "100%",
        }}
      >
        {tabs.map((tab) => (
          <Button
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
      {goals.length > 0 && (
        <PagerView
          key={selectedTab.value}
          initialPage={0}
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
              const percentage =
                ((goal.progress[0].sum ?? 0) / (goal.unit_amount ?? 1)) * 100;
              console.log("Goal", goal, goal.goal_logs);
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
                          {goal.progress[0].sum || 0}/{goal.unit_amount}
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

      {/* <View
          key="2"
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
                  {completed}/{total}
                </Text>
                <Text>pages</Text>
              </View>
            )}
          </AnimatedCircularProgress>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
          </View>
        </View> */}

      <Button style={{ marginTop: 30 }}>
        <Text style={{ color: "white" }}>Update progress</Text>
      </Button>
      <View style={{ flexDirection: "row" }}>
        <Button style={{ marginTop: 30, marginRight: 10 }}>
          <Text style={{ color: "white" }}>View history</Text>
        </Button>
        <EditGoals tab={selectedTab} />
      </View>
      <StreakChallenge week={2} days={7} markers={markers} />
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
