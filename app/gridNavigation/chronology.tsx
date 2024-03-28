import { View, Text, TextInput } from "@/components/Themed";
import useUser, { UserBook } from "@/hooks/useUser";
import { useUserBooksStore } from "@/store/userBooksStore";
import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  DimensionValue,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

const TOTAL_TITLE_CHARS_TO_SHOW = 18;

type Decade = {
  start: number;
  end: number;
  representation: string;
};

function yearLastDigit(creationDate: string): number {
  const year: string = creationDate.slice(0, 4);
  return year.slice(-1) !== "-" ? parseInt(year.charAt(3)) : 0;
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

function getBookCreationYear(book: UserBook): string {
  return (book.book.google_api_data as any).volumeInfo.publishedDate.slice(
    0,
    4,
  );
}

function calculateOffset(creationYear: string): DimensionValue {
  const lastDigit = parseInt(creationYear.charAt(3));
  return lastDigit !== 0 ? `${1 - lastDigit * 10}%` : 2;
}

export default function ChronologyScreen() {
  const numberOfDecades = 4;
  const [decades, setDecades] = useState<Decade[]>([]);
  const [searchQuery, setSearchQuert] = useState<string>("");
  const { user, session, loading } = useUser();
  const { books } = useUserBooksStore();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);

  const handleInputChange = (text: string) => {
    setSearchQuert(text);
  };

  useEffect(() => {
    setDecades(generateDecades(numberOfDecades));
    setUserBooks(books ? books : []);
  }, [loading, books]);

  useEffect(() => {
    setUserBooks(
      books
        ? books.filter(
            (userBook) =>
              userBook.book.title
                ?.toLowerCase()
                .includes(searchQuery.toLocaleLowerCase()) ||
              getBookCreationYear(userBook).includes(searchQuery),
          )
        : [],
    );
  }, [searchQuery]);

  function renderBookEntries(decade: Decade): React.JSX.Element[] {
    let decadeBooks = userBooks.filter(
      (item) =>
        parseInt(getBookCreationYear(item)) >= decade.start &&
        parseInt(getBookCreationYear(item)) <= decade.end,
    );
    let result: React.JSX.Element[] = [];
    let booksToDisplay: UserBook[] = [];
    for (let i = 0; i < decadeBooks.length; i++) {
      let numberOfSameYearBooksRendered = booksToDisplay.filter(
        (item) =>
          item.book.title !== decadeBooks[i].book.title &&
          getBookCreationYear(item) === getBookCreationYear(decadeBooks[i]),
      ).length;
      if (numberOfSameYearBooksRendered < 2) {
        booksToDisplay.push(decadeBooks[i]);
        result.push(
          <BookChronologyEntry
            left={numberOfSameYearBooksRendered === 1}
            book={booksToDisplay.slice(-1)[0]}
            index={booksToDisplay.length}
            key={booksToDisplay.length}
          />,
        );
      }
    }
    return result;
  }

  if (loading) {
    return (
      <View>
        <Text> Loading... </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.inputContainer}>
          {/* <EvilIcons name="search" size={25} /> */}
          <TextInput
            // style={styles.input}
            placeholder="Search here"
            onChangeText={handleInputChange}
            value={searchQuery}
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
            {renderBookEntries(decade)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
type BookChronologyEntryProps = {
  index: number;
  book: UserBook;
  left: boolean;
};
function BookChronologyEntry(props: BookChronologyEntryProps) {
  return (
    <View
      style={{
        zIndex: -1,
        position: "absolute",
        top: calculateOffset(getBookCreationYear(props.book)),
        left: props.left
          ? null
          : yearLastDigit(getBookCreationYear(props.book)) == 0
            ? "92%"
            : "50%",
        right: props.left
          ? yearLastDigit(getBookCreationYear(props.book))
            ? "52%"
            : "80%"
          : null,
        marginLeft: 1,
        width: 185,
        borderBottomWidth: 1,
        borderColor: "#3EB489",
        backgroundColor: "rgba(0, 0, 0, 0.0)",
      }}
    >
      <Text
        style={{
          color: "black",
          textAlign: "center",
        }}
        key={props.index}
      >
        {props.book.book.title!.length > TOTAL_TITLE_CHARS_TO_SHOW
          ? props.book.book.title!.slice(0, TOTAL_TITLE_CHARS_TO_SHOW) + ".."
          : props.book.book.title}{" "}
        ({getBookCreationYear(props.book)})
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "white",
    maxWidth: Dimensions.get("window").width - 30,
    marginTop: 10,
  },
  inputContainer: {
    width: "65%",
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "wheat",
    // borderWidth: 1,
    marginRight: 15,
    height: 40,
  },
  // input: {
  //   alignSelf: "center",
  //   maxWidth: "90%",
  //   borderWidth: 0,
  //   fontSize: 17,
  // },
  addButton: {
    marginLeft: 15,
    flexDirection: "row",
    borderRadius: 6,
    borderWidth: 1,
    width: 80,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#E0E0E0",

    // backgroundColor: "wheat",
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
    borderColor: "black",
    color: "black",
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
