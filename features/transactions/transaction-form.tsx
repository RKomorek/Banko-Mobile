import { Colors } from "@/shared/constants/theme";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  BoletoIcon,
  CartaoIcon,
  PixIcon,
} from "@/shared/ui/icons-personalized";
import { ReceiptUploadBox } from "@/shared/ui/receipt-upload-box";
import SafeAreaWrapper from "@/shared/ui/safe-area-wrapper";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getDocumentAsync } from "expo-document-picker";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { JSX, useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import * as yup from "yup";
import { auth, db, storage } from "../../firebase";

interface TransactionFormValues {
  title: string;
  amount: number;
  type: "cartao" | "boleto" | "pix";
  date: string;
  isNegative: boolean;
}

interface TransactionFormProps {
  initialValues?: TransactionFormValues & { 
    id?: string; 
    receiptUrl?: string;
    receiptFileName?: string;
  };
  onSaved?: () => void;
  onCancel?: () => void;
}

const schema = yup.object({
  title: yup.string().trim().required("Descrição obrigatória"),
  amount: yup
    .number()
    .typeError("Valor deve ser número")
    .required("Valor obrigatório")
    .test("not-zero", "Valor não pode ser 0", (val) => val !== 0),
  type: yup
    .string()
    .oneOf(["cartao", "boleto", "pix"])
    .required("Tipo obrigatório"),
  date: yup
    .string()
    .required("Data obrigatória")
    .test(
      "is-date",
      "Data inválida",
      (value) => !isNaN(Date.parse(value || ""))
    ),
  isNegative: yup.boolean().required("Preencha"),
});

export default function TransactionForm({
  initialValues,
  onSaved = () => {},
  onCancel = () => {},
}: TransactionFormProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation();
  const mergedInitialValues =
    initialValues || (route.params && (route.params as any).initialValues);


  const normalizeDate = (date: any) => {
    if (!date) return new Date().toISOString().slice(0, 10);
    if (typeof date === "string") {
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);
      const d = new Date(date);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return new Date().toISOString().slice(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toISOString().slice(0, 10);
    }
    if (date?.toDate) {
      return date.toDate().toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  };

  const normalizedInitialValues = mergedInitialValues
    ? {
        ...mergedInitialValues,
        date: normalizeDate(mergedInitialValues.date),
      }
    : undefined;


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<TransactionFormValues>({
    resolver: yupResolver(schema),
    defaultValues: normalizedInitialValues || {
      title: "",
      amount: 0,
      type: "cartao",
      date: new Date().toISOString().slice(0, 10),
      isNegative: false,
    },
  });

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!canLeaveRef.current) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: undefined });
    };
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptUri, setReceiptUri] = useState<string | null>(
    mergedInitialValues?.receiptUrl || null
  );
  const [receiptFileName, setReceiptFileName] = useState<string | null>(
    mergedInitialValues?.receiptFileName || null
  );
  const [amountMasked, setAmountMasked] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const isNegative = watch("isNegative");

  const canLeaveRef = React.useRef(false);

  function formatDate(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  const paymentIcons: Record<string, JSX.Element> = {
    cartao: <CartaoIcon style={{ color: theme.foreground }} />,
    boleto: <BoletoIcon style={{ color: theme.foreground }} />,
    pix: <PixIcon style={{ color: theme.foreground }} />,
  };

  const paymentLabels: Record<string, string> = {
    cartao: "Cartão",
    boleto: "Boleto",
    pix: "Pix",
  };

  React.useEffect(() => {
    if (mergedInitialValues?.amount !== undefined) {
      setAmountMasked(String(Math.round(Math.abs(mergedInitialValues.amount * 100))));
    } else {
      setAmountMasked("");
    }
  }, [mergedInitialValues?.amount]);

  function formatCurrencyMasked(text: string) {
    const number = Number(text || "0");
    return (number / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const isImageFile = (uri: string | null, fileName?: string | null) => {
    if (!uri) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const checkString = (fileName || uri).toLowerCase();
    return imageExtensions.some(ext => checkString.includes(ext));
  };


  const removeReceipt = () => {
    setReceiptUri(null);
    setReceiptFileName(null);
  };

  const pickReceipt = async () => {
    try {
      const res = await getDocumentAsync({
        copyToCacheDirectory: true,
        type: "*/*",
      });
      if (res.canceled) return;
      if (res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        setReceiptUri(asset.uri);
        setReceiptFileName(asset.name);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Erro ao selecionar recibo",
        text2: "Por favor, tente novamente mais tarde.",
      });
    }
  };

  const uploadReceiptToFirebase = async (localUri: string | null) => {
    if (!localUri) return null;
    if (!storage) {
      Toast.show({
        type: "error",
        text1: "Erro ao fazer upload do recibo",
        text2: "Storage não está disponível",
      });
      return null;
    }
    setUploading(true);
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();
      const filename = `receipts/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Erro ao fazer upload do recibo",
        text2: err,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getAccountDocRef = async (userId: string) => {
    if (!db) {
      console.warn('Firestore não disponível');
      return null;
    }
    const q = query(collection(db, "accounts"), where("user_id", "==", userId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return doc(db, "accounts", snapshot.docs[0].id);
    }
    return null;
  };

  const updateAccountBalance = async (userId: string, value: number) => {
    const accountRef = await getAccountDocRef(userId);
    if (accountRef) {
      const accountSnap = await getDoc(accountRef);
      const accountData = accountSnap.data();
      const currentBalance = parseFloat(accountData?.saldo ?? "0");
      await updateDoc(accountRef, {
        saldo: (currentBalance + value).toFixed(2),
      });
    }
  };

  const goToList = () => {
    canLeaveRef.current = true;
    navigation.reset({
      index: 0,
      routes: [{ name: "transactions" as never }],
    });
  };

  const onSubmit: SubmitHandler<TransactionFormValues> = async (data) => {
    try {
      setUploading(true);
      if (!auth) throw new Error("Auth não está disponível!");
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado!");
      if (!db) throw new Error("Firestore não está disponível!");
      const amount = Math.abs(data.amount) * (isNegative ? -1 : 1);

      let receiptUrl = mergedInitialValues?.receiptUrl || null;
      let savedFileName = mergedInitialValues?.receiptFileName || null;
      
      if (receiptUri && receiptUri !== mergedInitialValues?.receiptUrl) {
        const uploaded = await uploadReceiptToFirebase(receiptUri);
        if (uploaded) {
          receiptUrl = uploaded;
          savedFileName = receiptFileName;
        }
      }

      const payload = {
        title: data.title,
        amount,
        type: data.type,
        date: new Date(data.date),
        receiptUrl: receiptUrl || null,
        receiptFileName: savedFileName || null,
        updatedAt: serverTimestamp(),
        userId: user.uid,
        isNegative: data.isNegative,
      };

      let balanceChange = amount;

      if (mergedInitialValues?.id) {
        const previousAmount = Math.abs(mergedInitialValues.amount) * (mergedInitialValues.isNegative ? -1 : 1);
        balanceChange = amount - previousAmount;

        const txRef = doc(db, "transactions", mergedInitialValues.id);
        await updateDoc(txRef, payload);
      } else {
        const txCollection = collection(db, "transactions");
        await addDoc(txCollection, {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      await updateAccountBalance(user.uid, balanceChange);

      onSaved();
      goToList();
    } catch (err) {
      console.error("Erro ao salvar transação:", err);
      Toast.show({
        type: "error",
        text1: "Erro ao salvar transação.",
        text2: "Por favor, tente novamente mais tarde.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setAmountMasked("");
    setReceiptUri(null);
    setReceiptFileName(null);
    onCancel();
    goToList();
  };

  return (
    <SafeAreaWrapper
      backgroundColor={theme.background}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 140 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: theme.foreground }]}>
              {mergedInitialValues ? "Editar transação" : "Nova transação"}
            </Text>
            <Text style={[styles.cardDescription, { color: theme.foreground }]}>
              Escolha o método de pagamento e insira o valor.
            </Text>
          </View>

          <View style={styles.radioGroup}>
            {["cartao", "boleto", "pix"].map((type) => (
              <Controller
                key={type}
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <TouchableOpacity
                    style={[
                      [styles.radioItem, { borderColor: theme.border }],
                      value === type && { borderColor: theme.primary, backgroundColor: theme.card },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => onChange(type)}
                  >
                    {paymentIcons[type]}
                    <Text
                      style={[
                        [styles.radioLabel, { color: theme.foreground }]
                      ]}
                    >
                      {paymentLabels[type]}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          {errors.type && (
            <Text style={[styles.error, { color: theme.destructive }]}>{errors.type.message}</Text>
          )}

          <View style={styles.movingTypeGroup}>
            <Controller
              control={control}
              name="isNegative"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={[
                      [styles.movingTypeBtn, { borderColor: theme.border }],
                      !value && { borderColor: theme.constructive, backgroundColor: theme.card },
                    ]}
                    onPress={() => onChange(false)}
                  >
                    <BanknoteArrowUp
                      color={theme.foreground}
                      style={{ marginBottom: 4 }}
                      width={24}
                      height={24}
                    />
                    <Text style={[styles.movingTypeLabel, { color: theme.foreground }]}>Entrada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      [styles.movingTypeBtn, { borderColor: theme.border }],
                      value && { borderColor: theme.destructive, backgroundColor: theme.card },
                    ]}
                    onPress={() => onChange(true)}
                  >
                    <BanknoteArrowDown
                      color={theme.foreground}
                      style={{ marginBottom: 4 }}
                      width={24}
                      height={24}
                    />
                    <Text style={[styles.movingTypeLabel, { color: theme.foreground }]}>Saída</Text>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>

          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange } }) => (
              <>
                <Text style={[styles.label, { color: theme.foreground }]}>Valor</Text>
                <TextInput
                  style={[
                    [styles.input, { backgroundColor: theme.card, borderColor: theme.input }],
                    isNegative
                      ? { color: theme.destructive }
                      : { color: theme.constructive },
                  ]}
                  placeholder="R$ 0,00"
                  keyboardType="numeric"
                  value={formatCurrencyMasked(amountMasked)}
                  onChangeText={(text) => {
                    const numeric = text.replace(/\D/g, "");
                    setAmountMasked(numeric);
                    onChange(Number(numeric) / 100);
                  }}
                  placeholderTextColor={theme.primary}
                  maxLength={17}
                />
                {errors.amount && (
                  <Text style={[styles.error, { color: theme.destructive }]}>{errors.amount.message}</Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={[styles.label, { color: theme.foreground }]}>Descrição</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.input, color: theme.foreground }]}
                  placeholderTextColor={theme.foreground}
                  placeholder="Descrição da transação"
                  value={value}
                  onChangeText={onChange}
                />
                {errors.title && (
                  <Text style={[styles.error, { color: theme.destructive }]}>{errors.title.message}</Text>
                )}
              </>
            )}
          />

          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <>
                <Text style={[styles.label, { color: theme.foreground }]}>Data</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, { backgroundColor: theme.card, borderColor: theme.input }]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: value ? theme.foreground : theme.primary,
                    }}
                  >
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
                {errors.date && (
                  <Text style={[styles.error, { color: theme.destructive }]}>{errors.date.message}</Text>
                )}
              </>
            )}
          />

          {/* Upload de recibo */}
          <ReceiptUploadBox
            onPress={pickReceipt}
            selected={!!receiptUri}
            fileName={receiptFileName || (receiptUri ? receiptUri.split("/").pop() : undefined)}
            imageUri={receiptUri}
            isImage={isImageFile(receiptUri, receiptFileName)}
            onRemove={removeReceipt}
            onViewFull={() => setShowImageModal(true)}
          />

          {uploading && (
            <ActivityIndicator
              color={theme.primary}
              style={{ marginVertical: 8 }}
            />
          )}
        </View>
        </ScrollView>
        
        {/* Rodapé fixo com fundo e separador */}
        <View
          style={[
            styles.footerContainer,
            {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <View style={styles.footerButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.card, borderColor: theme.primary }]}
              onPress={handleCancel}
              disabled={uploading}
            >
              <Text style={{ color: theme.primary, fontWeight: "bold", }}>
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit(
                onSubmit as SubmitHandler<TransactionFormValues>
              )}
              disabled={uploading}
            >
              <Text
                style={{ color: theme.primaryForeground, fontWeight: "bold" }}
              >
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal de visualização em tela cheia */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.95)' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Visualização do anexo</Text>
            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕ Fechar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalImageContainer}>
            {receiptUri && isImageFile(receiptUri, receiptFileName) && (
              <Image
                source={{ uri: receiptUri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
          
        </View>
      </Modal>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  content: {
    padding: 16,
  },
  integratedPreview: {
    marginTop: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactPreviewImage: {
    width: "100%",
    height: 120,
    borderRadius: 6,
    marginBottom: 8,
  },
  imageActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  compactFilePreview: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  compactFileName: {
    fontSize: 12,
    textAlign: "center",
  },
  removeOnlyBtn: {
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  previewContainer: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  filePreview: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
  },
  previewActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "space-between",
  },
  previewButton: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalImageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },

  modalButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 0,
    zIndex: 10,
    elevation: 6,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cardHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 14,
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
    borderRadius: 8,
    borderWidth: 2,
  },
  radioLabel: {
    fontWeight: "600",
    fontSize: 15,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
  },
  movingTypeLabel: {
    fontWeight: "600",
    fontSize: 15,
  },
  label: {
    fontWeight: "600",
    fontSize: 15,
    marginTop: 4,
    marginBottom: 0,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginBottom: 4,
  },
  saveButton: {
    borderRadius: 8,
    padding: 14,
    flex: 1,
    alignItems: "center",
    marginLeft: 8,
  },
  cancelButton: {
    borderRadius: 8,
    padding: 14,
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    marginRight: 2,
  },
});