import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import useUser from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useJournalStore } from "@/store/journalStore";
import type { Quote } from "@/store/journalStore";

const QuoteCard = ({
  quote,
  author,
  work,
}: {
  quote: string | null;
  author: string | null;
  work: string | null;
}) => {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.quoteAuthor}>
        {author}, {work}
      </Text>
      <TouchableOpacity style={styles.likeButton}>
        <Text style={styles.likeButtonText}>♥</Text>
      </TouchableOpacity>
    </View>
  );
};

const QuotesScreen = () => {
  const { session } = useUser();
  const { quotes, setQuotes } = useJournalStore();

  const getData = async () => {
    let { data, error } = await supabase
      .from("quotes")
      .select("*, users_book(*, book(*))")
      .eq("users_book.user", session?.user?.id || "");
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
          console.log("Quote updated");
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.quotesContainer}>
          {quotes.map((quote, index) => (
            <QuoteCard
              key={index}
              quote={quote.title}
              author={getAuthor(quote)}
              work={quote.users_book.book.title}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: "#f0f0f0",
  },
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
  likeButton: {
    alignSelf: "flex-end",
  },
  likeButtonText: {
    fontSize: 14,
    color: "#ff6b6b",
  },
});

export default QuotesScreen;
