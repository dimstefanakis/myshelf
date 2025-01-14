import AsyncStorage from "@react-native-async-storage/async-storage";
import { setupURLPolyfill } from "react-native-url-polyfill";

setupURLPolyfill();

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types_db";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
