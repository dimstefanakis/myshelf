import { create } from "zustand";
import type { Database } from "@/types_db";

export type UserBook = Database["public"]["Tables"]["users_books"]["Row"] & {
  book: Database["public"]["Tables"]["books"]["Row"];
};

type UserBooksStore = {
  books: UserBook[];
  setBooks: (quotes: UserBook[]) => void;
};

export const useUserBooksStore = create<UserBooksStore>((set) => ({
  books: [],
  setBooks: (books) => set({ books }),
}));
