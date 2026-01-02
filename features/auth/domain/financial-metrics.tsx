import { auth, db } from "@/firebase";
import { Colors } from "@/shared/constants/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "../../../shared/ui/card";

export function FinancialMetrics() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) {
        setTransactions([]);
        setLoading(false);
        return;
      }
      const txQ = query(collection(db, "transactions"), where("userId", "==", user.uid));
      const txSnap = await getDocs(txQ);
      const txs = txSnap.docs.map((doc) => {
        const tx = doc.data();
        // Normaliza os dados para o formato esperado
        return {
          data: tx.date?.toDate ? tx.date.toDate() : new Date(tx.date),
          movimentacao: tx.isNegative ? "saida" : "entrada",
          valor: Math.abs(tx.amount),
          tipo: tx.type,
        };
      });
      setTransactions(txs);
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const formatCurrency = (value: any) => `R$ ${Number(value).toFixed(2)}`;

  const getMetrics = () => {
    if (!transactions.length) return {};

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.data);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const previousMonthTransactions = transactions.filter((t: any) => {
      const date = new Date(t.data);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    type Transacao = {
      data: Date;
      movimentacao: string;
      valor: number;
      tipo: string;
    };

    const sumByType = (arr: Transacao[], type: string): number =>
      arr
        .filter((t) => t.movimentacao === type)
        .reduce((sum, t) => sum + t.valor, 0);

    const currentMonthEntradas = sumByType(currentMonthTransactions, "entrada");
    const currentMonthSaidas = sumByType(currentMonthTransactions, "saida");
    const previousMonthEntradas = sumByType(
      previousMonthTransactions,
      "entrada"
    );
    const previousMonthSaidas = sumByType(previousMonthTransactions, "saida");

    const entradaTrend =
      previousMonthEntradas > 0
        ? ((currentMonthEntradas - previousMonthEntradas) /
            previousMonthEntradas) *
          100
        : 0;
    const saidaTrend =
      previousMonthSaidas > 0
        ? ((currentMonthSaidas - previousMonthSaidas) / previousMonthSaidas) *
          100
        : 0;

        const paymentMethods = transactions.reduce<Record<string, number>>(
      (acc, t: Transacao) => {
        acc[t.tipo] = (acc[t.tipo] || 0) + 1;
        return acc;
      },
      {}
    );

    // Formata o nome do método de pagamento
    const paymentLabels: Record<string, string> = {
      boleto: "Boleto",
      cartao: "Cartão",
      pix: "Pix",
    };

    const mostUsedPaymentKey =
      Object.entries(paymentMethods).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )[0]?.[0];

    const mostUsedPayment =
      mostUsedPaymentKey && paymentLabels[mostUsedPaymentKey]
        ? paymentLabels[mostUsedPaymentKey]
        : "N/A";

    return {
      currentMonthEntradas,
      currentMonthSaidas,
      entradaTrend,
      saidaTrend,
      mostUsedPayment,
      totalTransactions: transactions.length,
    };
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Métricas financeiras</Text>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView>
      <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
        <CardHeader>
          <CardTitle>
            <Text style={[styles.title, { color: theme.foreground }]}>
              Métricas financeiras
            </Text>
          </CardTitle>
          <Text style={[styles.description, { color: theme.foreground }]}>
            Análise detalhada do seu comportamento financeiro
          </Text>
        </CardHeader>
        <CardContent>
          {/* Entradas */}
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <FontAwesome6 name="arrow-trend-up" size={20} color="rgb(0, 255, 0)" />
              <Text style={[styles.metricLabel, { color: "rgb(0, 255, 0)" }]}>
                Entradas do mês
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: "rgb(0, 255, 0)" }]}>
              {formatCurrency(metrics.currentMonthEntradas || 0)}
            </Text>
            <Text
              style={[
                styles.metricTrend,
                {
                  color:
                    typeof metrics.entradaTrend === "number" &&
                    metrics.entradaTrend >= 0
                      ? "rgb(0, 255, 0)"
                      : "rgb(255, 0, 0)",
                },
              ]}
            >
              {typeof metrics.entradaTrend === "number" ? (
                <>
                  {metrics.entradaTrend >= 0 ? (
                    <FontAwesome6 name="arrow-up" size={16} color="rgb(0, 255, 0)" />
                  ) : (
                    <FontAwesome6 name="arrow-down" size={16} color="rgb(255, 0, 0)" />
                  )}
                  <Text
                    style={{
                      color: metrics.entradaTrend >= 0 ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)",
                      marginLeft: 4,
                    }}
                  >
                    {Math.abs(metrics.entradaTrend).toFixed(1)}% vs mês anterior
                  </Text>
                </>
              ) : (
                <Text>Sem dados do mês anterior</Text>
              )}
            </Text>
          </View>

          {/* Saídas */}
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <FontAwesome6 name="arrow-trend-down" size={20} color="rgb(255, 0, 0)" />
              <Text style={[styles.metricLabel, { color: "rgb(255, 0, 0)" }]}>
                Saídas do mês
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: "rgb(255, 0, 0)" }]}>
              {formatCurrency(metrics.currentMonthSaidas || 0)}
            </Text>
            <Text
              style={[
                styles.metricTrend,
                {
                  color:
                    typeof metrics.saidaTrend === "number" &&
                    metrics.saidaTrend <= 0
                      ? "rgb(0, 255, 0)"
                      : "rgb(255, 0, 0)",
                },
              ]}
            >
              {typeof metrics.saidaTrend === "number" ? (
                <>
                  {metrics.saidaTrend <= 0 ? (
                    <FontAwesome6 name="arrow-down" size={16} color="rgb(255, 0, 0)" />
                  ) : (
                    <FontAwesome6 name="arrow-up" size={16} color="rgb(0, 255, 0)" />
                  )}
                  <Text
                    style={{
                      color: metrics.saidaTrend <= 0 ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)",
                      marginLeft: 4,
                    }}
                  >
                    {Math.abs(metrics.saidaTrend).toFixed(1)}% vs mês anterior
                  </Text>
                </>
              ) : (
                <Text>Sem dados do mês anterior</Text>
              )}
            </Text>
          </View>

          {/* Método mais usado */}
          {metrics.mostUsedPayment && metrics.mostUsedPayment !== "N/A" ? (
            <View style={styles.metric}>
              <View style={styles.metricHeader}>
                <FontAwesome6
                  name="credit-card"
                  size={18}
                  color={theme.foreground}
                />
                <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                  Método mais usado
                </Text>
              </View>
              <Text style={[styles.metricValue, { color: theme.foreground }]}>
                {metrics.mostUsedPayment}
              </Text>
            </View>
          ) : null}

          {/* Total de transações */}
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <MaterialIcons
                name="library-books"
                size={20}
                color={theme.foreground}
              />
              <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                Total de transações
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.foreground }]}>
              {metrics.totalTransactions ?? 0}
            </Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 16 },
  metric: { marginBottom: 16 },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  metricLabel: { fontSize: 14, fontWeight: "500" },
  metricValue: { fontSize: 22, fontWeight: "bold" },
  metricTrend: { fontSize: 12 },
});