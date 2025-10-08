import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Colors } from "../../constants/theme";
import { auth, db } from "../../firebase";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [userInfo, setUserInfo] = useState<{ name?: string; surname?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

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

  const getInitials = () => {
    const name = userInfo?.name ?? "";
    const surname = userInfo?.surname ?? "";
    return `${name[0] ?? ""}${surname[0] ?? ""}`.toUpperCase();
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
      {/* Avatar com iniciais */}
      <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
        <Text style={styles.avatarText}>{getInitials()}</Text>
      </View>

      <Text style={[styles.title, { color: theme.primary }]}>Perfil do usuário</Text>

      {/* Card de informações */}
      <View style={[styles.card, { backgroundColor: theme.background }]}>
        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.foreground }]}>Nome</Text>
          <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.name || "-"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.foreground }]}>Sobrenome</Text>
          <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.surname || "-"}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={[styles.label, { color: theme.foreground }]}>E-mail</Text>
          <Text style={[styles.value, { color: theme.foreground }]}>{userInfo?.email || "-"}</Text>
        </View>
      </View>

      {/* Botão de logout */}
      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor:theme.primary }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: theme.primary }]}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 24, textAlign: "center" },
  card: {
    width: "100%",
    paddingTop: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  infoBox: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 16 },
  logoutBtn: { padding: 14, borderRadius: 8, alignItems: "center", width: "100%", borderWidth:1 },
  logoutText: { fontWeight: "bold", fontSize: 16 },
});
