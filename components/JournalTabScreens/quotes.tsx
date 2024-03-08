import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

const QuoteCard = ({ quote, author, work }) => {
  return (
    <View style={styles.quoteCard}>
      <Text style={styles.quoteText}>{quote}</Text>
      <Text style={styles.quoteAuthor}>{author}, {work}</Text>
      <TouchableOpacity style={styles.likeButton}>
        <Text style={styles.likeButtonText}>♥</Text>
      </TouchableOpacity>
    </View>
  );
};

const QuotesScreen = () => {
  const dummyQuotes = [
    { quote: "After all, what can we ever gain in forever looking back and blaming ourselves if our lives have not turned out quite as we might have wished?", author: "Kazuo Ishiguro", work: "Remains of the Day" },
    { quote: "We are never more ourselves than when we think people aren't watching.", author: "Stuart Turton", work: "The Seven Deaths of Evelyn Hardcastle" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.quotesContainer}>
          {dummyQuotes.map((quote, index) => (
            <QuoteCard key={index} {...quote} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#f0f0f0', 
  },
  contentContainer: {
    padding: 16,
  },
  quotesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
   
  },
  quoteCard: {
    backgroundColor: '#fff', 
    borderRadius: 6,
    padding: 16,
    height: 160,
    width: '45%', 
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
    fontWeight: 'bold',
    fontSize: 10,
  },
  likeButton: {
    alignSelf: 'flex-end',
  },
  likeButtonText: {
    fontSize: 14,
    color: '#ff6b6b', 
  }
});

export default QuotesScreen;
