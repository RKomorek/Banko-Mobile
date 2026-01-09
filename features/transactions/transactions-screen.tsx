import { useTransactions, type TransactionFilters } from "@/shared/hooks/use-transactions";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../app/(tabs)/_layout";
import { auth } from "../../firebase";
import { Colors, Fonts } from "../../shared/constants/theme";
import { IconSymbol } from "../../shared/ui/icon-symbol";
import { TransactionsList } from "./transactions-list";

const typeOptions = [
  { label: "Todos", value: "all" },
  { label: "Cartão", value: "cartao" },
  { label: "Boleto", value: "boleto" },
  { label: "Pix", value: "pix" },
] as const;

const entryExitOptions = [
  { label: "Todas", value: "all" },
  { label: "Entradas", value: "entrada" },
  { label: "Saídas", value: "saida" },
] as const;

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const fontFamily = Fonts.sans;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [typeFilter, setTypeFilter] = useState<"all" | "cartao" | "boleto" | "pix">("all");
  const [entryExitFilter, setEntryExitFilter] = useState<"all" | "entrada" | "saida">("all");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const user = auth.currentUser;

  const filters: TransactionFilters = useMemo(
    () => ({
      type: typeFilter,
      startDate: dateRange.start,
      endDate: dateRange.end,
      entryExit: entryExitFilter,
    }),
    [typeFilter, dateRange.start, dateRange.end, entryExitFilter]
  );

  const {
    transactions,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
    error,
    clearError,
  } = useTransactions({
    userId: user?.uid ?? null,
    filters,
  });

  const handleTransactionPress = (transaction: any) => {
    navigation.navigate("transaction-form", { initialValues: transaction });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerFixed}>
          <Text style={[styles.title, { color: theme.foreground, fontFamily }]}>Transações</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 8 }}>
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
                    onPress={() => setTypeFilter(option.value as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: typeFilter === option.value ? theme.primaryForeground : theme.foreground }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
                    onPress={() => setEntryExitFilter(option.value as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: entryExitFilter === option.value ? theme.primaryForeground : theme.foreground }}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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

        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.destructive }]}>{error.message}</Text>
            <TouchableOpacity onPress={clearError}>
              <Text style={{ color: theme.primary }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ flex: 1 }}>
          <TransactionsList
            transactions={transactions.map(t => ({
              ...t,
              onPress: () => handleTransactionPress({
                id: t.id,
                title: t.title,
                amount: t.amount,
                type: t.type,
                date: t.date instanceof Date ? t.date : new Date(t.date),
                isNegative: t.isNegative,
                receiptUrl: t.receiptUrl,
              }),
            }))}
            theme={theme}
            loading={loading}
            refreshing={refreshing}
            loadingMore={loadingMore}
            onRefresh={refresh}
            onLoadMore={hasMore ? loadMore : () => {}}
          />
        </View>
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
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
});
