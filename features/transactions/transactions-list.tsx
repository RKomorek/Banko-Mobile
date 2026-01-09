import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/shared/constants/theme';
import type { Transaction } from '@/shared/hooks/use-transactions';

import { TransactionCard } from './transaction-card';

type Props = {
  transactions: (Transaction & { onPress?: () => void })[];
  theme: typeof Colors.light;
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
};

export function TransactionsList({
  transactions,
  theme,
  loading,
  refreshing,
  loadingMore,
  onRefresh,
  onLoadMore,
}: Props) {
  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const { onPress, ...transaction } = item;
        if (onPress) {
          return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
              <TransactionCard transaction={transaction} theme={theme} currencyFormatter={currencyFormatter} />
            </TouchableOpacity>
          );
        }
        return (
          <TransactionCard transaction={transaction} theme={theme} currencyFormatter={currencyFormatter} />
        );
      }}
      contentContainerStyle={
        transactions.length === 0 ? [styles.listContent, styles.emptyList] : styles.listContent
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator color={theme.primary} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Nenhuma transação</Text>
            <Text style={[styles.emptySubtitle, { color: theme.mutedForeground }]}>
              Use o filtro para ajustar sua busca ou cadastre novas transações.
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
    gap: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
