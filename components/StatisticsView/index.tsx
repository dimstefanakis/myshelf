import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryLabel,
  VictoryPie,
} from "victory-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter, useNavigation } from "expo-router";
import { View, Text, Button, ScrollView } from "@/components/Themed";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import languages from "../languages";
import { useUserBooksStore } from "@/store/userBooksStore";

interface GoogleApiData {
  volumeInfo?: {
    categories?: string[];
  };
}

interface BookTag {
  tags: { name: string };
}

interface Book {
  book_tags: BookTag[];
}

interface FetchedBook {
  book: Book;
}

interface GenreData {
  x: string;
  y: number;
  label: string;
}

function isGoogleApiData(obj: any): obj is GoogleApiData {
  return obj && typeof obj === "object" && "volumeInfo" in obj;
}

function StatisticsView() {
  const { user } = useUser();
  const { books } = useUserBooksStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [booksLanguage, setBooksLanguage] = useState<any[]>([]);
  const [booksGenre, setBooksGenre] = useState<any[]>([]);
  const [fictionData, setFictionData] = useState<any[]>([]);
  const [nonFictionData, setNonFictionData] = useState<any[]>([]);

  const getBooksFictionNonFiction = async () => {
    let { data: fetchedBooks, error } = await supabase
      .from("books")
      .select("google_api_data");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    let fictionCount = 0;
    let nonFictionCount = 0;
    const customRound = (value: number) => {
      const decimalPart = value - Math.floor(value);
      if (decimalPart >= 0.6) {
        return Math.ceil(value);
      } else {
        return Math.round(value);
      }
    };
    if (fetchedBooks) {
      fetchedBooks.forEach((book) => {
        if (isGoogleApiData(book.google_api_data)) {
          const categories = book.google_api_data.volumeInfo?.categories;
          const containsFiction = categories?.some((category: string) =>
            category.toLowerCase().includes("fiction"),
          );
          const containsNonfiction = categories?.some((category: string) =>
            category.toLowerCase().includes("nonfiction"),
          );

          if (containsFiction && !containsNonfiction) {
            fictionCount++;
          } else {
            nonFictionCount++;
          }
        } else {
          nonFictionCount++;
        }
      });
      const totalCount = fictionCount + nonFictionCount;
      const fictionPercentage = customRound((fictionCount / totalCount) * 100);
      const nonFictionPercentage = customRound(
        (nonFictionCount / totalCount) * 100,
      );

      setFictionData([{ bookType: "Fiction", percentage: fictionPercentage }]);
      setNonFictionData([
        { bookType: "Non-fiction", percentage: nonFictionPercentage },
      ]);
    }
  };

  useEffect(() => {
    if (user?.id) {
      getBooksLanguage();
      getBooksGenre();
      getBooksFictionNonFiction();
    }
  }, [user?.id, books]);

  const getBooksGenre = async () => {
    let { data: fetchedBooks, error } = await supabase
      .from("users_books")
      .select(
        `
        id,
        book:books (
          id,
          book_tags (*,
            tags (name)
          )
        )
      `
      )
      .eq("user", user?.id ? user.id : "");
  
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
  
    if (fetchedBooks) {
      const genreCounts = fetchedBooks.reduce<Record<string, number>>(
        (acc, book) => {
          const tags = book?.book?.book_tags.map((tag:any) => tag.tags.name);
          tags?.forEach((tag:any) => {
            acc[tag] = (acc[tag] || 0) + 1;
          });
          return acc;
        },
        {}
      );
  
      const totalGenreAssignments = Object.values(genreCounts).reduce((total, count) => total + count, 0);
      let dataForGenre: GenreData[] = Object.keys(genreCounts)
        .map(genre => ({
          x: genre,
          y: (genreCounts[genre] / totalGenreAssignments) * 100,
          label: `${((genreCounts[genre] / totalGenreAssignments) * 100).toFixed(0)}%`,
        }))
        .sort((a, b) => b.y - a.y); // Sort by percentage, descending
  
      if (dataForGenre.length > 10) {
        const topTen = dataForGenre.slice(0, 10);
        const othersPercentage = dataForGenre.slice(10).reduce((sum, current) => sum + current.y, 0);
        topTen.push({
          x: 'Others',
          y: othersPercentage,
          label: `${othersPercentage.toFixed(0)}%`
        });
        dataForGenre = topTen;
      }
  
      setBooksGenre(dataForGenre);
    } else {
      setBooksGenre([]);
    }
  };

  const getBooksLanguage = async () => {
    let { data: fetchedBooks, error } = await supabase
      .from("books")
      .select(`users_books(*),google_api_data`)
      .eq("users_books.user", user?.id || "");
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
        {},
      );

      const totalBooks = fetchedBooks.length;
      const dataForLanguage = Object.keys(languageCounts).map((language) => ({
        x: language,
        y: (languageCounts[language] / totalBooks) * 100,
        label: `${((languageCounts[language] / totalBooks) * 100).toFixed(0)}%`,
      }));

      setBooksLanguage(dataForLanguage);
    } else {
      setBooksLanguage([]);
    }
  };

  useEffect(() => {
    if (user) {
      getBooksLanguage();
      getBooksGenre();
    }
  }, [user?.id]);

  const customColorScale = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a4d8c2", 
    "#845EC2", "#D65DB1", "#FF6F91", "#00C9A7", "#C4FCEF", "#F9F871" // Last color could be for "Others"
  ];

  const LegendItem = ({ name, color }: any) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendIcon, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{name}</Text>
    </View>
  );

  return books.length == 0 ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text>Add books to your library to see statistics here!</Text>
      <Button
        onPress={() => navigation.navigate("Search")}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: "white" }}>Add books</Text>
      </Button>
    </View>
  ) : (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.graphContainer}>
          <Text style={styles.title}>Genres</Text>
          <VictoryPie
            data={booksGenre}
            colorScale={customColorScale}
            style={{
              labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
            }}
            labelComponent={<VictoryLabel />}
            width={250}
            height={250}
          />
          <View style={styles.legendContainer}>
            {booksGenre.map((item, index) => (
          <LegendItem
            key={index}
            name={item.x}
            color={customColorScale[index % customColorScale.length]}
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
            data={booksLanguage}
            colorScale={customColorScale}
            style={{
              labels: { fill: "black", fontSize: 16, fontWeight: "bold" },
            }}
            labelComponent={<VictoryLabel />}
            width={250}
            height={250}
          />
          <View style={styles.legendContainer}>
            {booksLanguage.map((item, index) => (
              <LegendItem
                key={index}
                name={
                  languages.find((lang) => lang.code === item.x)?.name || item.x
                }
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
    paddingTop: 10,
    // backgroundColor: "white",
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
