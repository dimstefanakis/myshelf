import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomepageContainers from "../(tabs)/index";
import ChronologyScreen from "../gridNavigation/chronology";
import JournalLanding from "../gridNavigation/journal";
import AddJournalEntryScreen from "../addJournalEntry";
import AddBookNoteEntryScreen from "../addBookNoteEntry";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, title: "" }}>
      <Stack.Screen name="GridItems" component={HomepageContainers} />
      <Stack.Screen
        name="Chronology"
        component={ChronologyScreen}
        options={{ headerShown: true, headerTitle: "asd" }}
      />
      <Stack.Screen
        name="Journal"
        component={JournalLanding}
        options={{ headerShown: true, headerTitle: "Journal" }}
      />
      <Stack.Screen
        name="AddJournalEntryScreen"
        component={AddJournalEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="AddBookNoteEntryScreen"
        component={AddBookNoteEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
