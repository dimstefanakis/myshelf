import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomepageContainers from "../(tabs)/index";
import ChronologyScreen from "../gridNavigation/chronology";
import JournalLanding from "../gridNavigation/journal";
import GoalTrackerScreen from "../gridNavigation/goalTracker";
import AddJournalEntryScreen from "../addJournalEntry";
import AddBookNoteEntryScreen from "../addBookNoteEntry";
import AddQuoteEntryScreen from "../addQuoteEntry";
import MapScreen from "../gridNavigation/map";
import AddMarker from "../addMarker";
import EditMarkers from "@/components/EditMarker";

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
        name="Map"
        component={MapScreen}
        options={{ headerShown: true, headerTitle: "Map" }}
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
      <Stack.Screen
        name="AddMarker"
        component={AddMarker}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="GoalTracker"
        component={GoalTrackerScreen}
        options={{ headerShown: true, headerTitle: "Goal Tracker" }}
      />
      <Stack.Screen
        name="EditMarkers"
        component={EditMarkers}
        options={{ presentation: "modal", headerShown: false}}
          />
    </Stack.Navigator>
  );
}
