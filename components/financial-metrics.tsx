import { Colors } from "@/constants/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from "react-native";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Dados mockados
const mockTransactions = [
  { data: "2025-10-01", movimentacao: "entrada", valor: 500, tipo: "Pix" },
  { data: "2025-10-03", movimentacao: "saida", valor: 200, tipo: "Cartão" },
  { data: "2025-10-05", movimentacao: "entrada", valor: 700, tipo: "Pix" },
  { data: "2025-09-15", movimentacao: "saida", valor: 100, tipo: "Dinheiro" },
  { data: "2025-09-20", movimentacao: "entrada", valor: 300, tipo: "Cartão" },
  { data: "2025-09-25", movimentacao: "saida", valor: 150, tipo: "Pix" },
];

export function FinancialMetrics() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula fetch
    setTimeout(() => {
      setTransactions(mockTransactions as typeof transactions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: any) => `R$ ${value.toFixed(2)}`;

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

    // Definindo tipos explícitos para evitar erros de tipagem
    type Transacao = {
      data: string;
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

    const mostUsedPayment =
      Object.entries(paymentMethods).sort(
        ([, a], [, b]) => (b as number) - (a as number)
      )[0]?.[0] || "N/A";

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
        <Text style={styles.title}>Métricas Financeiras</Text>
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
              Métricas Financeiras
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
                Entradas do Mês
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: "rgb(0, 255, 0)" }]}>
              {formatCurrency(metrics.currentMonthEntradas)}
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
                Saídas do Mês
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: "rgb(255, 0, 0)" }]}>
              {formatCurrency(metrics.currentMonthSaidas)}
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
              {typeof metrics.entradaTrend === "number" ? (
                <>
                  {metrics.entradaTrend <= 0 ? (
                    <FontAwesome6 name="arrow-down" size={16} color="rgb(255, 0, 0)" />
                  ) : (
                    <FontAwesome6 name="arrow-up" size={16} color="rgb(0, 255, 0)" />
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

          {/* Método mais usado */}
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <FontAwesome6
                name="credit-card"
                size={18}
                color={theme.foreground}
              />
              <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                Método Mais Usado
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.foreground }]}>
              {metrics.mostUsedPayment}
            </Text>
          </View>

          {/* Total de transações */}
          <View style={styles.metric}>
            <View style={styles.metricHeader}>
              <MaterialIcons
                name="library-books"
                size={20}
                color={theme.foreground}
              />
              <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                Total de Transações
              </Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.foreground }]}>
              {metrics.totalTransactions}
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
