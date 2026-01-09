import { useAuthState } from "@/features/auth/data/use-auth";
import LoginRegisterScreen from "@/features/auth/presentation/login-register";
import { Colors } from "@/shared/constants/theme";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Dimensions, useColorScheme, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";

export type RootStackParamList = {
  "transaction-form": { initialValues?: any } | undefined;
};

const TabBarIcon = ({ focused, color, name }: { focused: boolean; color: string; name: React.ComponentProps<typeof IconSymbol>['name'] }) => {
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 4; // 4 menus
  
  // Animações
  const scale = useSharedValue(focused ? 1 : 0.85);
  const lineWidth = useSharedValue(focused ? tabWidth : 0);
  const lineHeight = useSharedValue(focused ? 4 : 1);
  
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.85, {
      damping: 15,
      stiffness: 150,
    });
    lineWidth.value = withTiming(focused ? tabWidth : 0, { duration: 300 });
    lineHeight.value = withTiming(focused ? 4 : 1, { duration: 200 });
  }, [focused]);
  
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const lineStyle = useAnimatedStyle(() => ({
    width: lineWidth.value,
    height: lineHeight.value,
  }));
  
  return (
    <View style={{ alignItems: 'center', width: tabWidth, position: 'relative' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: -15,
            left: 0,
            backgroundColor: focused ? Colors[colorScheme ?? 'light'].primary : '#e0e0e0',
          },
          lineStyle
        ]}
      />
      <Animated.View style={iconStyle}>
        <IconSymbol size={28} name={name} color={color} />
      </Animated.View>
    </View>
  );
};

export default function TabsLayout() {
  const { user, loading } = useAuthState();
  const colorScheme = useColorScheme();

  console.log('[TabsLayout] Render - loading:', loading, 'user:', user?.email || 'no user');

  if (loading) {
    console.log('[TabsLayout] Showing loading screen');
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor: Colors[colorScheme ?? 'light'].background}}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
      </View>
    );
  }
  
  if (!user) {
    console.log('[TabsLayout] No user, showing login');
    return <LoginRegisterScreen />;
  }

  console.log('[TabsLayout] User authenticated, showing tabs');
  return (
    <Tabs screenOptions={{
      tabBarStyle: { 
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
      headerShown: false
    }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon focused={focused} color={color} name="house.fill" />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transações",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon focused={focused} color={color} name="list" />
            ),
          }}
        />
        <Tabs.Screen
          name="transaction-form"
          options={({
            route,
          }: {
            route: { params?: { initialValues?: any } };
          }) => ({
            title: route?.params?.initialValues ? 'Editar transação' : 'Nova transação',
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon 
                focused={focused} 
                color={color} 
                name={route?.params?.initialValues ? "pencil" : "card-plus-outline"} 
              />
            ),
            tabBarStyle: { display: "none" },
          })}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon focused={focused} color={color} name="person" />
            ),
          }}
        />
      </Tabs>
  );
}
