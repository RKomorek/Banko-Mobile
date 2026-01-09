import { memo, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring
} from 'react-native-reanimated';

import { Colors } from '@/shared/constants/theme';
import type { Transaction } from '@/shared/hooks/use-transactions';

type Props = {
  transaction: Transaction;
  theme: typeof Colors.light;
  currencyFormatter: Intl.NumberFormat;
  index?: number;
};

const typeLabels = {
  cartao: 'Cartão',
  boleto: 'Boleto',
  pix: 'Pix',
} as const;

function TransactionCardComponent({ transaction, theme, currencyFormatter, index = 0 }: Props) {
  const isNegative = transaction.amount < 0;
  const amountColor = isNegative ? theme.destructive : theme.constructive;

  // Animações de entrada
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  
  useEffect(() => {
    const delay = index * 50; // Stagger effect
    opacity.value = withDelay(delay, withSpring(1, { damping: 15 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, animatedStyle]}> 
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
    </Animated.View>
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
