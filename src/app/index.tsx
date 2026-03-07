import { useRouter } from "expo-router";
import { Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView>
      <Button
        title="Go to Create"
        onPress={() => {
          router.push("/create");
        }}
      />
    </SafeAreaView>
  );
}
