import { useLocalSearchParams } from "expo-router";
import { View } from "@/components/Themed";
import SearchView from "@/components/SearchView";

export default function CategorySearch() {
  const localSearchParams = useLocalSearchParams();
  const category = localSearchParams.category as string;
  const filter = localSearchParams.filter as string;
  const action = localSearchParams.action as string;

  return (
    <View style={{ paddingTop: 20, flex: 1 }}>
      <SearchView addAction={action} category={category} filter={filter} />
    </View>
  );
}
