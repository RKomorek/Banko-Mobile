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
      if (!db) {
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

  const formatCurrency = (value: any) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`;

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
          {/* Container com linha vertical contínua */}
          <View style={styles.gridContainer}>
            {/* Linha vertical que atravessa tudo */}
            <View style={styles.verticalDividerFull} />
            
            {/* Entradas e Saídas lado a lado */}
            <View style={styles.metricsRow}>
              {/* Entradas */}
              <View style={styles.metricColumn}>
                <View style={styles.metricHeader}>
                  <FontAwesome6 name="arrow-trend-up" size={20} color="rgb(0, 255, 0)" />
                  <Text style={[styles.metricLabel, { color: "rgb(0, 255, 0)" }]}>
                    Entradas do mês
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: "rgb(0, 255, 0)" }]}>
                  {formatCurrency(metrics.currentMonthEntradas || 0)}
                </Text>
                {typeof metrics.entradaTrend === "number" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 8 }}>
                    {metrics.entradaTrend > 0 ? (
                      <FontAwesome6 name="arrow-up" size={16} color="rgb(0, 255, 0)" />
                    ) : metrics.entradaTrend < 0 ? (
                      <FontAwesome6 name="arrow-down" size={16} color="rgb(255, 0, 0)" />
                    ) : (
                      <FontAwesome6 name="minus" size={16} color="rgb(0, 255, 0)" />
                    )}
                    <Text
                      style={[
                        styles.metricTrend,
                        {
                          color: metrics.entradaTrend >= 0 ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)",
                          textAlign: "left",
                        },
                      ]}
                    >
                      {Math.abs(metrics.entradaTrend).toFixed(1).replace('.0', '').replace('.', ',')}% comparado ao{"\n"}mês anterior
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.metricTrend}>Sem dados do mês anterior</Text>
                )}
              </View>

              <View style={{ width: 1 }} />

              {/* Saídas */}
              <View style={styles.metricColumn}>
                <View style={styles.metricHeader}>
                  <FontAwesome6 name="arrow-trend-down" size={20} color="rgb(255, 0, 0)" />
                  <Text style={[styles.metricLabel, { color: "rgb(255, 0, 0)" }]}>
                    Saídas do mês
                  </Text>
                </View>
                <Text style={[styles.metricValue, { color: "rgb(255, 0, 0)" }]}>
                  {formatCurrency(metrics.currentMonthSaidas || 0)}
                </Text>
                {typeof metrics.saidaTrend === "number" ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center", marginTop: 8 }}>
                    {metrics.saidaTrend > 0 ? (
                      <FontAwesome6 name="arrow-up" size={16} color="rgb(255, 0, 0)" />
                    ) : metrics.saidaTrend < 0 ? (
                      <FontAwesome6 name="arrow-down" size={16} color="rgb(0, 255, 0)" />
                    ) : (
                      <FontAwesome6 name="minus" size={16} color="rgb(0, 255, 0)" />
                    )}
                    <Text
                      style={[
                        styles.metricTrend,
                        {
                          color: metrics.saidaTrend > 0 ? "rgb(255, 0, 0)" : "rgb(0, 255, 0)",
                          textAlign: "left",
                        },
                      ]}
                    >
                      {Math.abs(metrics.saidaTrend).toFixed(1).replace('.0', '').replace('.', ',')}% comparado ao{"\n"}mês anterior
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.metricTrend}>Sem dados do mês anterior</Text>
                )}
              </View>
            </View>

            {/* Linha horizontal separadora */}
            <View style={styles.horizontalDivider} />

            {/* Método mais usado e Total de transações lado a lado */}
            <View style={styles.metricsRow}>
              {/* Método mais usado */}
              <View style={styles.metricColumn}>
                <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                  Método mais usado
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <Text style={[styles.metricValue, { color: theme.foreground }]}>
                    {metrics.mostUsedPayment || "N/A"}
                  </Text>
                  {metrics.mostUsedPayment === "Pix" && (
                    <FontAwesome6 name="pix" size={22} color={theme.foreground} />
                  )}
                  {metrics.mostUsedPayment === "Cartão" && (
                    <FontAwesome6 name="credit-card" size={22} color={theme.foreground} />
                  )}
                  {metrics.mostUsedPayment === "Boleto" && (
                    <FontAwesome6 name="barcode" size={22} color={theme.foreground} />
                  )}
                </View>
              </View>

              <View style={{ width: 1 }} />

              {/* Total de transações */}
              <View style={styles.metricColumn}>
                <Text style={[styles.metricLabel, { color: theme.foreground }]}>
                  Total de transações
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center" }}>
                  <Text style={[styles.metricValue, { color: theme.foreground }]}>
                    {metrics.totalTransactions ?? 0}
                  </Text>
                  <MaterialIcons
                    name="library-books"
                    size={22}
                    color={theme.foreground}
                  />
                </View>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "bold" },
  description: { fontSize: 14, marginBottom: 10 },
  gridContainer: {
    position: "relative",
  },
  verticalDividerFull: {
    position: "absolute",
    width: 1,
    backgroundColor: "#ccc",
    top: 0,
    bottom: 0,
    left: "50%",
    marginLeft: -0.5,
    zIndex: 1,
  },
  metricsRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "stretch",
  },
  metricColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    backgroundColor: "#ccc",
    marginHorizontal: 12,
    alignSelf: "stretch",
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 12,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 10,
    justifyContent: "center",
  },
  metricLabel: { fontSize: 14, fontWeight: "500", textAlign: "center" },
  metricValue: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  metricTrend: { fontSize: 12, textAlign: "center" },
});