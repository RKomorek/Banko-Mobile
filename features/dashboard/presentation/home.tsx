import { useDashboard } from '@/features/dashboard/presentation/use-dashboard';
import { Colors } from '@/shared/constants/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { HelloWave } from '@/shared/ui/hello-wave';
import { LogoBanko } from '@/shared/ui/logo-banko';
import { lazy, Suspense } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const FinancialMetrics = lazy(() => import('@/features/auth/domain/financial-metrics').then(module => ({ default: module.FinancialMetrics })));

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, balance, chartData, loading, error } = useDashboard();
  const insets = useSafeAreaInsets();

  const cardPadding = 16 * 2; // horizontal padding inside the card
  const screenWidth = Dimensions.get('window').width - 14;
  const chartWidth = screenWidth - cardPadding; // narrower to trim the right while giving space to the left

  const formatCurrency = (value: string | number) => {
    const numValue = Number(value);
    const formattedValue = Math.abs(numValue).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    if (numValue < 0) {
      return `- R$ ${formattedValue}`;
    }
    return `R$ ${formattedValue}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background, paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: theme.destructive }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
        <ScrollView 
          contentContainerStyle={{ paddingBottom: 100 }}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >

            <View style={styles.logoBox}>
              <LogoBanko variant="full" size={140} />
            </View>
        <View style={styles.container}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <CardHeader>
              <CardTitle style={[styles.greetingTitle, { color: theme.foreground }]}>
                Olá, {user?.name || 'Usuário'}! <HelloWave />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={[styles.greetingText, { color: theme.foreground }]}>
                É ótimo contar com sua presença!
              </Text>
              <Text style={[styles.greetingText, { color: theme.foreground }]}>
                Descubra as oportunidades para você hoje.
              </Text>
            </CardContent>
          </Card>
        </View>


        <View style={styles.container}>
          <Card
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <CardHeader>
              <CardTitle style={[styles.cardTitle, { color: theme.foreground }]}>
                Saldo atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text
                style={[
                  styles.balanceValue,
                  {
                    color: balance >= 0 ? 'rgb(0, 255, 0)' : 'rgb(255, 0, 0)',
                  },
                ]}
              >
                {formatCurrency(balance)}
              </Text>
              <Text style={[styles.balanceDescription, { color: theme.foreground }]}>
                Saldo disponível em sua conta
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Chart */}
        <View style={styles.container}>
          <Card
            style={[
              styles.card,
              styles.chartCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <CardHeader style={styles.chartCardHeader}>
              <CardTitle style={[styles.cardTitle, { color: theme.foreground }]}>
                Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent style={styles.chartContent}>
              <LineChart
                data={{
                  labels:
                    chartData.labels.length > 0 ? chartData.labels : ['Sem dados'],
                  datasets: [
                    {
                      data:
                        chartData.entradas.length > 0
                          ? chartData.entradas
                          : [0],
                      color: (opacity = 1) =>
                        `rgba(0, 255, 0, ${opacity})`,
                      strokeWidth: 2,
                    },
                    {
                      data:
                        chartData.saidas.length > 0
                          ? chartData.saidas
                          : [0],
                      color: (opacity = 1) =>
                        `rgba(255, 0, 0, ${opacity})`,
                      strokeWidth: 2,
                    },
                  ],
                }}
                width={chartWidth}
                height={220}
                yAxisLabel="R$ "
                yLabelsOffset={6}
                formatYLabel={(value) =>
                  Number(value)
                    .toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2, 
                    })
                }
                chartConfig={{
                  backgroundGradientFrom: 'transparent',
                  backgroundGradientTo: 'transparent',
                  backgroundGradientFromOpacity: 0,
                  backgroundGradientToOpacity: 0,
                  paddingRight: 15,
                  color: (opacity = 1) =>
                    colorScheme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    colorScheme === 'dark'
                      ? `rgba(255, 255, 255, ${opacity})`
                      : `rgba(0, 0, 0, ${opacity})`,
                  propsForHorizontalLabels: {
                    fontSize: 10,
                  },
                  propsForVerticalLabels: {
                    fontSize: 10,
                  },
                }}
                bezier
                style={styles.chart}
              />
            </CardContent>
          </Card>
        </View>

        <View style={styles.container}>
          <Suspense
            fallback={
              <View style={{ padding: 16, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.primary} />
              </View>
            }
          >
            <FinancialMetrics />
          </Suspense>
        </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: 52,
  },
  screenContainer: {
    flex: 1,
    padding: 10,
  },
  container: {
    paddingVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  card: {},
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingTitle: {
    fontSize: 28,
  },
  greetingText: {},
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'right',
  },
  balanceDescription: {
    fontSize: 12,
    textAlign: 'right',
  },
  chartCard: {
    paddingHorizontal: 8,
  },
  chartCardHeader: {
    marginLeft: -8,
  },
  chartContent: {
    paddingHorizontal: 10,
  },
  chart: {
    borderRadius: 12,
  },
  logoBox: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",

  },
});
