import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { AntDesign, EvilIcons, MaterialIcons } from "@expo/vector-icons";
import useUser from "@/hooks/useUser";
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

  const { user } = useUser();

  const getWeeksSinceCreation = (
    userCreatedAt: string,
    habitCreatedAt: string
  ): number => {
    const start = new Date(userCreatedAt);
    const end = new Date(habitCreatedAt);
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor((end.getTime() - start.getTime()) / millisecondsPerWeek);
  };

  const getCreationDate = async () => {
    let { data, error } = await supabase
      .from("users")
      .select("created_at")
      .single();

    if (error) {
      console.error("Error fetching creation date:", error);
      return;
    }

    if (data) {
      setUserCreatedAt(data.created_at);
      setMaxWeekOffset(
        getWeeksSinceCreation(data.created_at, new Date().toISOString())
      );
    }
  };

  useEffect(() => {
    getCreationDate();
    fetchHabits();
  }, [user]);

  useEffect(() => {
    if (weekOffset < maxWeekOffset) {
      setWeekOffset(maxWeekOffset);
    }
  }, [maxWeekOffset]);

  const fetchHabits = async () => {
    if (!userCreatedAt) return;
    let { data: habitsData, error: habitsError } = await supabase
      .from("habits")
      .select("id, name, created_at");

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
    await fetchHabits();
  };

  const addHabit = async () => {
    let { data: insertedHabit, error: insertError } = await supabase
      .from("habits")
      .insert([{ name: newHabit, created_at: new Date(), user: user?.id }])
      .single();

    setAddHabitModalVisible(false);
    setNewHabit("");

    if (insertError) {
      console.error("Error adding habit:", insertError);
      return;
    }

    if (insertedHabit) {
      await fetchHabits();
    }
  };

  const openColorPicker = (habitId: string) => {
    setSelectedHabitId(habitId);
    setColorPickerModalVisible(true);
  };
  const renderHabit = ({ item }: { item: Habit }) => {
    const date = new Date(item.created_at);
    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const color = item.color_code || "#808080";

    return (
      <View style={styles.habitContainer}>
        <Text>{`${item.name} - ${formattedDate}`}</Text>
        <TouchableOpacity
          style={[styles.habitIndicator, { backgroundColor: color }]}
          onPress={() => openColorPicker(item.id)}
        />
      </View>
    );
  };

  const goToPreviousWeek = () => {
    setWeekOffset((prevWeekOffset) => Math.max(prevWeekOffset - 1, 0));
  };

  const goToNextWeek = () => {
    setWeekOffset((prevWeekOffset) =>
      Math.min(prevWeekOffset + 1, maxWeekOffset)
    );
  };

  const updateHabitColor = async (
    habitId: string | null,
    colorCode: string
  ) => {
    if (!habitId) {
      setColorPickerModalVisible(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("habit_colors")
      .select("id")
      .eq("habit", habitId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching habit color:", fetchError);
      setColorPickerModalVisible(false);
      return;
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("habit_colors")
        .update({ color_code: colorCode })
        .eq("habit", habitId);

      if (updateError) {
        console.error("Error updating habit color:", updateError);
      }
    } else {
      const { error: insertError } = await supabase
        .from("habit_colors")
        .insert({ habit: habitId, color_code: colorCode });

      if (insertError) {
        console.error("Error inserting habit color:", insertError);
      }
    }

    setColorPickerModalVisible(false);
    fetchHabits();
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekNavigator}>
        <TouchableOpacity
          onPress={goToPreviousWeek}
          disabled={weekOffset === 0}
        >
          <MaterialIcons name="navigate-before" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.weekText}>Week {weekOffset}</Text>
        <TouchableOpacity
          onPress={goToNextWeek}
          disabled={weekOffset >= maxWeekOffset}
        >
          <MaterialIcons name="navigate-next" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <EvilIcons name="question" size={24} color="black" />
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
                  style={[styles.colorIndicator, { backgroundColor: "red" }]}
                />
                <Text style={styles.colorDescription}>
                  No I didn't read bad stress many distractions
                </Text>
              </View>
              <View style={styles.colorGuide}>
                <View
                  style={[styles.colorIndicator, { backgroundColor: "orange" }]}
                />
                <Text style={styles.colorDescription}>
                  Medium reading medium stress medium distractions
                </Text>
              </View>
              <View style={styles.colorGuide}>
                <View
                  style={[styles.colorIndicator, { backgroundColor: "green" }]}
                />
                <Text style={styles.colorDescription}>
                  Yes I read no stress no distractions
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      </View>
      <TouchableOpacity
        onPress={() => setAddHabitModalVisible(true)}
        style={{ margin: 10 }}
      >
        <Text>Add +</Text>
      </TouchableOpacity>
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
              borderWidth: 1,
              marginBottom: 20,
            }}
          />
          <TouchableOpacity
            onPress={addHabit}
            style={{ backgroundColor: "blue", padding: 10 }}
          >
            <Text style={{ color: "white" }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <FlatList
        data={habits.filter((habit) => habit.weekOffset === weekOffset)}
        renderItem={renderHabit}
        keyExtractor={(item) => item.id}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={colorPickerModalVisible}
        onRequestClose={() => {
          setColorPickerModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.colorPickerModalView}>
            {["#FFFF00", "#008000", "#FF0000"].map((colorCode) => (
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
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  weekNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    width: "100%",
  },
  weekText: {
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
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
  dayColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  dayHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  habitContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  habitIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
});

export default HabitLogBookComponent;
