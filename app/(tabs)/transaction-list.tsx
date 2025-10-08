import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Fonts } from "../../constants/theme"; // Importa o tema
import { auth, db } from "../../firebase";
import { RootStackParamList } from "./_layout";

export default function TransactionsListScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const fontFamily = Fonts.sans;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;
        const q = query(
          collection(db, "transactions"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(list);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.foreground, fontFamily }]}>Transações</Text>
        <FlatList
          data={transactions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.itemRow,
                { backgroundColor: theme.card, borderColor: theme.input }
              ]}
              onPress={() => navigation.navigate("transaction-form", { initialValues: item })}
            >
              {/* Data */}
              <View style={styles.cell}>
                <Text style={[styles.itemDate, { color: theme.foreground }]}>
                  {item.date
                    ? new Date(
                        item.date.seconds
                          ? item.date.seconds * 1000
                          : item.date
                      ).toLocaleDateString("pt-BR")
                    : ""}
                </Text>
              </View>
              {/* Descrição */}
              <View style={styles.cell}>
                <Text style={[styles.itemTitle, { color: theme.foreground }]}>{item.title}</Text>
              </View>
              {/* Tipo */}
              <View style={styles.cell}>
                <Text style={{ color: theme.foreground }}>
                  {item.type === "pix" ? "Pix" : item.type === "cartao" ? "Cartão" : "Boleto"}
                </Text>
              </View>
              {/* Valor */}
              <View style={styles.cell}>
                <Text style={[
                  styles.itemAmount,
                  {
                    color:
                      item.amount && item.isNegative
                        ? theme.destructive
                        : theme.constructive
                  }
                ]}>
                  {item.amount
                    ? (item.isNegative ? "- " : "+ ") +
                      Math.abs(item.amount)?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "-"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.mutedForeground }]}>Nenhuma transação encontrada.</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 18 },
  newButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  newButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  cell: {
    minWidth: 70,
    marginRight: 12,
    justifyContent: "center",
  },
  itemTitle: { fontSize: 16},
  itemAmount: { fontSize: 16, marginTop: 2 },
  itemDate: { fontSize: 14 },
  empty: { textAlign: "center", marginTop: 32 },
});