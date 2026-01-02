import type { Transaction, TransactionFilters } from '@/shared/hooks/use-transactions';

const BASE_TRANSACTIONS: Array<Omit<Transaction, 'id' | 'date'> & { id: string; date: string }> = [
  { id: 'mock-1', title: 'Salário', amount: 5200.45, type: 'pix', date: '2024-09-01' },
  { id: 'mock-2', title: 'Aluguel', amount: -1800, type: 'boleto', date: '2024-09-03' },
  { id: 'mock-3', title: 'Supermercado', amount: -420.78, type: 'cartao', date: '2024-09-05' },
  { id: 'mock-4', title: 'Freelance', amount: 950, type: 'pix', date: '2024-09-06' },
  { id: 'mock-5', title: 'Conta de Luz', amount: -240.5, type: 'boleto', date: '2024-09-07' },
  { id: 'mock-6', title: 'Netflix', amount: -55.9, type: 'cartao', date: '2024-09-08' },
  { id: 'mock-7', title: 'Reembolso Uber', amount: 87.34, type: 'pix', date: '2024-09-10' },
  { id: 'mock-8', title: 'Consulta Médica', amount: -200, type: 'boleto', date: '2024-09-11' },
  { id: 'mock-9', title: 'Restaurante', amount: -135.88, type: 'cartao', date: '2024-09-12' },
  { id: 'mock-10', title: 'Venda OLX', amount: 320, type: 'pix', date: '2024-09-13' },
  { id: 'mock-11', title: 'Academia', amount: -129.9, type: 'cartao', date: '2024-09-14' },
  { id: 'mock-12', title: 'Internet', amount: -110, type: 'boleto', date: '2024-09-14' },
  { id: 'mock-13', title: 'Transferência Família', amount: 300, type: 'pix', date: '2024-09-15' },
  { id: 'mock-14', title: 'Padaria', amount: -45.5, type: 'cartao', date: '2024-09-15' },
  { id: 'mock-15', title: 'Seguro do Carro', amount: -780, type: 'boleto', date: '2024-09-16' },
  { id: 'mock-16', title: 'Investimento', amount: -500, type: 'pix', date: '2024-09-18' },
  { id: 'mock-17', title: 'Cashback Cartão', amount: 65.2, type: 'cartao', date: '2024-09-19' },
  { id: 'mock-18', title: 'Farmácia', amount: -88.4, type: 'cartao', date: '2024-09-20' },
  { id: 'mock-19', title: 'Pagamento Cliente', amount: 2100, type: 'pix', date: '2024-09-21' },
  { id: 'mock-20', title: 'Conta de Água', amount: -89.7, type: 'boleto', date: '2024-09-22' },
  { id: 'mock-21', title: 'Cinema', amount: -64, type: 'cartao', date: '2024-09-22' },
  { id: 'mock-22', title: 'Transferência Parceiro', amount: 450, type: 'pix', date: '2024-09-24' },
  { id: 'mock-23', title: 'Oficina Mecânica', amount: -610.25, type: 'boleto', date: '2024-09-25' },
  { id: 'mock-24', title: 'Delivery', amount: -72.8, type: 'cartao', date: '2024-09-26' },
  { id: 'mock-25', title: 'Curso Online', amount: -299, type: 'cartao', date: '2024-09-27' },
  { id: 'mock-26', title: 'Dividendos', amount: 180.75, type: 'pix', date: '2024-09-28' },
  { id: 'mock-27', title: 'Mensalidade Escola', amount: -950, type: 'boleto', date: '2024-09-29' },
  { id: 'mock-28', title: 'Almoço Empresarial', amount: -210.35, type: 'cartao', date: '2024-09-29' },
  { id: 'mock-29', title: 'Taxa Bancária', amount: -19.9, type: 'pix', date: '2024-09-30' },
  { id: 'mock-30', title: 'Bonus Projeto', amount: 1200, type: 'pix', date: '2024-10-01' },
];

export const mockTransactions: Transaction[] = BASE_TRANSACTIONS.map((transaction) => ({
  ...transaction,
  date: new Date(transaction.date),
}));

export function filterMockTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) {
      return false;
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
      if (transaction.date < start) {
        return false;
      }
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      if (transaction.date > end) {
        return false;
      }
    }

    return true;
  });
}

export function orderMockTransactions(transactions: Transaction[]) {
  return [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function applyMockPagination(
  transactions: Transaction[],
  offset: number,
  limit: number
) {
  return transactions.slice(offset, offset + limit);
}
