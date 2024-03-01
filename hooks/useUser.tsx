import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import { useRouter } from "expo-router";
import type { Database } from "@/types_db";

type UserBook = Database["public"]["Tables"]["users_books"]["Row"] & {
  book: Database["public"]["Tables"]["books"]["Row"];
};

type User = {
  books: UserBook[];
} & Session["user"];

function useUser() {
  const router = useRouter();
  const [user, setUser] = useState<User | undefined | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);

  const getUserDetails = (user_id: any) =>
    supabase.from("users").select("*").eq("id", user_id).single();
  const getUsersBooks = (user_id: any) =>
    supabase.from("users_books").select("*, book(*)").eq("user", user_id);

  async function updateUsersBooks() {
    const usersBooks = await getUsersBooks(session?.user?.id);
    setUser({
      ...user,
      books: usersBooks.data,
    } as unknown as User);
  }

  async function listenToUserBooks() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
        },
        (payload) => {
          console.log("Change received!", payload);
          if (payload.table === "users_books") {
            updateUsersBooks();
          }
        },
      )
      .subscribe();
  }

  async function getUser() {
    const session = await supabase.auth.getSession();
    // const user = await supabase.auth.getUser();
    const userDetail = await getUserDetails(session?.data.session?.user?.id);
    const usersBooks = await getUsersBooks(session?.data.session?.user?.id);

    setUser(
      session?.data.session?.user
        ? ({
            ...session.data.session.user,
            ...userDetail.data,
            books: usersBooks.data,
          } as unknown as User)
        : null,
    );
    setSession(session?.data.session ?? null);
    setLoading(false);
  }

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (session) {
      listenToUserBooks();
    }
  }, [session]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const userDetail = await getUserDetails(session?.user.id);
        const usersBooks = await getUsersBooks(session?.user.id);

        setUser(
          session?.user
            ? ({
                ...session.user,
                ...userDetail.data,
                books: usersBooks.data,
              } as unknown as User)
            : null,
        );
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
