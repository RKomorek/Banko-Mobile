import { FinancialMetrics } from "@/components/financial-metrics";
import { HelloWave } from "@/components/hello-wave";
import SafeAreaWrapper from "@/components/SafeAreaWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Colors } from "@/constants/theme";
import { auth, db } from "@/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
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
  const [balance, setBalance] = useState<string>("0.00");
  const [chartData, setChartData] = useState<{ labels: string[]; entradas: number[]; saidas: number[] }>({
    labels: [],
    entradas: [],
    saidas: [],
  });
  const screenWidth = Dimensions.get("window").width - 28;
   const formatCurrency = (value: string | number) =>
    `R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        setUserInfo({ email: user.email, ...snap.data() } as any);

        // Busca saldo da conta
        const accQ = query(collection(db, "accounts"), where("user_id", "==", user.uid));
        const accSnap = await getDocs(accQ);
        if (!accSnap.empty) {
          setBalance(accSnap.docs[0].data().saldo || "0.00");
        }

        // Busca transações do usuário
        const txQ = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const txSnap = await getDocs(txQ);

        // Agrupa por mês
        const entradas: { [key: string]: number } = {};
        const saidas: { [key: string]: number } = {};
        const meses: Set<string> = new Set();

        txSnap.forEach((doc) => {
          const tx = doc.data();
          const date = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date);
          const mes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          meses.add(mes);
          if (tx.isNegative) {
            saidas[mes] = (saidas[mes] || 0) + Math.abs(tx.amount);
          } else {
            entradas[mes] = (entradas[mes] || 0) + Math.abs(tx.amount);
          }
        });

        // Ordena meses
        const mesesOrdenados = Array.from(meses).sort();

        setChartData({
          labels: mesesOrdenados,
          entradas: mesesOrdenados.map((m) => entradas[m] || 0),
          saidas: mesesOrdenados.map((m) => saidas[m] || 0),
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaWrapper backgroundColor={theme.background}>
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        <View style={styles.container}>
          <Card
            style={{ backgroundColor: theme.card, borderColor: theme.border, marginBottom: -15  }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.foreground, fontSize: 28 }}>
                Olá, {userInfo?.name}! <HelloWave />
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
                Saldo atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 24,
                  fontWeight: "700",
                }}
              >
                {formatCurrency(balance)}
              </Text>
              <Text style={{ color: theme.foreground, fontSize: 12 }}>
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
              labels: chartData.labels.length > 0 ? chartData.labels : ["Sem dados"],
              datasets: [
                {
                  data: chartData.entradas.length > 0 ? chartData.entradas : [0],
                  color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: chartData.saidas.length > 0 ? chartData.saidas : [0],
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={screenWidth}
            height={220}
            yAxisLabel="R$ "
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
    flex: 1,
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
});