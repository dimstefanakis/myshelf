import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { supabase } from "@/utils/supabase";
import { AntDesign, EvilIcons, MaterialIcons } from "@expo/vector-icons";

const HabitLogBookComponent = () => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [maxWeekOffset, setMaxWeekOffset] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);

  const getWeeksSinceCreation = (createdAt: string): number => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(
      (currentDate.getTime() - createdDate.getTime()) / millisecondsPerWeek
    );
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
      setMaxWeekOffset(getWeeksSinceCreation(data.created_at));
    }
  };

  useEffect(() => {
    getCreationDate();
  }, []);

  useEffect(() => {
    if (weekOffset < maxWeekOffset) {
      setWeekOffset(maxWeekOffset);
    }
  }, [maxWeekOffset]);

  const goToPreviousWeek = () => {
    setWeekOffset((prevWeekOffset) => Math.max(prevWeekOffset - 1, 0));
  };

  const goToNextWeek = () => {
    setWeekOffset((prevWeekOffset) =>
      Math.min(prevWeekOffset + 1, maxWeekOffset)
    );
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
    padding: 35,
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
});

export default HabitLogBookComponent;
