import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View, useColorScheme } from "react-native";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaWrapper backgroundColor={theme.background}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.foreground }]}>Home</Text>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
});
