import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface AnimatedScreenWrapperProps {
  children: React.ReactNode;
  delay?: number;
}

/**
 * Wrapper component que adiciona animações de entrada/saída suaves para telas
 * Usa FadeIn e FadeOut do React Native Reanimated
 */
export function AnimatedScreenWrapper({ children, delay = 0 }: AnimatedScreenWrapperProps) {
  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(300).delay(delay)}
      exiting={FadeOut.duration(200)}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
