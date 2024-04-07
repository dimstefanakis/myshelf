import React, { useState, useEffect } from "react";
import { StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import { View, Text, Button, ScrollView } from "../Themed";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useJournalStore } from "@/store/journalStore";
import type { Quote } from "@/store/journalStore";

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

  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.quoteAuthor}>
        {author}, {work}
      </Text>
      <View style={styles.likeButtonContainer}>
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

const QuotesScreen = () => {
  const { session } = useUser();
  const { quotes, setQuotes } = useJournalStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

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
        },
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
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <View style={styles.quotesContainer}>
        {quotes.map((quote, index) => (
          <QuoteCard
            key={index}
            quote={quote.title}
            author={getAuthor(quote)}
            work={quote.users_book.book.title}
            quoteId={quote.id}
            defaultLiked={!!quote.liked}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
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
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  likeButton: {
    alignSelf: "flex-end",
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
});

export default QuotesScreen;
