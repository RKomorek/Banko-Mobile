export interface User {
  name?: string;
  surname?: string;
  email?: string;
}

export interface Account {
  saldo: string | number;
}

export interface Transaction {
  id: string;
  amount: number;
  isNegative: boolean;
  date: Date;
}

export interface ChartData {
  labels: string[];
  entradas: number[];
  saidas: number[];
}

export interface DashboardData {
  user: User;
  balance: string;
  chartData: ChartData;
  loading: boolean;
  error?: string | null;
}
