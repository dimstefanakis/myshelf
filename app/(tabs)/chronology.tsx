import { View, Text } from "@/components/Themed";
import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  DimensionValue,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableHighlight,
} from "react-native";


const TOTAL_TITLE_CHARS_TO_SHOW=20

type Decade = {
  start: number;
  end: number;
  representation: string;
};

type Book = {
  book: string;
  created_at: string;
  id: string;
  status: string;
};

function yearLastDigit(year: string): number {
  return year.length === 4 ? parseInt(year.charAt(3)) : 0;
}

function generateDecades(numberOfDecades: number): Decade[] {
  let decades: Decade[] = [];
  let currentYear = new Date().getFullYear();
  let currentDecade = currentYear - parseInt(String(currentYear).charAt(3));
  for (let i = 0; i < numberOfDecades; i++) {
    decades.push({
      start: currentDecade,
      end: i === 0 ? currentYear : currentDecade + 9,
      representation: `${currentDecade}s`,
    });
    currentDecade -= 10;
  }
  return decades;
}


function calculateOffset(creationYear: string): DimensionValue {
  const lastDigit = parseInt(creationYear.charAt(3));
  return lastDigit !== 0 ? `${1 - lastDigit * 10}%` : 2;
}

export default function ChronologyScreen() {
  const numberOfDecades = 4;
  const [decades, setDecades] = useState<Decade[]>([]);
  const [addText, setAddText] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);

  const handleInputChange = (text: string) => {
    setAddText(text);
  };

  useEffect(() => {
    setDecades(generateDecades(numberOfDecades));
    setBooks([
      {
        book: "Lord of the rings",
        created_at: "2022",
        status: "",
        id: "1",
      },
      {
        book: "lord of the rings",
        created_at: "2023",
        status: "",
        id: "5",
      },
      {
        book: "This is a book",
        created_at: "2010",
        status: "",
        id: "5",
      },
      {
        book: "Book Kappa",
        created_at: "2010",
        status: "",
        id: "5",
      },
      {
        book: "This might be a book",
        created_at: "2019",
        status: "",
        id: "5",
      },

      {
        book: "This could bea book", 
        created_at: "2015",
        status: "",
        id: "5",
      },

    ])
  }, [])

  function renderBookEntries(decade: Decade): React.JSX.Element[] {
    let decadeBooks = books.filter(book => parseInt(book.created_at) >= decade.start && parseInt(book.created_at) <= decade.end)
    let result: React.JSX.Element[] = []
    let booksToDisplay: Book[] = []
    for (let i=0; i < decadeBooks.length; i++) {
      let numberOfSameYearBooksRendered = booksToDisplay.filter(book => book.book !== decadeBooks[i].book && book.created_at === decadeBooks[i].created_at).length 
      if (numberOfSameYearBooksRendered < 2) {
        booksToDisplay.push(decadeBooks[i])
        result.push(<BookChronologyEntry left={numberOfSameYearBooksRendered === 1} book={booksToDisplay.slice(-1)[0]} index={booksToDisplay.length} key={booksToDisplay.length} />)
      }
    }
    return result
  }
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.inputContainer}>
          <EvilIcons name="search" size={25} />
          <TextInput
            style={styles.input}
            placeholder="Search here"
            onChangeText={handleInputChange}
            value={addText}
            keyboardType="default"
          />
        </View>
        <Pressable style={styles.addButton}>
          <EvilIcons size={25} name="plus" />
          <Text
            style={{ color: "black", alignSelf: "center", textAlign: "center" }}
          >
            Add
          </Text>
        </Pressable>
      </View>
      <ScrollView
        style={{
          flex: 1,
          height: "100%",
          width: Dimensions.get("window").width,
        }}
      >
        <Text style={styles.today}>Today</Text>
        <View style={styles.verticalLine}></View>
        <View style={styles.line} />
        {decades.map((decade) => (
          <View
            key={decade.start}
            style={{
              flexDirection: "column",
              alignSelf: "center",
              width: "20%",
              backgroundColor: "white",
            }}
          >
            <View style={{ backgroundColor: "white" }}>
              <Text style={styles.decadeText}>{decade.representation}</Text>
              <View style={styles.line} />
            </View>
            { renderBookEntries(decade) }
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
type BookChronologyEntryProps = {
  index: number;
  book: Book;
  left: boolean;
}
function BookChronologyEntry(props: BookChronologyEntryProps) {
  return (
    <View style={{
      zIndex: -1,
      position: "absolute",
      top: calculateOffset(props.book.created_at),
      left: props.left ? null: yearLastDigit(props.book.created_at) == 0 ? "85%" : "50%",
      right: props.left ? yearLastDigit(props.book.created_at) ? "50%": "80%" : null,
      marginLeft: 1,
      width: 185,
      borderBottomWidth: 1,
      borderColor: '#3EB489',
      backgroundColor: 'rgba(0, 0, 0, 0.0)'
    }}>
      <Text style={{
        color: 'black',
        textAlign: 'center'
      }} key={props.index} >{props.book.book.length > TOTAL_TITLE_CHARS_TO_SHOW ? props.book.book.slice(0, TOTAL_TITLE_CHARS_TO_SHOW) + "..": props.book.book} ({props.book.created_at})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    maxWidth: Dimensions.get("window").width - 30,
  },
  inputContainer: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "wheat",
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 15,
    height: 40,
  },
  input: {
    alignSelf: "center",
    maxWidth: "90%",
    borderWidth: 0,
    fontSize: 17,
  },
  addButton: {
    marginLeft: 15,
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "wheat",
  },
  today: {
    marginTop: 30,
    color: "black",
    fontSize: 20,
    fontWeight: "500",
    paddingHorizontal: 4,
    width: 70,
    alignSelf: "center",
    textAlign: "center",
  },
  verticalLine: {
    height: 3,
    backgroundColor: "#3EB489",
    width: 90,
    marginTop: 5,
    alignSelf: "center",
  },
  container: {
    backgroundColor: "white",
    padding: 0,
    margin: 0,
    flex: 1,
    height: "100%",
    alignItems: "center",
  },
  decadeText: {
    backgroundColor: "wheat",
    borderWidth: 2,
    borderRadius: 10,
    paddingTop: 2,
    paddingBottom: 0,
    paddingHorizontal: 5,
    borderColor: 'black',
    color: 'black',
    width: 75,
    height: 25,
    textAlign: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  line: {
    width: 2,
    height: 200,
    alignSelf: "center",
    backgroundColor: "black",
  },
});
