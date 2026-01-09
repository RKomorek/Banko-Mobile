import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  scaleOnPress?: boolean;
}

/**
 * Botão animado com efeitos de scale e feedback visual
 * Pressiona = reduz escala, solta = volta ao normal
 */
export function AnimatedButton({ 
  children, 
  scaleOnPress = true,
  onPressIn,
  onPressOut,
  style,
  ...props 
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = (e: any) => {
    if (scaleOnPress) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (scaleOnPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
    onPressOut?.(e);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      {children}
    </AnimatedTouchable>
  );
}
