import { useLocalSearchParams } from "expo-router";
import { View } from "@/components/Themed";
import SearchView from "@/components/SearchView";

export default function SearchModal() {
  const localSearchParams = useLocalSearchParams();
  const action = localSearchParams.action as string;

  return (
    <View style={{ paddingTop: 20, flex: 1 }}>
      <SearchView showCategories={false} addAction={action} />
    </View>
  );
}
