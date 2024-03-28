import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { AppState } from "react-native";
import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootSiblingParent } from "react-native-root-siblings";
import useUser, { MyUserContextProvider } from "@/hooks/useUser";
import { supabase } from "@/utils/supabase";
import { useColorScheme } from "@/components/useColorScheme";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: "(tabs)",
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Root() {
  return (
    <MyUserContextProvider>
      <RootLayout />
    </MyUserContextProvider>
  );
}

export function RootLayout() {
  const { user, loading, initialLoaded } = useUser();

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && initialLoaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, initialLoaded]);

  if (!loaded || !initialLoaded) {
    return null;
  }

  return <RootLayoutNav user={user} />;
}

function RootLayoutNav({ user }: { user: any }) {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider
        // value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        value={DefaultTheme}
      >
        <Stack initialRouteName={user ? "(tabs)" : "login"}>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false, title: "" }}
          />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen
            name="book/[id]"
            options={{ presentation: "modal", headerShown: false }}
          />
          <Stack.Screen
            name="bookList/[type]"
            options={{
              title: "Books",
            }}
          />
          <Stack.Screen
            name="searchModal/[action]"
            options={{
              presentation: "modal",
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </SafeAreaView>
  );
}
