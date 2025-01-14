import SearchView from "@/components/SearchView";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function Search() {
  const router = useRouter();

  const { addAction } = useLocalSearchParams();

  return <SearchView addAction={addAction as string | undefined} />;
}
