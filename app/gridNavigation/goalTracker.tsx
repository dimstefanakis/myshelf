import React, { useEffect, useState, useRef } from "react";
import {
  Modal,
  Pressable,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import PagerView from "react-native-pager-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { View, Text, Button, TextInput, ScrollView } from "@/components/Themed";
import useUser, { User } from "@/hooks/useUser";
import type { Database } from "@/types_db";
import { supabase } from "@/utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native";
import { getLocales, getCalendars } from "expo-localization";

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

function convertTimeToHHMM(timeStr: string) {
  // Split the time string to get hours, minutes, and seconds
  const [hours, minutes] = timeStr.split(":");

  // Return the formatted string in "HH:MM" format
  return `${hours}:${minutes}`;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function formatReminderTime(reminderTime: string) {
  // Extract the time and timezone parts
  const timePart = reminderTime.slice(0, 8); // '08:30:00'
  const timezonePart = reminderTime.slice(8); // '+02' or '-02'

  // Format the timezone part to '+02:00' or '-02:00'
  const formattedTimezone =
    timezonePart.length === 3 ? `${timezonePart}:00` : timezonePart;

  // Construct the ISO 8601 datetime string
  return `1970-01-01T${timePart}${formattedTimezone}`;
}

function GoalTrackerScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user, getUser } = useUser();
  const { timeZone } = getCalendars()[0];
  const [loadingReminderUpdate, setLoadingReminderUpdate] = useState(false);
  // const [date, setDate] = useState(new Date(1598051730000));
  const dateTimeString = `${formatReminderTime(user?.profile?.reminder_time ?? "")}`;
  const dateObj = new Date(dateTimeString);
  dateObj.toLocaleString("en-US", { timeZone: timeZone ?? undefined });
  const [date, setDate] = useState(dateObj);
  const [show, setShow] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalLogs, setGoalLogs] = useState<GoalLog[]>([]);
  const [selectedTab, setSelectedTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  async function registerForPushNotificationsAsync() {
    // registerForPushNotificationsAsync()
    //   .then((token) => setExpoPushToken(token ?? ""))
    //   .catch((error: any) => setExpoPushToken(`${error}`));

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    if (finalStatus === "granted") {
      setIsModalVisible(true);
    }
  }
  async function scheduleDailyNotification(time: Date) {
    // Ensure the time is a Date object
    const now = new Date();
    const notificationTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      time.getHours(),
      time.getMinutes(),
    );

    // If the chosen time has already passed today, schedule for tomorrow
    if (notificationTime < now) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Reminder",
        body: "Don't forget to log your goals for today!",
      },
      trigger: {
        hour: notificationTime.getHours(),
        minute: notificationTime.getMinutes(),
        repeats: true,
      },
    });
  }

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            // navigateToJournalEntry();
            registerForPushNotificationsAsync();
          }}
        >
          <FontAwesome name="bell-o" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  async function fetchGoals() {
    setLoading(true);
    const { data: goals, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user", user?.id || "")
      .order("created_at", { ascending: false });

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
  async function listenToGoalUpdates() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
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
      listenToGoalUpdates();
    }
  }, [user]);

  const onChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const currentDate = selectedDate;
      // setShow(false);
      setDate(currentDate);
    }
  };

  async function handleUpdateReminder() {
    setLoadingReminderUpdate(true);

    const timezoneOffset = date.getTimezoneOffset();
    const offsetHours = String(
      Math.abs(Math.floor(timezoneOffset / 60)),
    ).padStart(2, "0");
    const offsetMinutes = String(Math.abs(timezoneOffset % 60)).padStart(
      2,
      "0",
    );
    const offsetSign = timezoneOffset <= 0 ? "+" : "-";
    const formattedOffset = `${offsetSign}${offsetHours}:${offsetMinutes}`;
    const formattedTime =
      date.toLocaleTimeString("en-US", {
        hour12: false,
        timeZone: timeZone ?? undefined,
      }) + ` ${formattedOffset}`;

    const { data, error } = await supabase
      .from("users")
      .update({
        reminder_time: formattedTime,
      })
      .eq("id", user?.id || "");
    if (error) {
      console.error("Error updating reminder time", error);
    }
    await getUser();
    setLoadingReminderUpdate(false);
    setShow(false);
  }

  const showMode = () => {
    if (Platform.OS === "ios") {
      setShow(true);
    } else {
      DateTimePickerAndroid.open({
        value: date,
        onChange,
        mode: "time",
        is24Hour: true,
      });
    }
  };

  useEffect(() => {
    if (user?.profile?.reminder_time) {
      const formattedDate = formatReminderTime(user?.profile?.reminder_time);
      scheduleDailyNotification(new Date(formattedDate));
    }
  }, [user?.profile?.reminder_time]);

  return (goals.length == 0 || goalLogs.length == 0) &&
    (loadingLogs || loading) ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  ) : (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
      }}
    >
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
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            height: "30%",
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
                  key={goal.id}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                    height: "100%",
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
        <View style={{ flexDirection: "row" }}>
          <UpdateGoals
            tab={selectedTab}
            user={user}
            goals={goals}
            refresh={() => {
              fetchGoals();
              getGoalProgress();
            }}
          />
          <EditGoals tab={selectedTab} />
        </View>
      )}
      <View style={{ flexDirection: "row" }}>
        {/* <Button style={{ marginTop: 30, marginRight: 10 }}>
          <Text style={{ color: "white" }}>View history</Text>
        </Button> */}
      </View>
      <StreakChallenge />
      <View style={{ flex: 1 }}></View>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        {show && (
          <View
            style={{
              flex: 1,
              position: "absolute",
              zIndex: 10,
              left: 0,
              right: 0,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="time"
              is24Hour={true}
              onChange={onChange}
            />
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "80%",
                marginTop: 20,
              }}
            >
              <Button
                onPress={() => {
                  handleUpdateReminder();
                }}
                style={styles.doneButton}
              >
                {loadingReminderUpdate ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white" }}>Update Reminder</Text>
                )}
              </Button>
              <Button
                onPress={() => {
                  setShow(false);
                  setIsModalVisible(false);
                }}
                style={styles.deleteButton}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </Button>
            </View>
          </View>
        )}
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
                  Set goal notification
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
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ marginTop: 10 }}>Reminder every day at</Text>
                    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                      {convertTimeToHHMM(
                        user?.profile.reminder_time || "00:00",
                      )}
                    </Text>
                    <Button
                      style={{
                        backgroundColor: "#507C82",
                        width: "80%",
                        marginTop: 6,
                      }}
                      onPress={() => {
                        showMode();
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                        }}
                      >
                        Change time
                      </Text>
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

function EditGoals({ tab }: { tab: (typeof tabs)[0] }) {
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

  const { user } = useUser();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const goalTabs = getGoalTabs();
  const [selectedTab, setSelectedTab] = useState(goalTabs[0]);
  const [value, setValue] = useState<null | number>(null);

  useEffect(() => {
    setSelectedTab(goalTabs[0]);
  }, [tab]);

  async function editGoal() {
    const { data, error } = await supabase
      .from("goals")
      .update({
        unit_amount: value,
      })
      .eq("user", user?.id || "")
      .eq("time_type", tab.value)
      .eq("type", selectedTab.value);
    setIsModalVisible(false);
  }

  return (
    <>
      <Button
        style={{ marginTop: 30, backgroundColor: "white" }}
        onPress={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <Text style={{ color: "black" }}>Edit goals</Text>
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
                  keyboardType="numeric"
                  onChangeText={(text) => setValue(parseInt(text))}
                  placeholder={`Number of ${selectedTab.title.toLowerCase()}`}
                />
                <Button
                  style={{
                    backgroundColor: "#507C82",
                    width: "80%",
                    marginTop: 6,
                  }}
                  onPress={() => {
                    editGoal();
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
        style={{ marginTop: 30, marginRight: 5 }}
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
const StreakChallenge = () => {
  const [streak, setStreak] = useState(0);
  const [checkmarks, setCheckmarks] = useState([
    { day: "Su", hasGoal: false },
    { day: "Mo", hasGoal: false },
    { day: "Tu", hasGoal: false },
    { day: "We", hasGoal: false },
    { day: "Th", hasGoal: false },
    { day: "Fr", hasGoal: false },
    { day: "Sa", hasGoal: false },
  ]);
  const { user, getUser } = useUser();

  async function fetchStreakFromDatabase() {
    const { data: goalLogs } = await supabase
      .from("goal_logs")
      .select("created_at")
      .order("created_at", { ascending: false });

    let streak = 0;
    let prevDate;

    // check whether there is a log today
    // means no streak
    if (goalLogs && goalLogs.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const lastLog = new Date(goalLogs[0].created_at)
        .toISOString()
        .slice(0, 10);
      if (today != lastLog) {
        return 0;
      }
    }

    for (const log of goalLogs!) {
      const logDate = new Date(log.created_at).toISOString().slice(0, 10);

      if (!prevDate || isConsecutive(prevDate, logDate)) {
        streak++;
        setStreak(streak);
        prevDate = logDate;
      } else {
        break;
      }
    }

    return streak;
  }

  function isConsecutive(prevDate: any, currentDate: any) {
    const prev = new Date(prevDate);
    const current = new Date(currentDate);
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.abs((current.getTime() - prev.getTime()) / oneDay) === 1;
  }

  async function fetchCheckmarks() {
    const today = new Date();
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const checkmarksArray = [];

    for (let i = 0; i < days.length; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + ((i + 1) % 7)); // Offset by 1 to start from Monday
      const dateString = date.toISOString().slice(0, 10);
      const hasGoal = await hasGoalLog(dateString);
      checkmarksArray.push({ day: days[date.getDay()], hasGoal });
    }

    setCheckmarks(checkmarksArray);
  }

  async function hasGoalLog(date: string) {
    const { data } = await supabase
      .from("goal_logs")
      .select("created_at")
      .gte("created_at", `${date}T00:00:00.000Z`)
      .lte("created_at", `${date}T23:59:59.999Z`);

    return data!.length > 0;
  }

  useEffect(() => {
    fetchStreakFromDatabase();
    fetchCheckmarks();
  }, [user]);

  return (
    <View style={{ alignItems: "center", marginTop: 40, width: "100%" }}>
      <View style={styles.streakText}>
        <Text style={{ fontSize: 40, color: "#5A6978", fontWeight: "bold" }}>
          {streak}
        </Text>
        <Text style={{ fontSize: 20 }}>day streak!</Text>
      </View>
      <View
        style={{
          marginTop: 6,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "85%",
            borderWidth: 2,
            borderColor: "#5A6978",
            borderRadius: 6,
          }}
        >
          <View style={styles.daysContainer}>
            {checkmarks.map(({ day, hasGoal }) => {
              return (
                <View key={day} style={styles.dayContainer}>
                  <Text style={styles.day}>{day}</Text>
                  {hasGoal && streak > 0 ? (
                    <FontAwesome name="check-circle" size={24} color="green" />
                  ) : (
                    <FontAwesome name="circle-o" size={24} color="black" />
                  )}
                </View>
              );
            })}
          </View>
          <View style={styles.separator}></View>
          <Text style={{ textAlign: "center", marginVertical: 10 }}>
            A <Text style={styles.green}>streak</Text> is when you complete your
            goal for consecutive days.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    alignItems: "center",
    width: "100%",
    borderColor: "#5A6978",
    borderRadius: 10,
    padding: 10,
  },
  dayContainer: {
    alignItems: "center",
  },
  separator: {
    height: 1,
    width: "100%",
    backgroundColor: "#5A6978",
  },
  day: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#5A6978",
  },
  green: {
    color: "green",
  },
  container: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  loadingContainer: {
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  days: {
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
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
  streakText: {
    alignItems: "center",
    color: "#5A6978",
  },
  doneButton: {
    backgroundColor: "black",
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 10,
    alignItems: "center",
    width: "50%",
    borderRadius: 10,
    marginVertical: 10,
  },
});

export default GoalTrackerScreen;
