import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Toast from 'react-native-toast-message';

import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { TransactionsList } from '@/components/transactions/transactions-list';
import { Colors } from '@/constants/theme';
import { auth } from '@/firebase';
import {
  type TransactionFilters,
  type TransactionType,
  useTransactions,
} from '@/hooks/use-transactions';

const typeOptions: { label: string; value: TransactionType | 'all' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Cartão', value: 'cartao' },
  { label: 'Boleto', value: 'boleto' },
  { label: 'Pix', value: 'pix' },
];

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

export function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const userId = auth.currentUser?.uid ?? null;
  const useMockData =
    process.env.EXPO_PUBLIC_USE_TRANSACTION_MOCKS === 'true' || !userId;

  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null,
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const filters = useMemo<TransactionFilters>(
    () => ({
      type: typeFilter,
      startDate: dateRange.start,
      endDate: dateRange.end,
    }),
    [typeFilter, dateRange.end, dateRange.start]
  );

  const { transactions, loading, loadingMore, refreshing, loadMore, refresh, error, clearError } =
    useTransactions({ userId, filters, useMockData });

  useEffect(() => {
    if (!error) return;

    const titles = {
      initial: 'Erro ao carregar transações',
      loadMore: 'Erro ao carregar mais transações',
      refresh: 'Erro ao atualizar',
    } as const;

    Toast.show({
      type: 'error',
      text1: titles[error.source],
      text2: error.message,
    });

    clearError();
  }, [clearError, error]);

  const handleTypeFilterChange = (value: TransactionType | 'all') => {
    setTypeFilter(value);
  };

  const handleStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (!selectedDate) return;

    const iso = toISODate(selectedDate);
    setDateRange((prev) => ({
      start: iso,
      end: prev.end && prev.end < iso ? iso : prev.end,
    }));
  };

  const handleEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (!selectedDate) return;

    const iso = toISODate(selectedDate);
    setDateRange((prev) => ({
      start: prev.start && prev.start > iso ? iso : prev.start,
      end: iso,
    }));
  };

  const openStartPicker = () => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      const fallback = dateRange.start ?? toISODate(new Date());
      const input = window.prompt('Selecione a data inicial (AAAA-MM-DD)', fallback);
      if (!input) return;
      const parsed = new Date(input);
      if (Number.isNaN(parsed.valueOf())) {
        Toast.show({
          type: 'error',
          text1: 'Data inválida',
          text2: 'Use o formato AAAA-MM-DD.',
        });
        return;
      }
      const iso = toISODate(parsed);
      setDateRange((prev) => ({
        start: iso,
        end: prev.end && prev.end < iso ? iso : prev.end,
      }));
      return;
    }

    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') return;
      const fallback = dateRange.end ?? toISODate(new Date());
      const input = window.prompt('Selecione a data final (AAAA-MM-DD)', fallback);
      if (!input) return;
      const parsed = new Date(input);
      if (Number.isNaN(parsed.valueOf())) {
        Toast.show({
          type: 'error',
          text1: 'Data inválida',
          text2: 'Use o formato AAAA-MM-DD.',
        });
        return;
      }
      const iso = toISODate(parsed);
      setDateRange((prev) => ({
        start: prev.start && prev.start > iso ? iso : prev.start,
        end: iso,
      }));
      return;
    }

    setShowEndPicker(true);
  };

  const clearDates = () => {
    setDateRange({ start: null, end: null });
  };

  const hasActiveFilters = typeFilter !== 'all' || dateRange.start || dateRange.end;

  return (
    <SafeAreaWrapper backgroundColor={theme.background}>
      <View style={styles.container}>
        <View style={styles.filtersArea}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Filtros</Text>
          <View style={styles.filterRow}>
            {typeOptions.map((option) => {
              const isActive = option.value === typeFilter;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? theme.primary : theme.card,
                      borderColor: isActive ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => handleTypeFilterChange(option.value)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? theme.primaryForeground : theme.foreground },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={openStartPicker}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, { color: theme.mutedForeground }]}>De</Text>
              <Text style={[styles.dateValue, { color: theme.foreground }]}>
                {dateRange.start ? formatDisplayDate(dateRange.start) : 'Data inicial'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={openEndPicker}
              activeOpacity={0.8}
            >
              <Text style={[styles.dateLabel, { color: theme.mutedForeground }]}>Até</Text>
              <Text style={[styles.dateValue, { color: theme.foreground }]}>
                {dateRange.end ? formatDisplayDate(dateRange.end) : 'Data final'}
              </Text>
            </TouchableOpacity>

            {dateRange.start || dateRange.end ? (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: theme.primary }]}
                onPress={clearDates}
                activeOpacity={0.8}
              >
                <Text style={[styles.clearButtonText, { color: theme.primary }]}>Limpar</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {hasActiveFilters ? (
            <Text style={[styles.activeFiltersInfo, { color: theme.mutedForeground }]}>Exibindo resultados filtrados</Text>
          ) : null}
        </View>

        <TransactionsList
          transactions={transactions}
          theme={theme}
          loading={loading}
          refreshing={refreshing}
          loadingMore={loadingMore}
          onRefresh={refresh}
          onLoadMore={loadMore}
        />
      </View>

      {Platform.OS !== 'web' && showStartPicker ? (
        <DateTimePicker
          value={dateRange.start ? new Date(dateRange.start) : new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      ) : null}

      {Platform.OS !== 'web' && showEndPicker ? (
        <DateTimePicker
          value={dateRange.end ? new Date(dateRange.end) : new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      ) : null}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filtersArea: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeFiltersInfo: {
    marginTop: 12,
    fontSize: 13,
  },
});
