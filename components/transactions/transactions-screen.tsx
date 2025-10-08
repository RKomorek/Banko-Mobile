import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../app/(tabs)/_layout";
import { Colors, Fonts } from "../../constants/theme";
import { auth, db } from "../../firebase";
import { IconSymbol } from "../ui/icon-symbol";

const typeOptions = [
  { label: "Todos", value: "all" },
  { label: "Cartão", value: "cartao" },
  { label: "Boleto", value: "boleto" },
  { label: "Pix", value: "pix" },
];

const entryExitOptions = [
  { label: "Todas", value: "all" },
  { label: "Entradas", value: "entrada" },
  { label: "Saídas", value: "saida" },
];

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const fontFamily = Fonts.sans;

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [entryExitFilter, setEntryExitFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        let constraints = [
          where("userId", "==", user.uid),
          orderBy("date", "desc"),
        ];

        if (typeFilter !== "all") {
          constraints.push(where("type", "==", typeFilter));
        }
        if (entryExitFilter === "entrada") {
          constraints.push(where("isNegative", "==", false));
        }
        if (entryExitFilter === "saida") {
          constraints.push(where("isNegative", "==", true));
        }
        if (dateRange.start) {
          constraints.push(where("date", ">=", Timestamp.fromDate(new Date(dateRange.start))));
        }
        if (dateRange.end) {
          const endDate = new Date(dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          constraints.push(where("date", "<=", Timestamp.fromDate(endDate)));
        }

        const q = query(collection(db, "transactions"), ...constraints);
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTransactions(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [typeFilter, entryExitFilter, dateRange.start, dateRange.end]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerFixed}>
          <Text style={[styles.title, { color: theme.foreground, fontFamily }]}>Transações</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical:8 }}>

              <Text style={[styles.filterTitle, { color: theme.foreground }]}>Filtros</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(prev => !prev)}
              style={{ marginTop: -10, marginRight: 5 }}
            >
              <IconSymbol
                name="filter"
                size={25}
                color={showFilters ? theme.primary : theme.mutedForeground}
              />
            </TouchableOpacity>
          </View>
          {showFilters && (
          <>
          {/* Filtros de tipo */}
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {typeOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: typeFilter === option.value ? theme.primary : theme.card,
                    borderColor: typeFilter === option.value ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setTypeFilter(option.value)}
                activeOpacity={0.8}
              >
                <Text style={{ color: typeFilter === option.value ? theme.primaryForeground : theme.foreground }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Filtros de entrada/saída */}
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {entryExitOptions.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: entryExitFilter === option.value ? theme.primary : theme.card,
                    borderColor: entryExitFilter === option.value ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setEntryExitFilter(option.value)}
                activeOpacity={0.8}
              >
                <Text style={{ color: entryExitFilter === option.value ? theme.primaryForeground : theme.foreground }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Filtros de data com DatePicker */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={{ color: theme.mutedForeground }}>De</Text>
              <Text style={{ color: theme.foreground, marginLeft: 8 }}>
                {dateRange.start ? new Date(dateRange.start).toLocaleDateString("pt-BR") : "Data inicial"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={{ color: theme.mutedForeground }}>Até</Text>
              <Text style={{ color: theme.foreground, marginLeft: 8 }}>
                {dateRange.end ? new Date(dateRange.end).toLocaleDateString("pt-BR") : "Data final"}
              </Text>
            </TouchableOpacity>
            {(dateRange.start || dateRange.end) && (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: theme.primary }]}
                onPress={() => setDateRange({ start: null, end: null })}
              >
                <Text style={{ color: theme.primary }}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
        )}
        </View>
        {/* DatePickers */}
        {showStartPicker && (
          <DateTimePicker
            value={dateRange.start ? new Date(dateRange.start) : new Date()}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setDateRange(prev => ({ ...prev, start: selectedDate.toISOString().slice(0, 10) }));
              }
            }}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={dateRange.end ? new Date(dateRange.end) : new Date()}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setDateRange(prev => ({ ...prev, end: selectedDate.toISOString().slice(0, 10) }));
              }
            }}
          />
        )}
        {/* Lista */}
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
  headerFixed: {
    paddingBottom: 0,
    zIndex: 2,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 18 },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    alignSelf: "flex-end",
  },
  filterTitle: {
    fontSize: 18,
    marginTop: -5,
    marginBottom: 8,
    marginLeft: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
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
  itemAmount: { fontSize: 16, marginTop: 2, textAlign: "right", minWidth: 110 },
  itemDate: { fontSize: 14 },
  empty: { textAlign: "center", marginTop: 32 },
});