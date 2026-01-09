import LoginRegisterScreen from "@/features/auth/presentation/login-register";
import { Colors } from "@/shared/constants/theme";
import { useAuth } from "@/shared/context/auth-context";
import { IconSymbol } from "@/shared/ui/icon-symbol";
import { Tabs } from "expo-router";
import React from "react";
import { ActivityIndicator, Dimensions, useColorScheme, View } from "react-native";

export type RootStackParamList = {
  "transaction-form": { initialValues?: any } | undefined;
};

const TabBarIcon = ({ focused, color, name }: { focused: boolean; color: string; name: React.ComponentProps<typeof IconSymbol>['name'] }) => {
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / 4; // 4 menus
  
  return (
    <View style={{ alignItems: 'center', width: tabWidth, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          top: -15,
          left: 0,
          height: focused ? 4 : 1,
          width: tabWidth,
          backgroundColor: focused ? Colors[colorScheme ?? 'light'].primary : '#e0e0e0',
        }}
      />
      <IconSymbol size={28} name={name} color={color} />
    </View>
  );
};

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  if (loading) {
    return (
      <View style={{flex:1,justifyContent:'center',alignItems:'center', backgroundColor: Colors[colorScheme ?? 'light'].background}}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
      </View>
    );
  }
  
  if (!user) {
    return <LoginRegisterScreen />;
  }

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
              <TabBarIcon focused={focused} color={color} name={route?.params?.initialValues ? "pencil" : "add-card"} />
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
