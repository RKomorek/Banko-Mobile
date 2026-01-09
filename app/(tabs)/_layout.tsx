import LoginRegisterScreen from "@/features/auth/presentation/login-register";
import { Colors } from "@/shared/constants/theme";
import { useAuth } from "@/shared/context/auth-context";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";

export type RootStackParamList = {
  "transaction-form": { initialValues?: any } | undefined;
};

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><ActivityIndicator/></View>;
  if (!user) return <LoginRegisterScreen />;

  return (
    <Tabs screenOptions={{
      tabBarStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
      headerShown: false
    }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transações",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="list" color={color} />
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
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name={route?.params?.initialValues ? "pencil" : "add-card"} color={color} />
            ),
            tabBarStyle: { display: "none" },
          })}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="person" color={color} />
            ),
          }}
        />
      </Tabs>
  );
}
