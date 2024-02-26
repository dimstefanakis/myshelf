import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import { useRouter } from "expo-router";

function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const getUserDetails = (user_id: any) =>
    supabase.from("users").select("*").eq("id", user_id).single();

  async function getUser() {
    const session = await supabase.auth.getSession();
    // const user = await supabase.auth.getUser();
    const userDetail = await getUserDetails(session?.data.session?.user?.id);

    setUser(
      session?.data.session?.user
        ? { ...session.data.session.user, ...userDetail.data }
        : null,
    );
    setSession(session?.data.session ?? null);
    setLoading(false);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const userDetail = await getUserDetails(session?.user.id);

        setUser(session?.user ? { ...session.user, ...userDetail.data } : null);
        setSession(session ?? null);
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, session, loading };
}

export default useUser;
