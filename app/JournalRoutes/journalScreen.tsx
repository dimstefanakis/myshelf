import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "@/utils/supabase";

interface JournalEntry {
  created_at: string;
  description: string | null;
  id: string | null;
  image_url: string | null;
  title: string | null;
  users_book: string | null;
}

const JournalScreen = () => {
  const [data, setData] = useState<JournalEntry[]>([]);

  const getData = async () => {
    let { data, error } = await supabase.from("journals").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setData(data);
    console.log(data);
  };

  useEffect(() => {
    getData().then((response) => {
      console.log(response);
    });
  }, []);

  return (
    <View style={{ height: "100%" }}>
      {data.map((item) => (
        <View key={item.id}>
          <Text>
            {new Date(item.created_at).toLocaleString()}
          </Text>
          <Text>{item.title}</Text>
        </View>
      ))}
    </View>
  );
};

export default JournalScreen;
