import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  TextInput,
} from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { Entypo } from "@expo/vector-icons";
import { View, Text, Button, ScrollView } from "../Themed";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useJournalStore } from "@/store/journalStore";
import type { Quote } from "@/store/journalStore";
import { FontAwesome6 } from "@expo/vector-icons";

const QuoteCard = ({
  quote,
  author,
  work,
  quoteId,
  defaultLiked = false,
}: {
  quote: string | null;
  author: string | null;
  work: string | null;
  quoteId: string;
  defaultLiked: boolean | null;
  message: any;
}) => {
  const [liked, setLiked] = useState(defaultLiked);

  async function toggleQuote() {
    const { data, error } = await supabase
      .from("quotes")
      .update({ liked: liked })
      .eq("id", quoteId);
  }

  useEffect(() => {
    toggleQuote();
  }, [liked]);

  const onShare = async () => {
    await Share.share({
      message: quote + "\n- " + author + ", " + work,
    });
  };

  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.quoteAuthor}>
        {author}, {work}
      </Text>
      <View style={styles.likeButtonContainer}>
        <TouchableOpacity style={styles.likeButton} onPress={onShare}>
          <FontAwesome6 name="share-square" size={12} color="#a0a0a0" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => setLiked(!liked)}
        >
          <Text
            style={liked ? styles.likeButtonTextLiked : styles.likeButtonText}
          >
            ♥
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

function QuotesMenu({
  navigation,
  filterLiked,
  setFilterLiked,
}: {
  navigation: NativeStackNavigationProp<any>;
  filterLiked: boolean;
  setFilterLiked: (value: boolean) => void;
}) {
  function navigateToQuoteEntry() {
    navigation.navigate("AddQuoteEntryScreen");
  }

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => {
          setFilterLiked(!filterLiked);
        }}
        style={{ marginRight: 10 }}
      >
        <Entypo
          name={filterLiked ? "heart" : "heart-outlined"}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          navigateToQuoteEntry();
        }}
      >
        <Entypo name="plus" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const QuotesScreen = () => {
  const { session } = useUser();
  const [showLiked, setShowLiked] = useState(false);
  const { quotes, setQuotes } = useJournalStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <QuotesMenu
          navigation={navigation}
          filterLiked={showLiked}
          setFilterLiked={setShowLiked}
        />
      ),
    });
  }, [navigation, showLiked, setShowLiked]);

  const getData = async () => {
    let { data, error } = await supabase
      .from("quotes")
      .select("*, users_book(*, book(*))")
      .eq("users_book.user", session?.user?.id || "")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setQuotes(data as unknown as Quote[]);
  };

  async function listenToQuoteUpdates() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
          // filter: `users_book.user=eq.${session?.user?.id}`,
        },
        () => {
          getData();
        }
      )
      .subscribe();

    return channel;
  }

  useEffect(() => {
    if (session?.user?.id) {
      getData();
      const channel = listenToQuoteUpdates();
    }
  }, [session?.user?.id]);

  function getAuthor(quote: Quote) {
    const googleApiData = quote.users_book.book.google_api_data as any;
    if (quote.author) {
      return quote.author;
    } else if (googleApiData?.volumeInfo?.authors) {
      return googleApiData?.volumeInfo?.authors[0];
    } else {
      return "Unknown";
    }
  }
  const filteredQuotes = quotes.filter(
    (entry) =>
      entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.users_book?.book.title
        ?.toLowerCase()
        ?.includes(searchQuery.toLowerCase())
  );
  return quotes.length == 0 ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: "#326E78",
          marginBottom: 20,
        }}
      >
        No quotes yet!
      </Text>
      <Button onPress={() => navigation.navigate("AddQuoteEntryScreen")}>
        <Text style={{ color: "white" }}>Create a new quote</Text>
      </Button>
    </View>
  ) : (
    <>
      <View style={styles.container}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.quotesContainer}>
          {filteredQuotes
            .filter((quote) => {
              if (showLiked) {
                return quote.liked;
              } else {
                return true;
              }
            })
            .map((quote, index) => (
              <QuoteCard
                key={quote.id}
                quote={quote.title}
                author={getAuthor(quote)}
                work={quote.users_book.book.title}
                quoteId={quote.id}
                defaultLiked={quote.liked}
                message={undefined}
              />
            ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  contentContainer: {
    padding: 16,
  },
  quotesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  quoteCard: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 16,
    height: 160,
    width: "45%",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  quoteText: {
    fontSize: 11,
    marginBottom: 8,
  },
  quoteAuthor: {
    fontWeight: "bold",
    fontSize: 10,
  },
  likeButtonContainer: {
    display: "flex",
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 10,
  },
  likeButton: {
    alignSelf: "flex-end",
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  likeButtonText: {
    fontSize: 14,
    color: "#a0a0a0",
    opacity: 0.3,
  },
  likeButtonTextLiked: {
    fontSize: 14,
    color: "#ff6b6b",
  },
  searchBar: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    height: 40,
  },
});

export default QuotesScreen;
