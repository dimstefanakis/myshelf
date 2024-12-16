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
import { useRouter } from "expo-router";
import PagerView from "react-native-pager-view";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import ArcSlider from "@/components/ArcSlider";
import { View, TextInput, ScrollView } from "@/components/Themed";
import useUser, { User } from "@/hooks/useUser";
import type { Database } from "@/types_db";
import { supabase } from "@/utils/supabase";
import { FontAwesome } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { SafeAreaView } from "react-native";
import { getLocales, getCalendars } from "expo-localization";
import { useGoalTrackerStore } from '@/store/goalTrackerStore';
import { XStack, YStack, Button, Text } from "tamagui";
import { ChevronLeft, Bell, Pencil } from '@tamagui/lucide-icons';

type Goal = Database["public"]["Tables"]["goals"]["Row"];
type Log = Database["public"]["Tables"]["goal_logs"]["Row"] & {
  goal: Goal;
};
type GoalLog = {
  // goal: Goal;
  time_type: string;
  logs: Log[];
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
  const router = useRouter();
  const navigation = useNavigation<NavigationProp<any>>();
  const { user, getUser } = useUser();
  const { timeZone } = getCalendars()[0];
  const [loadingReminderUpdate, setLoadingReminderUpdate] = useState(false);
  // const [date, setDate] = useState(new Date(1598051730000));
  const dateTimeString = `${formatReminderTime(user?.profile?.reminder_time ?? "")}`;
  const dateObj = new Date(dateTimeString);
  dateObj.toLocaleString("en-US", { timeZone: timeZone || '' });
  const [date, setDate] = useState(dateObj);
  const [show, setShow] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>(
    [],
  );
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const {
    goals,
    goalLogs,
    loading,
    loadingLogs,
    currentIndex,
    selectedTab,
    setCurrentIndex,
    setSelectedTab,
    fetchGoals,
    getGoalProgress,
    listenToLogUpdates,
    listenToGoalUpdates
  } = useGoalTrackerStore();

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

  useEffect(() => {
    if (user?.id) {
      fetchGoals(user.id);
      getGoalProgress(user.id, timeZone ?? undefined);
      listenToLogUpdates(user.id);
      listenToGoalUpdates(user.id);
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

  function getGoalProgressValue(goal: Goal) {
    let progress = 0;
    if (goal.type != "days") {
      const timelogs = goalLogs.find((log) => {
        return log.time_type == goal.time_type;
      });
      if (timelogs) {
        const logs = timelogs.logs.filter((log) => {
          if (goal.time_type == "daily") {
            return (
              log.type === goal.type &&
              log?.goal?.time_type === "daily"
            );
          } else if (goal.time_type == "weekly") {
            return (
              log.type === goal.type &&
              (log?.goal?.time_type === "weekly" ||
                log?.goal?.time_type === "daily")
            );
          } else if (goal.time_type == "monthly") {
            return (
              log.type === goal.type &&
              (log?.goal?.time_type === "monthly" ||
                log?.goal?.time_type === "weekly" ||
                log?.goal?.time_type === "daily")
            );
          } else {
            return log.type === goal.type;
          }
        });
        progress = logs.reduce(
          (acc, log) => acc + (log.unit_amount ?? 0),
          0
        );
      }
    } else {
      const logs = goalLogs.find((log) => {
        return log.time_type == "all";
      });
      if (logs) {
        progress = logs.week_count || 0;
      }
    }
    return progress;
  }

  const activeGoals = goals.filter((goal) => goal.time_type == 'daily');
  const passiveGoals = goals.filter((goal) => goal.time_type != 'daily');

  return (goals.length == 0 || goalLogs.length == 0) &&
    (loadingLogs || loading) ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator />
    </View>
  ) : (
    <ScrollView style={styles.container}>
      <XStack>
        <Button
          borderRadius={100}
          w={50}
          h={50}
          chromeless
          icon={<ChevronLeft size={24} color="$gray10" />}
          onPress={() => router.back()}
        >
        </Button>
        <XStack flex={1}></XStack>
        <Button
          borderRadius={100}
          w={50}
          h={50}
          chromeless
          icon={<Bell size={24} color="$gray10" />}
          onPress={() => {
            registerForPushNotificationsAsync();
          }}
        >
        </Button>
      </XStack>

      <Text fontSize="$6" fontWeight="bold" marginTop="$4" marginLeft="$4">My Reading Goals</Text>
      <StreakChallenge />
      <YStack marginTop="$4" paddingHorizontal="$4">
        <Text fontSize="$5" fontWeight="bold">Active goals</Text>
        {activeGoals.map((goal) => {
          const progress = getGoalProgressValue(goal);

          return (
            <XStack key={goal.id} style={styles.goalCard} onPress={() => {
              router.push(`/updateGoal/${goal.id}`)
            }}>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>
                  {goal.type} read {goal.time_type}
                </Text>
                <Text style={styles.goalProgress}>
                  {progress || 0}/{goal.unit_amount}
                </Text>
              </View>
              <XStack space="$2" alignItems="center" backgroundColor="#E8E0D9">
                <View style={styles.progressCircle}>
                  <ArcSlider
                    size={80}
                    min={0}
                    max={goal.unit_amount || 1}
                    strokeWidth={10}
                    startAngle={0}
                    endAngle={360}
                    value={progress || 0}
                    disabled
                  />
                </View>
              </XStack>
            </XStack>
          );
        })}
      </YStack>

      <YStack marginTop="$4" paddingHorizontal="$4">
        <Text fontSize="$5" fontWeight="bold">Passive goals</Text>
        {passiveGoals.map((goal) => {
          const progress = getGoalProgressValue(goal);

          return (
            <XStack 
              key={goal.id} 
              style={styles.goalCard}
              pressStyle={{ opacity: 0.7 }}
              onPress={() => {
                router.push(`/editGoal?id=${goal.id}`);
              }}
            >
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>
                  {goal.type} read {goal.time_type}
                </Text>
                <Text style={styles.goalProgress}>
                  {progress || 0}/{goal.unit_amount}
                </Text>
              </View>
              <View style={styles.progressCircle}>
                <ArcSlider
                  size={80}
                  min={0}
                  max={goal.unit_amount || 1}
                  strokeWidth={10}
                  startAngle={0}
                  endAngle={360}
                  value={progress || 0}
                  disabled
                />
              </View>
            </XStack>
          );
        })}
      </YStack>
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
                        user?.profile?.reminder_time || "00:00",
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
  const { user } = useUser();
  const [weeklyProgress, setWeeklyProgress] = useState(Array(7).fill(false));
  const currentDay = new Date().getDay(); // Get current day of week (0-6)

  async function fetchStreakFromDatabase() {
    const { data: goalLogs } = await supabase
      .from("goal_logs")
      .select("created_at")
      .order("created_at", { ascending: false });

    let streak = 0;
    let prevDate;

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

  async function fetchWeeklyProgress() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

    const { data: weekLogs } = await supabase
      .from("goal_logs")
      .select("created_at")
      .gte('created_at', startOfWeek.toISOString())
      .lte('created_at', today.toISOString());

    const progress = Array(7).fill(false);

    weekLogs?.forEach(log => {
      const logDate = new Date(log.created_at);
      const dayOfWeek = logDate.getDay();
      progress[dayOfWeek] = true;
    });

    setWeeklyProgress(progress);
  }

  function isConsecutive(prevDate: any, currentDate: any) {
    const prev = new Date(prevDate);
    const current = new Date(currentDate);
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.abs((current.getTime() - prev.getTime()) / oneDay) === 1;
  }

  useEffect(() => {
    fetchStreakFromDatabase();
    fetchWeeklyProgress();
  }, [user]);

  return (
    <YStack
      backgroundColor="#E8E0D9"
      padding="$4"
      marginHorizontal="$4"
      borderRadius={12}
      marginTop="$4"
      space="$4"
    >
      <XStack alignItems="center" space="$4">
        <View style={styles.fireIconContainer}>
          <FontAwesome name="fire" size={24} color="#FF7A00" />
        </View>
        <YStack>
          <Text color="#333" fontSize={16}>Current Streak</Text>
          <Text color="#333" fontSize={24} fontWeight="bold">{streak} days</Text>
        </YStack>
      </XStack>

      <XStack justifyContent="space-between" paddingHorizontal="$2">
        {weeklyProgress.map((completed, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              completed ? styles.dotCompleted : styles.dotIncomplete,
              index === currentDay && styles.dotCurrent
            ]}
          />
        ))}
      </XStack>
    </YStack>
  );
};

const styles = StyleSheet.create({
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
    width: 25,
    height: 25,
    borderRadius: 20,
  },
  dotCompleted: {
    backgroundColor: '#FF7A00',
  },
  dotIncomplete: {
    backgroundColor: '#FFE8D7',
  },
  dotCurrent: {
    borderWidth: 2,
    borderColor: '#FF7A00',
    width: 25,
    height: 25,
    borderRadius: 20,
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
  goalCard: {
    flexDirection: 'row',
    backgroundColor: '#E8E0D9',
    borderLeftWidth: 4,
    borderLeftColor: '#9AB7B3',
    padding: 20,
    // marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 5,
  },
  goalInfo: {
    flex: 1,
    backgroundColor: '#E8E0D9',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  goalProgress: {
    fontSize: 16,
    color: '#666',
  },
  progressCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#E8E0D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  fireIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#FFE8D7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoalTrackerScreen;
