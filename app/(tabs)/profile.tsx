import { themeDark, themeLight, useThemeContext } from "@/components/ui/theme";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebase";

export default function ProfileScreen() {
  const [userInfo, setUserInfo] = useState<{ name?: string; surname?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const { isDark, toggleTheme } = useThemeContext();
  const theme = isDark ? themeDark : themeLight;
  const { colors } = theme;

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
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Perfil do Usuário</Text>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: colors.foreground }]}>Nome:</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{userInfo?.name || "-"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: colors.foreground }]}>Sobrenome:</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{userInfo?.surname || "-"}</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: colors.foreground }]}>E-mail:</Text>
        <Text style={[styles.value, { color: colors.foreground }]}>{userInfo?.email || "-"}</Text>
      </View>
      <View style={styles.themeBox}>
        <Text style={[styles.label, { color: colors.foreground }]}>Tema escuro:</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.primary }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: colors.primaryForeground }]}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  infoBox: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: "600" },
  value: { fontSize: 16, marginTop: 2 },
  themeBox: { flexDirection: "row", alignItems: "center", marginBottom: 32, justifyContent: "space-between" },
  logoutBtn: { padding: 14, borderRadius: 8, alignItems: "center" },
  logoutText: { fontWeight: "bold", fontSize: 16 },
});