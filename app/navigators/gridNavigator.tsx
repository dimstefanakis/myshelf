import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTheme } from "tamagui";
import HomepageContainers from "../(tabs)/index";
import ChronologyScreen from "../gridNavigation/chronology";
import JournalLanding from "../gridNavigation/journal";
import GoalTrackerScreen from "../gridNavigation/goalTracker";
import AddJournalEntryScreen from "../addJournalEntry";
import AddBookNoteEntryScreen from "../addBookNoteEntry";
import HabitLogBook from "../gridNavigation/habitLogBook";
import AddQuoteEntryScreen from "../addQuoteEntry";
import MapScreen from "../gridNavigation/map";
import AddMarker from "../addMarker";
import EditMarkers from "@/components/EditMarker";
import StatisticsScreen from "../gridNavigation/statistics";
import Search from "@/components/SearchView";
import { Platform, View, StatusBar } from "react-native";
import Colors from "@/constants/Colors";

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        title: "",
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="GridItems" component={HomepageContainers} />
      <Stack.Screen name="Search" component={Search} />
      {/* <Stack.Screen name="MyShelf" component={MyShelfScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} /> */}
      <Stack.Screen
        name="Chronology"
        component={ChronologyScreen}
        options={{
          headerShown: true,
          headerTitle: "Chronology",
        }}
      />
      <Stack.Screen
        name="Journal"
        component={JournalLanding}
        options={{
          headerShown: true,
          headerTitle: "Journal",
          headerStyle: {
            backgroundColor: theme?.background?.val,
          },
          contentStyle: { backgroundColor: theme?.background?.val },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: true, headerTitle: "Map" }}
      />
      <Stack.Screen
        name="HabitLogBook"
        component={HabitLogBook}
        options={{ headerShown: true, headerTitle: "Habit LogBook" }}
      />
      <Stack.Screen
        name="AddJournalEntryScreen"
        component={AddJournalEntryScreen}
        options={{
          presentation: "modal",
          headerShown: Platform.OS === "android",
          headerTitle: "Journal",
        }}
      />
      <Stack.Screen
        name="AddBookNoteEntryScreen"
        component={AddBookNoteEntryScreen}
        options={{
          presentation: "modal",
          headerShown: Platform.OS === "android" || Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="AddQuoteEntryScreen"
        component={AddQuoteEntryScreen}
        options={{
          presentation: "modal",
          headerShown: Platform.OS === "android",
          headerTitle: "Quote",
        }}
      />
      <Stack.Screen
        name="AddMarker"
        component={AddMarker}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="GoalTracker"
        component={GoalTrackerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditMarkers"
        component={EditMarkers}
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: "Statistics",
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
