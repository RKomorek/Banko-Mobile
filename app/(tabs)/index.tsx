import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import { Colors } from '@/constants/theme';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';


export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
   <SafeAreaWrapper backgroundColor={theme.background}>
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
   </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
