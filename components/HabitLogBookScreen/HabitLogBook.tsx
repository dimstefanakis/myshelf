import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "@/utils/supabase";
import { AntDesign, MaterialIcons, Entypo } from "@expo/vector-icons";
import { View, TextInput, Text } from "../Themed";
import useUser from "@/hooks/useUser";
import {
  startOfWeek,
  add,
  parseISO,
  differenceInCalendarWeeks,
} from "date-fns";
import { fromZonedTime, toZonedTime, format } from "date-fns-tz";
import { Database } from "@/types_db";
import { getLocales, getCalendars } from "expo-localization";

interface Habit {
  weekOffset: number;
  id: string;
  name: string;
  created_at: string;
  color_code?: string;
}

interface HabitWithDate extends Habit {
  dayString: string;
}

type HabitColor = Database["public"]["Tables"]["habit_colors"]["Row"];

// const timeZone = "Asia/Seoul";
const { timeZone } = getCalendars()[0];

const HabitLogBookComponent: React.FC = () => {
  const navigation = useNavigation();
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [maxWeekOffset, setMaxWeekOffset] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitColors, setHabitColors] = useState<HabitColor[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");
  const [addHabitModalVisible, setAddHabitModalVisible] =
    useState<boolean>(false);
  const [colorPickerModalVisible, setColorPickerModalVisible] =
    useState<boolean>(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [editHabitModalVisible, setEditHabitModalVisible] =
    useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editedHabitName, setEditedHabitName] = useState<string>("");
  const { user } = useUser();
  const getWeeksSinceCreation = (
    userCreatedAt: string,
    habitCreatedAt: string,
  ): number => {
    const start = new Date(userCreatedAt);
    const end = new Date(habitCreatedAt);
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerWeek);
  };
  useEffect(() => {
    if (user) {
      getCreationDate();
      fetchHabits();
    }
  }, [user, weekOffset, userCreatedAt]);

  const getCreationDate = async () => {
    let { data, error } = await supabase
      .from("users")
      .select("created_at")
      .eq("id", user?.id || "")
      .single();

    if (error) {
      console.error("Error fetching creation date:", error);
      return;
    }

    if (data && data.created_at) {
      setUserCreatedAt(data.created_at);
      const now = toZonedTime(new Date(), timeZone);
      // const createdAt = parseISO(data.created_at);
      const createdAt = fromZonedTime(parseISO(data.created_at), timeZone);
      const weekStartsOn = 1;

      const maxWeekOffset = differenceInCalendarWeeks(
        startOfWeek(now, { weekStartsOn }),
        startOfWeek(createdAt, { weekStartsOn }),
        { weekStartsOn },
      );
      setMaxWeekOffset(maxWeekOffset);
    }
  };

  const getWeekStartFromDate = (dateString: string) => {
    // const date = parseISO(dateString);
    const date = fromZonedTime(parseISO(dateString), timeZone);
    return startOfWeek(date, { weekStartsOn: 1 });
  };

  const calculateWeekOffset = (createdDate: string, currentDate: Date) => {
    const normalizedCreationDate = startOfWeek(parseISO(createdDate), {
      weekStartsOn: 1,
    });
    const normalizedCurrentDate = startOfWeek(currentDate, { weekStartsOn: 1 });

    // Calculate the difference in calendar weeks
    const offset = differenceInCalendarWeeks(
      normalizedCurrentDate,
      normalizedCreationDate,
      { weekStartsOn: 1 },
    );

    return offset;
  };
  useEffect(() => {
    if (userCreatedAt) {
      // const today = new Date();
      const today = toZonedTime(new Date(), timeZone);
      // FIX: tz here
      const offset = calculateWeekOffset(userCreatedAt, today);
      setWeekOffset(offset);
      setMaxWeekOffset(offset);
    }
  }, [userCreatedAt]);
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setAddHabitModalVisible(true);
            setNewHabit("");
          }}
        >
          <Entypo name="plus" size={24} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  const fetchHabits = async () => {
    if (!userCreatedAt) return;
    const userWeekStart = getWeekStartFromDate(userCreatedAt);
    const weekStart = add(userWeekStart, { weeks: weekOffset });
    const weekStartString = format(weekStart, "yyyy-MM-dd");
    const weekEndString = format(
      add(weekStart, { weeks: 1, days: 0 }),
      "yyyy-MM-dd",
    );
    let { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("*, habit_colors(*)")
      .order("created_at");

    let { data: colorsData, error: colorsError } = await supabase
      .from("habit_colors")
      .select("*");

    setHabitColors(colorsData || []);

    let { data: habitLogsData, error: habitLogsError } = await supabase
      .from("habit_logs")
      .select("*, habit_color(*, habit(*))")
      .gte("created_at", weekStartString)
      .lte("created_at", weekEndString);

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      return;
    }
    const combinedHabits = habitsData?.map((habit) => {
      const colorEntry = colorsData?.find((color) => color.habit === habit.id);
      return {
        ...habit,
        logs:
          habitLogsData?.filter(
            (log) => log.habit_color.habit.id === habit.id,
          ) || [],
        color_code: colorEntry ? colorEntry.color_code : "#808080", // Default gray color
        weekOffset: getWeeksSinceCreation(userCreatedAt, habit.created_at),
      };
    });

    setHabits(combinedHabits);
    // console.log("Fetched Habits:", combinedHabits);
  };

  const addHabit = async () => {
    if (newHabit.trim().length === 0) {
      alert("Please enter a habit name");
      return;
    }
    if (habits.length >= 5) {
      alert("You can only have a maximum of 5 habits.");
      return;
    }
    let { data: insertedHabit, error: insertError } = await supabase
      .from("habits")
      .insert([
        {
          name: newHabit,
          user: user?.id,
        },
      ])
      .select("*")
      .single();

    const defaultColors = ["#FD3232", "#FDBD5B", "#44BD00"];

    for (const color of defaultColors) {
      await supabase.from("habit_colors").insert([
        {
          habit: insertedHabit?.id,
          color_code: color,
        },
      ]);
    }
    setAddHabitModalVisible(false);

    if (insertError) console.error("Error adding habit:", insertError);
    fetchHabits();
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setEditedHabitName(habit.name);
    setEditHabitModalVisible(true);
  };

  const updateHabit = async () => {
    if (!editingHabit || !editedHabitName) return;

    let { error } = await supabase
      .from("habits")
      .update({ name: editedHabitName })
      .eq("id", editingHabit.id);

    if (error) console.error("Error updating habit:", error);
    else {
      setEditHabitModalVisible(false);
      fetchHabits();
    }
  };

  const openColorPicker = (habit: Habit, dayDate: Date) => {
    setSelectedDay(dayDate);
    setSelectedHabit(habit);
    setColorPickerModalVisible(true);
  };

  const renderDayColumn = (dayDate: Date, habits: Habit[], index: number) => {
    const dayString = format(dayDate, "yyyy-MM-dd");
    // const dayHabits = habits.filter(
    //   (habit) => format(parseISO(habit.created_at), "yyyy-MM-dd") === dayString,
    // );

    return (
      <View key={dayString} style={styles.dayColumn}>
        <Text style={styles.dayHeader}>{format(dayDate, "EEE, d MMM")}</Text>
        {habits.map((habit) => {
          const color =
            habit.logs.find(
              (log) => format(log.created_at, "yyyy-MM-dd") === dayString,
            )?.habit_color.color_code || "#808080";
          return (
            <View key={habit.id} style={styles.habitContainer}>
              <View style={styles.habitRow}>
                <TouchableOpacity onPress={() => openEditModal(habit)}>
                  <Text style={styles.habitName}>{`${habit.name}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.habitIndicator, { backgroundColor: color }]}
                  onPress={() => openColorPicker(habit, dayDate)}
                ></TouchableOpacity>
              </View>
            </View>
          );
        })}
        {/* <TouchableOpacity
          onPress={() => {
            setAddHabitModalVisible(true);
            setNewHabit("");
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add +</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  const goToPreviousWeek = () => {
    setWeekOffset((prevWeekOffset) => {
      const previousWeekOffset = Math.max(0, prevWeekOffset - 1);
      return previousWeekOffset;
    });
  };
  const closeModal = () => {
    setColorPickerModalVisible(false);
  };
  const goToNextWeek = () => {
    setWeekOffset((prevWeekOffset) => {
      const nextWeekOffset = Math.min(prevWeekOffset + 1, maxWeekOffset);
      return nextWeekOffset;
    });
  };

  const updateHabitColor = async (
    habitId: string | null,
    colorCode: string,
  ) => {
    if (!habitId) {
      setColorPickerModalVisible(false);
      return;
    }
    let updateSuccessful = false;
    const { data, error: fetchError } = await supabase
      .from("habit_colors")
      .select("id")
      .eq("habit", habitId)
      .eq("color_code", colorCode)
      .single();

    // make it so selectedDay is on 6pm
    const timeDay = new Date(selectedDay);
    timeDay.setHours(12);
    timeDay.setMinutes(0);
    timeDay.setSeconds(0);

    const { data: insertHabitLog, error: insertError } = await supabase
      .from("habit_logs")
      .insert([
        {
          habit_color: data?.id,
          created_at: toZonedTime(timeDay, timeZone),
        },
      ]);
    updateSuccessful = !insertError;

    setColorPickerModalVisible(false);
    if (updateSuccessful) {
      // setHabits((currentHabits) =>
      //   currentHabits.map((habit) =>
      //     habit.id === habitId ? { ...habit, color_code: colorCode } : habit,
      //   ),
      // );
      fetchHabits();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekNavigator}>
        <View style={styles.weekBox}>
          <TouchableOpacity
            onPress={goToPreviousWeek}
            disabled={weekOffset === 0}
          >
            <MaterialIcons name="navigate-before" size={24} color="#4C7288" />
          </TouchableOpacity>
          <Text style={styles.weekText}>Week {weekOffset + 1}</Text>

          <TouchableOpacity
            onPress={goToNextWeek}
            disabled={weekOffset >= maxWeekOffset}
          >
            <MaterialIcons name="navigate-next" size={24} color="#4C7288" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <AntDesign name="questioncircleo" size={20} color="#4C7288" />
        </TouchableOpacity>
        <Modal
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setModalVisible(!modalVisible)}
          >
            <View
              style={[
                styles.centeredView,
                { backgroundColor: "rgba(0, 0, 0, 0.5)" },
              ]}
            >
              <View style={styles.modalView}>
                {/* <AntDesign
                  name="closecircleo"
                  size={24}
                  color="black"
                  style={{ textAlign: "right" }}
                  onPress={() => setModalVisible(!modalVisible)}
                /> */}

                <Text style={styles.modalText}>Colour Guide</Text>
                <View style={styles.colorGuide}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: "#FB3231" },
                    ]}
                  />
                  <View>
                    <Text style={styles.colorDescription}>
                      No I didn't read
                    </Text>
                    <Text style={styles.colorDescription}>Bad stress </Text>
                    <Text style={styles.colorDescription}>
                      Many distractions
                    </Text>
                  </View>
                </View>
                <View style={styles.colorGuide}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: "#FFC82C" },
                    ]}
                  />
                  <View>
                    <Text style={styles.colorDescription}>Medium reading</Text>
                    <Text style={styles.colorDescription}>Medium stress</Text>
                    <Text style={styles.colorDescription}>
                      Medium distractions
                    </Text>
                  </View>
                </View>
                <View style={styles.colorGuide}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: "#41BF00" },
                    ]}
                  />
                  <View>
                    <Text style={styles.colorDescription}>Yes I read</Text>
                    <Text style={styles.colorDescription}>No stress</Text>
                    <Text style={styles.colorDescription}>No distractions</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <Modal
        visible={addHabitModalVisible}
        onRequestClose={() => setAddHabitModalVisible(false)}
      >
        <View style={styles.updateHabitNameContainer}>
          <View style={styles.textInputCenterView}>
            <TextInput
              placeholder="Habit name"
              value={newHabit}
              onChangeText={setNewHabit}
              style={{
                height: 40,
                // borderColor: "gray",
                width: "100%",
                textAlign: "center",
                borderWidth: 1,
                marginBottom: 20,
              }}
            />
            <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setAddHabitModalVisible(false);
                  setNewHabit("");
                }}
              >
                <Text style={{ color: "black", textAlign: "center" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addHabit} style={styles.submitButton}>
                <Text style={{ color: "white", textAlign: "center" }}>
                  Submit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView style={styles.scrollViewStyle}>
        <View style={styles.weekContent}>
          {Array.from({ length: 7 }).map((_, index) => {
            if (!userCreatedAt) {
              return null;
            }
            const userWeekStart = getWeekStartFromDate(userCreatedAt);
            const weekStart = add(userWeekStart, { weeks: weekOffset });
            const dayDate = add(weekStart, { days: index });
            return renderDayColumn(dayDate, habits, index);
          })}
        </View>
      </ScrollView>
      <Modal transparent={true} visible={colorPickerModalVisible}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.centeredView}>
            <View style={styles.colorPickerModalView}>
              {selectedHabit?.habit_colors.map((habitColor) => (
                <TouchableOpacity
                  key={habitColor.id}
                  style={[
                    styles.colorPickerOption,
                    { backgroundColor: habitColor.color_code || "white" },
                  ]}
                  onPress={() =>
                    updateHabitColor(selectedHabit?.id, habitColor.color_code)
                  }
                />
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={editHabitModalVisible}
        onRequestClose={() => setEditHabitModalVisible(false)}
      >
        <View style={styles.updateHabitNameContainer}>
          <View style={styles.textInputCenterView}>
            <TextInput
              placeholder="Edit Habit"
              value={editedHabitName}
              onChangeText={setEditedHabitName}
              style={{
                height: 40,
                // borderColor: "gray",
                width: "100%",
                textAlign: "center",
                borderWidth: 1,
                marginBottom: 20,
                borderRadius: 6,
              }}
            />
            <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
              <TouchableOpacity
                onPress={() => setEditHabitModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={{ color: "black", textAlign: "center" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={updateHabit}
                style={styles.submitButton}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    // backgroundColor: "white",
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  updateHabitNameContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textInputCenterView: {
    width: "100%",
    maxWidth: 200,
    alignItems: "center",
  },
  scrollViewStyle: {
    width: "100%",
  },
  weekContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 10,
  },
  modalView: {
    margin: 20,
    // backgroundColor: "white",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 40,
  },
  colorGuide: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  colorDescription: {
    fontSize: 16,
    textAlign: "left",
  },
  buttonClose: {
    borderRadius: 20,
    elevation: 2,
  },
  modalText: {
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
    // color: "#B1B7C0",
  },

  colorPickerModalView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  colorPickerOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
  },

  habitRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    width: "100%",
  },

  weekNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    width: "100%",
  },
  weekBox: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    width: 100,
    gap: 85,
  },
  weekText: {
    fontSize: 18,
    color: "#4C7288",
  },
  dayHeader: {
    fontSize: 17,
    fontWeight: "500",
    color: "#48535F",
    marginBottom: 16,
    textAlign: "center",
  },
  dayColumn: {
    width: "48%",
    // backgroundColor: "white",
    borderRadius: 10,
    padding: 17,
    marginBottom: 6,
  },
  habitContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  habitName: {
    fontSize: 16,
    color: "#727A84",
    fontWeight: "normal",
  },
  habitIndicator: {
    width: 18,
    height: 18,
    borderRadius: 12,
    marginLeft: "auto",
  },
  addButton: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 18,
    color: "#C2C8CE",
  },
  addButtonText: {
    fontSize: 14,
    color: "#B1B7C0",
  },
  submitButton: {
    backgroundColor: "black",
    padding: 10,
    borderRadius: 6,
    width: "45%",
  },
  cancelButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 6,
    width: "45%",
  },
});

export default HabitLogBookComponent;
