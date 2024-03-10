import { create } from "zustand";
import type { Database } from "@/types_db";

export type Journal = Database["public"]["Tables"]["journals"]["Row"];
export type Note = Database["public"]["Tables"]["notes"]["Row"] & {
  users_book: Database["public"]["Tables"]["users_books"]["Row"] & {
    book: Database["public"]["Tables"]["books"]["Row"];
  };
};

type JournalStore = {
  journal: Journal[];
  notes: Note[];
  // quotes: Database['public']['Tables']['quotes']['Row'][]
  setJournal: (journal: Journal[]) => void;
  setNotes: (notes: Note[]) => void;
};

export const useJournalStore = create<JournalStore>((set) => ({
  journal: [],
  notes: [],
  quotes: [],
  setJournal: (journal) => set({ journal }),
  setNotes: (notes) => set({ notes }),
  // setQuotes: (quotes) => set({ quotes }),
}));
