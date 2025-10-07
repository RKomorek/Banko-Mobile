import { FinancialMetrics } from "@/components/financial-metrics";
import { HelloWave } from "@/components/hello-wave";
import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Colors } from "@/constants/theme";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [userInfo, setUserInfo] = useState<{
    name?: string;
    surname?: string;
    email?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const screenWidth = Dimensions.get("window").width - 28;

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        setUserInfo({ email: user.email, ...snap.data() } as any);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaWrapper backgroundColor={theme.background}>
      <ScrollView>
        <View style={styles.container}>
          <Card
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.foreground, fontSize: 28 }}>
                Olá, {userInfo?.name}!<HelloWave />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={{ color: theme.foreground }}>
                É ótimo contar com sua presença!
              </Text>
              <Text style={{ color: theme.foreground }}>
                Explore as oportunidades disponíveis hoje.
              </Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.container}>
          <Card
            style={{ backgroundColor: theme.card, borderColor: theme.border }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.foreground }}>
                Saldo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                R$ 100
              </Text>
              <Text style={{ color: theme.foreground, fontSize: 10 }}>
                Saldo disponível em sua conta
              </Text>
            </CardContent>
          </Card>
        </View>

        <Card
          style={{
            alignSelf: "center",
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
          <LineChart
            data={{
              labels: ["January", "February", "March", "April", "May", "June"],
              datasets: [
                {
                  data: [50, 80, 40, 95, 85, 70], // Entradas
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // linha verde
                  strokeWidth: 2, // espessura da linha
                },
                {
                  data: [30, 60, 20, 80, 60, 50], // Saídas
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // linha vermelha
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            yAxisSuffix="k"
            chartConfig={{
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              color: (opacity = 1) =>
                `${
                  colorScheme === "dark"
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(000, 000, 000, ${opacity})`
                }`,
              labelColor: (opacity = 1) =>
                `${
                  colorScheme === "dark"
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(000, 000, 000, ${opacity})`
                }`,
            }}
            bezier
            style={{
              borderRadius: 12,
            }}
          />
        </Card>

        <View style={styles.container}>
          <FinancialMetrics />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    flex: 1,
    verticalAlign: "middle",
    fontWeight: "bold",
    fontSize: 12,
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
