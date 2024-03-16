import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomepageContainers from "../(tabs)/index";
import ChronologyScreen from "../gridNavigation/chronology";
import JournalLanding from "../gridNavigation/journal";
import AddJournalEntryScreen from "../addJournalEntry";
import AddBookNoteEntryScreen from "../addBookNoteEntry";
import HabitLogBook from "../gridNavigation/habitLogBook";
import AddQuoteEntryScreen from "../addQuoteEntry";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, title: "" }}>
      <Stack.Screen name="GridItems" component={HomepageContainers} />
      <Stack.Screen
        name="Chronology"
        component={ChronologyScreen}
        options={{ headerShown: true, headerTitle: "Chronology" }}
      />
      <Stack.Screen
        name="Journal"
        component={JournalLanding}
        options={{ headerShown: true, headerTitle: "Journal" }}
      />
      <Stack.Screen
        name="HabitLogBook"
        component={HabitLogBook}
        options={{ headerShown: true, headerTitle: "Habit LogBook" }}
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
      <Stack.Screen
        name="AddQuoteEntryScreen"
        component={AddQuoteEntryScreen}
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
