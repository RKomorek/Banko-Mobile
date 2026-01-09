import { useTransactionsStore } from "@/shared/stores/transactions-store";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { RootStackParamList } from "../../app/(tabs)/_layout";
import { Colors, Fonts } from "../../shared/constants/theme";
import { IconSymbol } from "../../shared/ui/icon-symbol";
import { useTransactions } from "./presentation/hooks/use-transactions";

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

  const { transactions, loading, loadingMore, loadMore } = useTransactions();
  const { 
    typeFilter, 
    entryExitFilter, 
    dateRange,
    setTypeFilter,
    setEntryExitFilter,
    setDateRange
  } = useTransactionsStore();

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();


  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerFixed}>
          <Text style={[styles.title, { color: theme.foreground, fontFamily }]}>Transações</Text>
          <View style={styles.filterHeaderRow}>
              <Text style={[styles.filterTitle, { color: showFilters ? theme.primary : theme.mutedForeground }]}>Filtros</Text>
            <TouchableOpacity
              onPress={() => setShowFilters(prev => !prev)}
              style={styles.filterToggleButton}
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
          <View style={styles.filtersRow}>
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
                <Text style={[styles.filterText, { color: typeFilter === option.value ? theme.primaryForeground : theme.foreground }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Filtros de entrada/saída */}
          <View style={styles.filtersRow}>
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
                <Text style={[styles.filterText, { color: entryExitFilter === option.value ? theme.primaryForeground : theme.foreground }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Filtros de data com DatePicker */}
          <View style={styles.dateButtonsRow}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateLabel}>De</Text>
              <Text style={[styles.dateValue, { color: theme.foreground }]}>
                {dateRange.start ? new Date(dateRange.start).toLocaleDateString("pt-BR") : "Data inicial"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateLabel}>Até</Text>
              <Text style={[styles.dateValue, { color: theme.foreground }]}>
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
                setDateRange({ ...dateRange, start: selectedDate.toISOString().slice(0, 10) });
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
                setDateRange({ ...dateRange, end: selectedDate.toISOString().slice(0, 10) });
              }
            }}
          />
        )}
        {/* Lista */}
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.itemRow,
                { backgroundColor: theme.card, borderColor: theme.input }
              ]}
              onPress={() => navigation.navigate("transaction-form", { initialValues: item })}
            >
              {/* Linha 1: Descrição | Tipo */}
              <View style={styles.rowTop}>
                <Text 
                  style={[styles.itemTitle, { color: theme.foreground }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <Text style={{
                  color: item.amount && item.isNegative ? theme.destructive : theme.constructive,
                  fontSize: 15,
                  fontWeight: "600",
                  marginLeft: 8
                }}>
                  {item.type === "pix" ? "Pix" : item.type === "cartao" ? "Cartão" : "Boleto"}
                </Text>
              </View>
              {/* Linha 2: Data | Valor */}
              <View style={styles.rowBottom}>
                <Text style={[styles.itemDate, { color: theme.mutedForeground }]}>
                  {item.date
                    ? new Date(
                        item.date.seconds
                          ? item.date.seconds * 1000
                          : item.date
                      ).toLocaleDateString("pt-BR")
                    : ""}
                </Text>
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
                    ? Math.abs(item.amount)?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                    : "-"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.mutedForeground }]}>Nenhuma transação encontrada.</Text>}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: "center" }}>
                <ActivityIndicator color={theme.primary} />
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingTop: 52 },
  container: { flex: 1, padding: 10 },
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  filtersRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  filterHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  filterToggleButton: {
    marginTop: -10,
    marginRight: 5,
  },
  dateButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 6,
    marginBottom: 8,
  },
  dateLabel: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
  dateValue: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
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
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemTitle: { fontSize: 16, fontWeight: "500", flex: 1 },
  itemAmount: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  itemDate: { fontSize: 16, fontWeight: "500" },
  empty: { textAlign: "center", marginTop: 32 },
});