import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { View, Text } from "../Themed";
import useUser from "@/hooks/useUser";
import {
  startOfWeek,
  add,
  format,
  parseISO,
  differenceInCalendarWeeks,
} from "date-fns";

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

const HabitLogBookComponent: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [maxWeekOffset, setMaxWeekOffset] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState<string>("");
  const [addHabitModalVisible, setAddHabitModalVisible] =
    useState<boolean>(false);
  const [colorPickerModalVisible, setColorPickerModalVisible] =
    useState<boolean>(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
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
      const now = new Date();
      const createdAt = parseISO(data.created_at);
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
    const date = parseISO(dateString);
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
      const today = new Date();
      const offset = calculateWeekOffset(userCreatedAt, today);
      setWeekOffset(offset);
      setMaxWeekOffset(offset);
    }
  }, [userCreatedAt]);
  const fetchHabits = async () => {
    if (!userCreatedAt) return;
    const userWeekStart = getWeekStartFromDate(userCreatedAt);
    const weekStart = add(userWeekStart, { weeks: weekOffset });
    const weekStartString = format(weekStart, "yyyy-MM-dd");
    const weekEndString = format(
      add(weekStart, { weeks: 1, days: -1 }),
      "yyyy-MM-dd",
    );
    let { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("*")
      .gte("created_at", weekStartString)
      .lte("created_at", weekEndString)
      .order("created_at");

    let { data: colorsData, error: colorsError } = await supabase
      .from("habit_colors")
      .select("*");

    if (habitsError) {
      console.error("Error fetching habits:", habitsError);
      return;
    }
    const combinedHabits = habitsData?.map((habit) => {
      const colorEntry = colorsData?.find((color) => color.habit === habit.id);
      return {
        ...habit,
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
    if (!selectedDay) {
      alert("No day selected");
      return;
    }
    const habitsForSelectedDay = habits.filter((habit) => {
      return format(parseISO(habit.created_at), "yyyy-MM-dd") === selectedDay;
    });

    if (habitsForSelectedDay.length >= 5) {
      alert("You can only have a maximum of 5 habits per day.");
      return;
    }
    let { data: insertedHabit, error: insertError } = await supabase
      .from("habits")
      .insert([
        {
          name: newHabit,
          created_at: selectedDay,
          user: user?.id,
        },
      ]);

    // console.log("Inserted Habit:", insertedHabit);
    setAddHabitModalVisible(false);
    setNewHabit("");

    if (insertError) console.error("Error adding habit:", insertError);
    fetchHabits();
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setEditedHabitName(habit.name);
    setEditHabitModalVisible(true);
  };

  const updateHabit = async () => {
    if (!editingHabit) return;

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

  const openColorPicker = (habitId: string) => {
    setSelectedHabitId(habitId);
    setColorPickerModalVisible(true);
  };

  const renderDayColumn = (dayDate: Date, habits: Habit[], index: number) => {
    const dayString = format(dayDate, "yyyy-MM-dd");
    const dayHabits = habits.filter(
      (habit) => format(parseISO(habit.created_at), "yyyy-MM-dd") === dayString,
    );

    return (
      <View key={dayString} style={styles.dayColumn}>
        <Text style={styles.dayHeader}>{format(dayDate, "EEE, d MMM")}</Text>
        {dayHabits.map((habit) => {
          const date = parseISO(habit.created_at);
          const color = habit.color_code || "#808080";

          return (
            <View key={habit.id} style={styles.habitContainer}>
              <View style={styles.habitRow}>
                <TouchableOpacity onPress={() => openEditModal(habit)}>
                  <Text style={styles.habitName}>{`${habit.name}`}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.habitIndicator, { backgroundColor: color }]}
                  onPress={() => openColorPicker(habit.id)}
                ></TouchableOpacity>
              </View>
            </View>
          );
        })}
        <TouchableOpacity
          onPress={() => {
            setAddHabitModalVisible(true);
            setSelectedDay(dayString);
            setNewHabit("");
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>Add +</Text>
        </TouchableOpacity>
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
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching habit color:", fetchError);
    } else if (data) {
      const { error: updateError } = await supabase
        .from("habit_colors")
        .update({ color_code: colorCode })
        .eq("habit", habitId);
      updateSuccessful = !updateError;
    } else {
      const { error: insertError } = await supabase
        .from("habit_colors")
        .insert({ habit: habitId, color_code: colorCode });
      updateSuccessful = !insertError;
    }

    setColorPickerModalVisible(false);
    if (updateSuccessful) {
      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === habitId ? { ...habit, color_code: colorCode } : habit,
        ),
      );
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
          <Text style={styles.weekText}>Week {weekOffset}</Text>

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
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <AntDesign
                name="closecircleo"
                size={24}
                color="black"
                style={{ textAlign: "right" }}
                onPress={() => setModalVisible(!modalVisible)}
              />

              <Text style={styles.modalText}>Colour Guide</Text>
              <View style={styles.colorGuide}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: "#FB3231" },
                  ]}
                />
                <Text style={styles.colorDescription}>
                  No I didn't read bad stress many distractions
                </Text>
              </View>
              <View style={styles.colorGuide}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: "#FFC82C" },
                  ]}
                />
                <Text style={styles.colorDescription}>
                  Medium reading medium stress medium distractions
                </Text>
              </View>
              <View style={styles.colorGuide}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: "#41BF00" },
                  ]}
                />
                <Text style={styles.colorDescription}>
                  Yes I read no stress no distractions
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <Modal
        visible={addHabitModalVisible}
        onRequestClose={() => setAddHabitModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <TextInput
            placeholder="New Habit"
            value={newHabit}
            onChangeText={setNewHabit}
            style={{
              height: 40,
              borderColor: "gray",
              width: "30%",
              textAlign: "center",
              borderWidth: 1,
              marginBottom: 20,
            }}
          />
          <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
            <TouchableOpacity
              style={{ backgroundColor: "red", padding: 10 }}
              onPress={() => {
                setAddHabitModalVisible(false);
                setNewHabit("");
              }}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={addHabit}
              style={{ backgroundColor: "blue", padding: 10 }}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </TouchableOpacity>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorPickerModalVisible}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.centeredView}>
            <View style={styles.colorPickerModalView}>
              {["#FFC82C", "#41BF00", "#FB3231"].map((colorCode) => (
                <TouchableOpacity
                  key={colorCode}
                  style={[
                    styles.colorPickerOption,
                    { backgroundColor: colorCode },
                  ]}
                  onPress={() => updateHabitColor(selectedHabitId, colorCode)}
                />
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal
        visible={editHabitModalVisible}
        style={{ width: 50 }}
        onRequestClose={() => setEditHabitModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <TextInput
            placeholder="Edit Habit"
            value={editedHabitName}
            onChangeText={setEditedHabitName}
            style={{
              height: 40,
              borderColor: "gray",
              width: "30%",
              textAlign: "center",
              borderWidth: 1,
              marginBottom: 20,
            }}
          />
          <View style={{ display: "flex", flexDirection: "row", gap: 15 }}>
            <TouchableOpacity
              onPress={() => setEditHabitModalVisible(false)}
              style={{ backgroundColor: "red", padding: 10 }}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={updateHabit}
              style={{ backgroundColor: "blue", padding: 10 }}
            >
              <Text style={{ color: "white" }}>Save Changes</Text>
            </TouchableOpacity>
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
    marginTop: 22,
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
  },
  colorGuide: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
  },
  colorDescription: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonClose: {
    borderRadius: 20,
    elevation: 2,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },

  colorPickerModalView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
});

export default HabitLogBookComponent;
