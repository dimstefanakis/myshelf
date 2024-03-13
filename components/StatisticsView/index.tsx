import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryPie,
} from "victory-native";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";

function StatisticsView() {
  const { user } = useUser();
  const [books, setBooks] = useState<any[]>([]);

  const data = [
    { bookType: "Literary fiction", books: 10 },
    { bookType: "Mystery/Crime/Thriller", books: 2 },
    { bookType: "Biography", books: 2 },
    { bookType: "Gothic fiction", books: 2 },
    { bookType: "Science fiction", books: 10 },
  ];

  const fictionData = [{ bookType: "Fiction", percentage: 92 }];

  const nonFictionData = [{ bookType: "Non-fiction", percentage: 8 }];

  const totalBooks = data.reduce((total, item) => total + item.books, 0);

  const chartData = data.map((item) => ({
    x: item.bookType,
    y: item.books,
    label: `${((item.books / totalBooks) * 100).toFixed(0)}%`,
  }));

  const getBooks = async () => {
    let { data: fetchedBooks, error } = await supabase
      .from("books")
      .select(`google_api_data`);
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    if (fetchedBooks) {
      const languageCounts = fetchedBooks.reduce(
        (acc: { [key: string]: number }, book: { [key: string]: any }) => {
          const lang = book?.google_api_data?.volumeInfo?.language;
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        },
        {}
      );

      const totalBooks = fetchedBooks.length;
      const dataForLanguage = Object.keys(languageCounts).map((language) => ({
        x: language,
        y: (languageCounts[language] / totalBooks) * 100,
        label: `${((languageCounts[language] / totalBooks) * 100).toFixed(0)}%`,
      }));

      setBooks(
        // x, y , label
        dataForLanguage
      );
    } else {
      setBooks([]);
    }
  };

  useEffect(() => {
    getBooks();
  }, []);

  const customColorScale = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a4d8c2",
  ];

  const LegendItem = ({ name, color }: any) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendIcon, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{name}</Text>
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: "white" }}>
      <View style={styles.container}>
        <View style={styles.graphContainer}>
          <Text style={styles.title}>Genres</Text>
          <VictoryPie
            data={chartData}
            colorScale={customColorScale}
            style={{
              labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
            }}
            labelComponent={<VictoryLabel />}
            width={250}
            height={250}
          />
          <View style={styles.legendContainer}>
            {data.map((item, index) => (
              <LegendItem
                key={index}
                name={item.bookType}
                color={customColorScale[index]}
              />
            ))}
          </View>
        </View>
        <View style={styles.graphContainer}>
          <Text style={styles.title2}>Fiction / Non-fiction</Text>
          <VictoryChart domainPadding={{ x: 100, y: 20 }} height={250}>
            <VictoryAxis
              tickValues={[1, 2]}
              tickFormat={["Fiction", "Non-fiction"]}
              style={{ tickLabels: { fontSize: 14 } }}
            />
            <VictoryBar
              data={fictionData}
              x="bookType"
              y="percentage"
              barWidth={40}
              labels={({ datum }) => `${datum.percentage}%`}
              labelComponent={<VictoryLabel dy={-20} />}
              style={{
                data: { fill: "#FF8042" },
                labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
              }}
            />
            <VictoryBar
              data={nonFictionData}
              x="bookType"
              y="percentage"
              barWidth={40}
              labels={({ datum }) => `${datum.percentage}%`}
              labelComponent={<VictoryLabel dy={-20} />}
              style={{
                data: { fill: "#FF8042" },
                labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
              }}
            />
          </VictoryChart>
        </View>
        <View style={styles.graphContainer}>
          <Text style={styles.title2}>Languages</Text>
          <VictoryPie
            data={books}
            colorScale={customColorScale}
            style={{
              labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
            }}
            labelComponent={<VictoryLabel />}
            width={250}
            height={250}
          />
          <View style={styles.legendContainer}>
            {books.map((item, index) => (
              <LegendItem
                key={index}
                name={item.x}
                color={customColorScale[index]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
export default StatisticsView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  graphContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 20,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  title2: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  legendIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
  },
});
