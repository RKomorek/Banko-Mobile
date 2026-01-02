import { FinancialMetrics } from '@/features/auth/domain/financial-metrics';
import { useDashboard } from '@/features/dashboard/presentation/use-dashboard';
import { Colors } from '@/shared/constants/theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { HelloWave } from '@/shared/ui/hello-wave';
import SafeAreaWrapper from '@/shared/ui/safe-area-wrapper';
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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { user, balance, chartData, loading, error } = useDashboard();

  const screenWidth = Dimensions.get('window').width - 28;

  const formatCurrency = (value: string | number) =>
    `R$ ${Number(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <SafeAreaWrapper backgroundColor={theme.background}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error) {
    return (
      <SafeAreaWrapper backgroundColor={theme.background}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
          <Text style={{ color: theme.destructive, fontSize: 16, textAlign: 'center' }}>
            {error}
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper backgroundColor={theme.background}>
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        {/* Greeting Card */}
        <View style={styles.container}>
          <Card
            style={{
              backgroundColor: theme.card,
              borderColor: theme.border,
              marginBottom: -15,
            }}
          >
            <CardHeader>
              <CardTitle style={{ color: theme.foreground, fontSize: 28 }}>
                Olá, {user?.name || 'Usuário'}! <HelloWave />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text style={{ color: theme.foreground }}>
                É ótimo contar com sua presença!
              </Text>
              <Text style={{ color: theme.foreground }}>
                Explore as oportunidades disponíveis hoje.
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Balance Card */}
        <View style={styles.container}>
          <Card style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <CardHeader>
              <CardTitle style={{ color: theme.foreground }}>
                Saldo atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text
                style={{
                  color: theme.foreground,
                  fontSize: 24,
                  fontWeight: '700',
                }}
              >
                {formatCurrency(balance)}
              </Text>
              <Text style={{ color: theme.foreground, fontSize: 12 }}>
                Saldo disponível em sua conta
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Chart */}
        <Card
          style={{
            alignSelf: 'center',
            backgroundColor: theme.background,
            borderColor: theme.border,
          }}
        >
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
            width={screenWidth}
            height={220}
            yAxisLabel="R$"
            chartConfig={{
              backgroundGradientFrom: theme.background,
              backgroundGradientTo: theme.background,
              color: (opacity = 1) =>
                `${
                  colorScheme === 'dark'
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(000, 000, 000, ${opacity})`
                }`,
              labelColor: (opacity = 1) =>
                `${
                  colorScheme === 'dark'
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(000, 000, 000, ${opacity})`
                }`,
            }}
            bezier
            style={{
              borderRadius: 12,
            }}
          />
        </Card>

        {/* Financial Metrics */}
        <View style={styles.container}>
          <FinancialMetrics />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flex: 1,
  },
});
