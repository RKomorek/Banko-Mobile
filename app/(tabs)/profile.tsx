import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Colors } from "../../constants/theme";
import { auth, db } from "../../firebase";

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<{ name?: string; surname?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        setUserInfo({ email: user.email, ...snap.data() } as any);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      Toast.show({
        type: "error",
        text1: "Não foi possível sair",
        text2: "Por favor, tente novamente mais tarde.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Perfil do usuário</Text>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: theme.foreground }]}>Nome:</Text>
        <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.name || "-"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: theme.foreground }]}>Sobrenome:</Text>
        <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.surname || "-"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: theme.foreground }]}>E-mail:</Text>
        <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.email || "-"}</Text>
      </View>
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.primary }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: theme.primaryForeground }]}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "left" },
  infoBox: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600" },
  value: { fontSize: 16, marginTop: 2 },
  logoutBtn: { padding: 14, borderRadius: 8, alignItems: "center" },
  logoutText: { fontWeight: "bold", fontSize: 16 },
});