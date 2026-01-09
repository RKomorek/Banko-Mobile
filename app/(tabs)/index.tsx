import { Colors } from '@/shared/constants/theme';
import { lazy, Suspense } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

const HomeScreen = lazy(() => import('@/features/dashboard/presentation/home'));

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <Suspense
      fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      }
    >
      <HomeScreen />
    </Suspense>
  );
}