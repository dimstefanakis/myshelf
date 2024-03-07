import React, { useEffect } from 'react';
import { Text, View,Button,  TouchableOpacity,  StyleSheet,

} from 'react-native';
import useUser from '@/hooks/useUser';
  import {useState} from 'react';
  import { supabase } from '@/utils/supabase';
  // import { useRouter } from 'expo-router';
  import { useNavigation } from '@react-navigation/native';


const BookScreen = () => {
  const [bookData, setBookData] = useState([{
    title: "",
    description:"",
    users_book: "",
    user:"",
  }]);

  const navigation = useNavigation();

  const user= useUser();

  const getBookData = async () => {
    let { data, error } = await supabase.from("notes").select("*");

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    setBookData(data ? data : []);
  }


  useEffect(() => {
    getBookData();
  }
, []);
    return (<View style={{height:"100%",width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}> 
    {/* button to open modal */}
    <TouchableOpacity
        style={styles.createBookButton}
        onPress={() => navigation.navigate("ModalBookScreen")}
      >
        <Text style={styles.createButtonText}>Create New BookNotes</Text>
      </TouchableOpacity>




    </View>);
  };


  export default BookScreen;

  const styles = StyleSheet.create({
    createBookButton: {
      backgroundColor: "#ff9999",
      padding: 10,
      margin: 10,
      borderRadius: 10,
    },
    createButtonText: {
      color: "white",
      fontWeight: "bold",
    },
  });
