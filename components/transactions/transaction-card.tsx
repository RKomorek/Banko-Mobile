import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Transaction } from '@/hooks/use-transactions';

type Props = {
  transaction: Transaction;
  theme: typeof Colors.light;
  currencyFormatter: Intl.NumberFormat;
};

const typeLabels = {
  cartao: 'Cartão',
  boleto: 'Boleto',
  pix: 'Pix',
} as const;

function TransactionCardComponent({ transaction, theme, currencyFormatter }: Props) {
  const isNegative = transaction.amount < 0;
  const amountColor = isNegative ? theme.destructive : theme.constructive;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
          {transaction.title || 'Transação sem título'}
        </Text>
        <Text style={[styles.amount, { color: amountColor }]}>
          {currencyFormatter.format(transaction.amount)}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.meta, { color: theme.mutedForeground }]}>{typeLabels[transaction.type]}</Text>
        <Text style={[styles.meta, { color: theme.mutedForeground }]}>
          {new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }).format(transaction.date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export const TransactionCard = memo(TransactionCardComponent);
