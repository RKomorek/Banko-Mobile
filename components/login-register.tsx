import { themeLight } from "@/components/ui/theme";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { colors, radius, fontFamily } = themeLight;

export default function LoginRegisterScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert("Sucesso", "Login realizado!");
      } else {
        // CADASTRO
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Salva dados extras na coleção users
        await setDoc(doc(db, "users", user.uid), {
          name,
          surname,
          email,
          createdAt: new Date(),
        });
        Alert.alert("Sucesso", "Cadastro realizado!");
      }
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Erro ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Entrar" : "Cadastre-se"}</Text>
      {!isLogin && (
        <>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.inputHalf, { marginRight: 6 }]}
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, styles.inputHalf, { marginLeft: 6 }]}
              placeholder="Seu sobrenome"
              value={surname}
              onChangeText={setSurname}
              autoCapitalize="words"
            />
          </View>
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.primaryForeground} />
        ) : (
          <Text style={styles.buttonText}>{isLogin ? "Entrar" : "Criar conta"}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggle}>
          {isLogin ? "Não tem conta? Cadastre-se" : "Já tem uma conta? Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 24,
    textAlign: "center",
    fontFamily: fontFamily.sans,
  },
  row: {
    flexDirection: "row",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius,
    padding: 12,
    backgroundColor: colors.card,
    fontSize: 16,
    color: colors.foreground,
    fontFamily: fontFamily.sans,
    marginBottom: 14,
  },
  inputHalf: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: fontFamily.sans,
  },
  toggle: {
    color: colors.primary,
    textAlign: "center",
    marginTop: 8,
    fontFamily: fontFamily.sans,
  },
});