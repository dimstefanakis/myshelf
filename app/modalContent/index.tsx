import React,{useState} from 'react';
import { View, Text ,TextInput} from 'react-native';
import { NativeSyntheticEvent,
    TextInputChangeEventData, } from 'react-native';
    import { supabase } from "@/utils/supabase";


const ModalContentScreen = () => {
    const [journalData, setJournalData] = React.useState({
        title: "",
        book: "",
        description: "",
    });

    const handleChangeTitle = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setJournalData({ ...journalData, title: event.nativeEvent.text });
        console.log(journalData)
    }

    const handleChangeBook = (event:NativeSyntheticEvent<TextInputChangeEventData>) => {
        setJournalData({ ...journalData, book: event.nativeEvent.text });
        console.log(journalData)
    }

    const handleChangeDescription = (event:NativeSyntheticEvent<TextInputChangeEventData>) => {
        setJournalData({ ...journalData, description: event.nativeEvent.text });
        console.log(journalData)
    }

    const handleSubmit = () => {
        console.log(journalData)
        supabase.from("journals").insert([
            {
                title: journalData.title,
                users_book: journalData.book,
                description: journalData.description,
            }
        ]).then((response) => {
            console.log(response);
        });

    }


    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <TextInput placeholder="Title" style={{
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            width: "80%",
            padding: 10,
            borderRadius: 10,
            margin:20
        }} 
            onChange={handleChangeTitle}
        />
        <TextInput placeholder="Book" style={{
            height: 40,
            borderColor: "gray",
            borderWidth: 1,
            width: "80%",
            padding: 10,
            borderRadius: 10,
            marginBottom:20
        }}
            onChange={handleChangeBook}
        />
       <TextInput 
    placeholder="Description" 
    multiline={true} // This prop enables multi-line text input
    numberOfLines={4} // Optional: Sets the initial number of lines
    style={{
        height: 120, // You might want to adjust this based on your needs
        borderColor: "gray",
        borderWidth: 1,
        width: "80%",
        padding: 10,
        borderRadius: 10,
        justifyContent: "flex-start",
        alignItems: "flex-start",
        textAlignVertical: "top", // Aligns text to the top
        textAlign: "left", // Aligns text to the left, usually default
    }} 
    onChange={handleChangeDescription}
/>

        <View style={{
            backgroundColor: "blue",
            padding: 10,
            alignItems: "center",
            width: 200, 
            borderRadius: 10,
            marginVertical: 10,
        }}>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }} onPress={handleSubmit}>
                Submit
            </Text>
            </View>

      </View>
    );
  };

export default ModalContentScreen;