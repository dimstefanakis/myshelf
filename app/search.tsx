import SearchView from "@/components/SearchView";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "tamagui";
import { View } from "tamagui";

export default function Search() {
  const router = useRouter();

  const { addAction } = useLocalSearchParams();

  return (
    <SearchView addAction={addAction as string | undefined} />
  );
}
