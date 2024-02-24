import { View, Text } from "@/components/Themed";
import { EvilIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableHighlight } from "react-native";
import { Icon, Input } from "react-native-elements";

type Decade = {
    start: number;
    end: number;
    representation: string
}
type Book = {
    book: string,
    created_at: string,
    id: string,
    status: string    
}

function yearLastDigit(year: string): number {
    return year.length === 4 ? parseInt(year.charAt(3)): 0
}

function generateDecades(numberOfDecades: number): Decade[] {
    let decades: Decade[] = [];
    let currentYear = new Date().getFullYear()
    let currentDecade = currentYear - parseInt(String(currentYear).charAt(3)) 
    for (let i=0; i<numberOfDecades; i++){
        decades.push({
            start: currentDecade,
            end: i===0 ? currentYear: currentDecade + 9,
            representation: `${currentDecade}s`
        })
        currentDecade -= 10
    }
    return decades
}

function calculateOffset(creationYear: string): string | number {
    const lastDigit = parseInt(creationYear.charAt(3))
    return lastDigit !== 0 ? `-${lastDigit * 10 - 1}%`: 2
}

export default function ChronologyScreen() {
    const numberOfDecades = 11
    const [decades, setDecades] = useState<Decade[]>([])
    const [books, setBooks] = useState<Book[]>([])
    useEffect(()=> {
        setDecades(generateDecades(numberOfDecades))
        setBooks([
            {
                book: "Lord of the rings",
                created_at: "2022",
                status: "",
                id: "1"
            },
            {
                book: "yeah",
                created_at: "2023",
                status: "",
                id: "5"
            },
            {
                book: "This is a book",
                created_at: "2010",
                status: "",
                id: "5"
            },
            {
                book: "This might be a book",
                created_at: "2019",
                status: "",
                id: "5"
            },

            {
                book: "This could be a book",
                created_at: "2015",
                status: "",
                id: "5"
            },

        ])
    }, [])
    return (
        <View style={styles.container}>
            <Text>Hello there</Text>
            <ScrollView style={{
                flex: 1,
                height: '100%',
                width: Dimensions.get('window').width,
            }}>
                <View style={styles.line} />
                {decades.map((decade, index) =>
                    <View key={decade.start} style={{flexDirection: 'column', alignSelf: "center", width: "20%"}}>
                        <View>
                            <Text style={styles.decadeText}>{decade.representation}</Text>
                            <View style={styles.line} />
                        </View>
                        {books.
                            filter(book => parseInt(book.created_at) >= decade.start && parseInt(book.created_at) <= decade.end)
                            .map((book,idx) => <BookChronologyEntry index={idx} book={book}/>)}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}
type BookChronologyEntryProps = {
    index: number;
    book: Book;
}
function BookChronologyEntry(props: BookChronologyEntryProps) {
    return (
        <View style={{
            position: "absolute",
            top: calculateOffset(props.book.created_at),
            left: yearLastDigit(props.book.created_at) == 0 ? 78: 42,
            width: 150,  
            borderBottomWidth: 1,
            borderColor: 'white'
        }}>
            <Text style={{ 
                textAlign: 'right'
            }}key={props.index} >{props.book.book}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { 
        padding: 0,
        margin: 0,
        flex: 1,
        height: '100%',
        alignItems: 'center'
    },
    decadeText: {
        borderWidth: 2,
        borderRadius: 10,
        paddingTop: 2,
        paddingBottom: 0,
        paddingLeft: 10,
        paddingRight: 10, 
        borderColor: 'wheat',
        width: "90%",
        height: 25,
        textAlign: 'center',
        alignSelf: 'center',
    },
    line: { 
        width: 2,
        height: 200,
        alignSelf: 'center',
        backgroundColor: 'white'
    }
})