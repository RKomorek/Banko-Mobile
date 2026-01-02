import { Colors } from "@/shared/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { UploadIcon } from "./icons-personalized";


export function ReceiptUploadBox({ onPress, selected, fileName }: {
  onPress: () => void;
  selected?: boolean;
  fileName?: string | null;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  return (
    <View>
    <Text style={[styles.label,{color: theme.foreground}]}>Anexo (opcional)</Text>
    <TouchableOpacity
      style={[[styles.box,{borderColor:theme.border, backgroundColor:theme.card}], selected && {borderColor:theme.primary}]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <UploadIcon color={theme.mutedForeground} style={{ marginBottom: 8 }} />
      <Text style={[styles.text,{color:theme.foreground}]}>
        Clique aqui para selecionar
      </Text>
      {fileName ? (
        <Text style={[styles.selectedFile,{color: theme.primary}]}>Selecionado: {fileName}</Text>
      ) : null}
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
  },
 label: {
    fontWeight: "600",
    fontSize: 15,
    textAlign: "left",
  },
  selectedFile: {
    fontSize: 13,
    marginTop: 8,
    fontWeight: "bold",
  },
});