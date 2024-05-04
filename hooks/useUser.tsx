import "react-native-url-polyfill/auto";
import { useState, useContext, useEffect, createContext } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase";
import { useUserBooksStore } from "@/store/userBooksStore";
import { useRouter } from "expo-router";
import type { Database } from "@/types_db";
import type { UserBook } from "@/store/userBooksStore";

export type User = {
  books: UserBook[];
} & Session["user"];

type UserContextType = {
  user: User | undefined | null;
  session: Session | null;
  loading: boolean;
  initialLoaded: boolean;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined,
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {
  const router = useRouter();
  const { setBooks } = useUserBooksStore();
  const [user, setUser] = useState<User | undefined | null>();
  const [loading, setLoading] = useState<boolean>(true);
  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);

  const getUserDetails = async (user_id: any) => {
    const data = await supabase
      .from("users")
      .select("*")
      .eq("id", user_id)
      .single();

    return data;
  };
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

  async function updateUsersBooks() {
    await getUsersBooks(session?.user?.id);
  }

  async function listenToUserBooks() {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users_books",
          filter: `user=eq.${session?.user?.id}`,
        },
        () => {
          updateUsersBooks();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "users_books",
          filter: `user=eq.${session?.user?.id}`,
        },
        () => {
          updateUsersBooks();
        },
      )
      .subscribe();
  }

  async function getUser() {
    const session = await supabase.auth.getSession();
    // const user = await supabase.auth.getUser();
    await getUsersBooks(session?.data.session?.user?.id);

    setUser(
      session?.data.session?.user
        ? ({
            ...session.data.session.user,
          } as unknown as User)
        : null,
    );
    setSession(session?.data.session ?? null);
    setLoading(false);
    setInitialLoaded(true);
  }

  useEffect(() => {
    getUser();
  }, [user?.id]);

  useEffect(() => {
    if (session) {
      listenToUserBooks();
    }
  }, [session?.access_token]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // const userDetail = await getUserDetails(session?.user.id);
        // const usersBooks = await getUsersBooks(session?.user.id);

        setUser(
          session?.user
            ? ({
                ...session.user,
                // ...userDetail.data,
                // books: usersBooks.data,
              } as unknown as User)
            : null,
        );
        setSession(session ?? null);
        setLoading(false);
        setInitialLoaded(true);
        if (_event == "SIGNED_OUT") {
          setUser(null);
          setSession(null);

          try {
            router.push("/login");
          } catch (e) {
            console.log(e);
          }
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const value = {
    user,
    session,
    loading,
    initialLoaded,
  };
  return <UserContext.Provider value={value} {...props} />;
};

export default function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
}
