import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { useDebounceValue } from "usehooks-ts";
import {
  StyleSheet,
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";

import { Text, View } from "@/components/Themed";

type Book = {
  id: string;
  etag: string;
  volumeInfo: VolumeInfo;
  searchInfo: SearchInfo;
};

type SearchInfo = {
  textSnippet: string;
};

type VolumeInfo = {
  title: string;
  subtitle: string;
  authors: string[];
  publisher: string;
  publishedDate: string;
  description: string;
  industryIdentifiers: {
    type: string;
    identifier: string;
  }[];
  readingModes: {
    text: boolean;
    image: boolean;
  };
  pageCount: number;
  printType: string;
  categories: string[];
  averageRating: number;
  ratingsCount: number;
  maturityRating: string;
  allowAnonLogging: boolean;
  contentVersion: string;
  panelizationSummary: {
    containsEpubBubbles: boolean;
    containsImageBubbles: boolean;
  };
  imageLinks: {
    smallThumbnail: string;
    thumbnail: string;
  };
  language: string;
  previewLink: string;
  infoLink: string;
  canonicalVolumeLink: string;
};

export default function Search() {
  const [search, setSearch] = useDebounceValue("", 500);
  const [results, setResults] = useState<Book[] | []>([]);

  function handleChange(event: NativeSyntheticEvent<TextInputChangeEventData>) {
    setSearch(event.nativeEvent.text);
  }

  async function getBookResults(text: string) {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${text}`,
    );
    const data = await response.json();
    setResults(data.items);
    console.log(data);
  }

  useEffect(() => {
    console.log(search);
    if (search) {
      getBookResults(search);
    }
  }, [search]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
      }}
    >
      <TextInput
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          width: "80%",
          padding: 10,
          borderRadius: 10,
        }}
        placeholder="Search"
        // value={search}
        onChange={handleChange}
      />
      <View
        style={{
          flex: 1,
          width: "100%",
          padding: 10,
        }}
      >
        {results.map((book: Book) => (
          <SearchResult key={book.id} book={book} />
        ))}
      </View>
    </View>
  );
}

function SearchResult({ book }: { book: Book }) {
  const blurhash =
    "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
      }}
    >
      <Image
        source={{ uri: book.volumeInfo.imageLinks?.thumbnail }}
        style={{ width: 50, height: 50, borderRadius: 10 }}
        placeholder={blurhash}
        transition={1000}
      />
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          marginLeft: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          {book.volumeInfo.title}
        </Text>
        <Text style={{ fontSize: 12, color: "gray" }}>
          {book.volumeInfo.authors?.join(", ")}
        </Text>
      </View>
    </View>
  );
}
