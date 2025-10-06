import { ReceiptUploadBox } from "@/components/receipt-upload-box";
import { BanknoteArrowDown, BanknoteArrowUp, BoletoIcon, CartaoIcon, PixIcon } from "@/components/ui/icons-personalized";
import { themeLight } from "@/components/ui/theme";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getDocumentAsync } from "expo-document-picker";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { JSX, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import { auth, db, storage } from "../../firebase";

const {
  colors,
  radius,
  fontFamily,
} = themeLight;

interface TransactionFormValues {
  title: string;
  amount: number;
  type: "cartao" | "boleto" | "pix";
  date: string;
  isNegative: boolean;
}

interface TransactionFormProps {
  initialValues?: TransactionFormValues & { id?: string; receiptUrl?: string };
  onSaved?: () => void;
  onCancel?: () => void;
}

const schema = yup.object({
  title: yup.string().trim().required("Título obrigatório"),
  amount: yup
    .number()
    .typeError("Valor deve ser número")
    .required("Valor obrigatório")
    .test("not-zero", "Valor não pode ser 0", (val) => val !== 0),
  type: yup.string().oneOf(["cartao", "boleto", "pix"]).required("Tipo obrigatório"),
  date: yup
    .string()
    .required("Data obrigatória")
    .test("is-date", "Data inválida", (value) => !isNaN(Date.parse(value || ""))),
  isNegative: yup.boolean().required("Preencha"),
});

export default function TransactionForm({
  initialValues,
  onSaved = () => {},
  onCancel = () => {},
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<TransactionFormValues>({
    resolver: yupResolver(schema),
    defaultValues: initialValues || {
      title: "",
      amount: 0,
      type: "cartao",
      date: new Date().toISOString().slice(0, 10),
      isNegative: false,
    },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(initialValues?.receiptUrl || null);
  function formatDate(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Para mudar cor do valor conforme entrada/saída
  const isNegative = watch("isNegative");
  const [amountMasked, setAmountMasked] = useState("");
  const paymentIcons: Record<string, JSX.Element> = {
    cartao: <CartaoIcon style={{ color: colors.foreground }} />,
    boleto: <BoletoIcon style={{ color: colors.foreground }} />,
    pix: <PixIcon style={{ color: colors.foreground }} />,
  };

  const paymentLabels: Record<string, string> = {
    cartao: "Cartão",
    boleto: "Boleto",
    pix: "Pix",
  };
  React.useEffect(() => {
    if (initialValues?.amount) {
      setAmountMasked(String(Math.round(Math.abs(initialValues.amount * 100))));
    }
  }, [initialValues]);

  function formatCurrencyMasked(text: string) {
    const number = Number(text || "0");
    return (number / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  const pickReceipt = async () => {
    try {
      const res = await getDocumentAsync({ copyToCacheDirectory: true, type: "*/*" });
      if (res.canceled) return; // Não faz nada se cancelar
      if (res.assets && res.assets.length > 0) {
        setReceiptUri(res.assets[0].uri);
      }
    } catch {
      alert("Erro ao selecionar recibo.");
    }
  };

  const uploadReceiptToFirebase = async (localUri: string | null) => {
    if (!localUri) return null;
    setUploading(true);
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const filename = `receipts/${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      alert("Erro ao fazer upload do recibo." + err);
      return null;
    } finally {
      setUploading(false);
    }
  };

 const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
  try {
    setUploading(true);
    const user = auth.currentUser;
    if (!user) throw new Error("Usuário não autenticado!");
      const isNegative = data.isNegative === true || data.amount < 0;
      const amount = Math.abs(data.amount) * (isNegative ? -1 : 1);

      let receiptUrl = initialValues?.receiptUrl || null;
      if (receiptUri && receiptUri !== initialValues?.receiptUrl) {
        const uploaded = await uploadReceiptToFirebase(receiptUri);
        if (uploaded) receiptUrl = uploaded;
      }

      const payload = {
      title: data.title,
      amount,
      type: data.type,
      date: new Date(data.date),
      receiptUrl: receiptUrl || null,
      updatedAt: serverTimestamp(),
      userId: user.uid,
    };

    if (initialValues?.id) {
      const txRef = doc(db, "transactions", initialValues.id);
      await updateDoc(txRef, payload);
    } else {
      const txCollection = collection(db, "transactions");
      await addDoc(txCollection, { ...payload, createdAt: serverTimestamp() });
    }
    onSaved();
  } catch (err) {
    console.error("Erro ao salvar transação:", err);
    alert("Erro ao salvar transação.");
  } finally {
    setUploading(false);
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <View style={styles.content}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {initialValues ? "Editar transação" : "Nova transação"}
            </Text>
            <Text style={styles.cardDescription}>
              Escolha o método de pagamento e insira o valor.
            </Text>
          </View>

          {/* Tipo de pagamento */}
          <View style={styles.radioGroup}>
            {["cartao", "boleto", "pix"].map((type) => (
              <Controller
                key={type}
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      styles.radioItem,
                      value === type && styles.radioItemActive,
                    ]}
                    onPress={() => onChange(type)}
                    activeOpacity={0.8}
                  >
                    {paymentIcons[type]}
                    <Text style={[
                      styles.radioLabel,
                      value === type && styles.radioLabelActive
                    ]}>
                      {paymentLabels[type]}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          {errors.type && <Text style={styles.error}>{errors.type.message}</Text>}

          {/* Entrada/Saída */}
          <View style={styles.movingTypeGroup}>
            <Controller
              control={control}
              name="isNegative"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[
                      styles.movingTypeBtn,
                      !value && styles.movingTypeBtnActiveIn
                    ]}
                    onPress={() => onChange(false)}
                  >
                    <BanknoteArrowUp
                      color={colors.foreground}
                      style={{ marginBottom: 4 }}
                      width={24}
                      height={24}
                    />
                    <Text style={[
                      styles.movingTypeLabel
                    ]}>
                      Entrada
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.movingTypeBtn,
                      value && styles.movingTypeBtnActiveOut
                    ]}
                    onPress={() => onChange(true)}
                  >
                    <BanknoteArrowDown
                      color={colors.foreground}
                      style={{ marginBottom: 4 }}
                      width={24}
                      height={24}
                    />
                    <Text style={[
                      styles.movingTypeLabel
                    ]}>
                      Saída
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>

          {/* Valor */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange } }) => (
              <>
                <Text style={styles.label}>Valor</Text>
                <TextInput
                  style={[
                    styles.input,
                    isNegative ? { color: colors.destructive } : { color: colors.constructive }
                  ]}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                  value={formatCurrencyMasked(amountMasked)}
                  onChangeText={(text) => {
                    const numeric = text.replace(/\D/g, "");
                    setAmountMasked(numeric);
                    onChange(Number(numeric) / 100);
                  }}
                  placeholderTextColor={colors.primary}
                  maxLength={17}
                />
                {errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}
              </>
            )}
          />

          {/* Descrição */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={styles.label}>Descrição</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Descrição da transação"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
              </>
            )}
          />

          {/* Data */}
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={styles.label}>Data</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.input}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: value ? colors.foreground : colors.primary }}>
                    {value ? formatDate(value) : "Selecione a data"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) {
                        onChange(selectedDate.toISOString().slice(0, 10));
                      }
                    }}
                  />
                )}
                {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
              </>
            )}
          />

          {/* Upload de recibo */}
          <View style={{ marginVertical: 10 }}>
           <ReceiptUploadBox
              onPress={pickReceipt}
              selected={!!receiptUri}
              fileName={receiptUri ? receiptUri.split("/").pop() : undefined}
            />
          </View>

          {uploading && <ActivityIndicator color={colors.primary} style={{ marginVertical: 8 }} />}
          {/* Botões fixos na base */}

          <View style={styles.footerFixed}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                reset(); 
                setAmountMasked("");
                setReceiptUri(null);
                onCancel(); 
              }}
              disabled={uploading}
            >
              <Text style={{ color: colors.primary, fontWeight: "bold" }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(onSubmit as SubmitHandler<TransactionFormValues>)}
              disabled={uploading}
            >
              <Text style={{ color: colors.primaryForeground, fontWeight: "bold" }}>
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  footerFixed: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: colors.background,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  cardHeader: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  radioGroup: {
    flexDirection: "row",
    marginBottom: 0,
    marginTop: 18,
    justifyContent: "center",
    gap: 8,
  },
  radioItem: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 4,
    backgroundColor: colors.muted,
  },
  radioItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  radioLabel: {
    color: colors.foreground,
    fontWeight: "600",
    fontSize: 15,
    fontFamily: fontFamily.sans,
  },
  radioLabelActive: {
    color: colors.foreground,
  },
  movingTypeGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  movingTypeBtn: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 4,
    backgroundColor: colors.muted,
  },
  movingTypeBtnActiveIn: {
    borderColor: colors.constructive,
    backgroundColor: colors.accent,
  },
  movingTypeBtnActiveOut: {
    borderColor: colors.destructive,
    backgroundColor: colors.muted,
  },
  movingTypeLabel: {
    fontWeight: "600",
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 2,
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: radius,
    padding: 10,
    marginVertical: 6,
    backgroundColor: colors.card,
    fontSize: 16,
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  error: { color: colors.destructive, fontSize: 12, marginBottom: 4 },
  receiptButton: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    padding: 12,
    alignItems: "center",
    marginVertical: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    padding: 14,
    flex: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderRadius: radius,
    padding: 14,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 8,
  },
});