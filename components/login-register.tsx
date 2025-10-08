import { Colors } from "@/constants/theme";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { LogoBanko } from "./ui/logo-banko";

export default function LoginRegisterScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
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
      } else {
        // CADASTRO
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        // Salva dados extras na coleção users
        await setDoc(doc(db, "users", user.uid), {
          name,
          surname,
          email,
          createdAt: new Date(),
        });

        // Adiciona registro na tabela accounts (sem notificar o usuário)
        await addDoc(collection(db, "accounts"), {
          user_id: user.uid,
          numero_conta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(), // número de conta aleatório
          saldo: 1000,
          created_at: new Date().toISOString(),
        });

        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Cadastro realizado!',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao autenticar",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.logoBox}>
        <LogoBanko variant="full" size={200} />
      </View>
      <View style={{ flex: 1,}}>
      <Text style={[styles.title, { color: theme.foreground }]}>
        {isLogin ? "Entrar" : "Cadastre-se"}
      </Text>
      {!isLogin && (
        <>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, {borderColor: theme.input,backgroundColor: theme.card,color: theme.foreground,flex:1 }]}
              placeholderTextColor={theme.foreground}
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { borderColor: theme.input,backgroundColor: theme.card,color: theme.foreground,flex:1 }]}
              placeholderTextColor={theme.foreground}
              placeholder="Seu sobrenome"
              value={surname}
              onChangeText={setSurname}
              autoCapitalize="words"
            />
          </View>
        </>
      )}
      <TextInput
        style={[styles.input,{borderColor: theme.input,backgroundColor: theme.card,color: theme.foreground}]}
        placeholderTextColor={theme.foreground}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input,{borderColor: theme.input, backgroundColor: theme.card, color: theme.foreground}]}
        placeholderTextColor={theme.foreground}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button,{backgroundColor:theme.primary}]}
        onPress={handleAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.primaryForeground} />
        ) : (
          <Text style={[styles.buttonText,{color:theme.background}]}>
            {isLogin ? "Entrar" : "Criar conta"}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={[styles.toggle,{color:theme.foreground}]}>
          {isLogin ? "Não tem conta? Cadastre-se" : "Já tem uma conta? Entrar"}
        </Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    paddingBottom: 20,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap:10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft:12,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  toggle: {
    marginTop:22,
    textAlign: "center",
  },
  logoBox: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 70,
    marginBottom: 0,
  },
});
