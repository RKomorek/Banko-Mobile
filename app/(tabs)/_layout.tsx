import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Tabs } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import LoginRegisterScreen from "../../components/login-register";
import { auth } from "../../firebase";

export type RootStackParamList = {
  "transaction-form": { initialValues?: any } | undefined;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <LoginRegisterScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].primary,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
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
              <IconSymbol size={28} name={route?.params?.initialValues ? "pencil" : "card-plus-outline"} color={color} />
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
    </ThemeProvider>
  );
}
