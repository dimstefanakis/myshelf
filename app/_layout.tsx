import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { AppState, StatusBar, Platform } from "react-native";
import { createTamagui, View, Theme, useTheme, TamaguiProvider } from "tamagui";
import defaultConfig from "@tamagui/config/v3";
import Colors from "@/constants/Colors";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useUser, { MyUserContextProvider } from "@/hooks/useUser";
import { useUserBooksStore, UserBook } from "@/store/userBooksStore";
import { supabase } from "@/utils/supabase";
import { useColorScheme } from "@/components/useColorScheme";

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  defaultTheme: 'light',
  themes: {
    light: {
      ...defaultConfig.themes.light,
    },
    dark: {
      ...defaultConfig.themes.dark,
    }
  }
})

type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf { }
}


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
if (Platform.OS == "ios") {
  SplashScreen.preventAutoHideAsync();
}

export default function Root() {
  return (
    <MyUserContextProvider>
      <RootLayout />
    </MyUserContextProvider>
  );
}

export function RootLayout() {
  const { user, loading, initialLoaded } = useUser();
  const { setBooks } = useUserBooksStore();

  const getUsersBooks = async (user_id: any) => {
    const data = await supabase
      .from("users_books")
      .select("*, book(*)")
      .eq("user", user_id);
    if (data?.data) {
      setBooks(data.data as unknown as UserBook[]);
    }
    return data;
  };

  useEffect(() => {
    if (user) {
      getUsersBooks(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (Platform.OS == "android") {
      SplashScreen.hideAsync();
    }
    if (initialLoaded) {
      SplashScreen.hideAsync();
      // StatusBar.setHidden(true);
    }
  }, [initialLoaded]);

  if (!initialLoaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme='light'>
      <ThemeProvider value={DefaultTheme}>
        <RootLayoutNav />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get() }}>
      <StatusBar hidden />
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
          name="removeFromShelf/[id]"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="bookList/[type]"
          options={{
            title: "Books",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerShadowVisible: false, // applied here
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="searchModal/[action]"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="searchCategory/index"
          options={{
            headerShadowVisible: false, // applied here
            headerBackTitleVisible: false,
            headerBackTitle: "Back",
            headerTitle: "Search",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },

            // headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaView>
  );
}
