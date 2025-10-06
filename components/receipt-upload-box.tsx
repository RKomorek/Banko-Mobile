import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UploadIcon } from "./ui/icons-personalized";
import { themeLight } from "./ui/theme";

const {
  colors,
  radius,
  fontFamily,
} = themeLight;

export function ReceiptUploadBox({ onPress, selected, fileName }: {
  onPress: () => void;
  selected?: boolean;
  fileName?: string | null;
}) {
  return (
    <View>
    <Text style={styles.label}>Anexo (opcional)</Text>
    <TouchableOpacity
      style={[styles.box, selected && styles.boxSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <UploadIcon color={colors.mutedForeground} style={{ marginBottom: 8 }} />
      <Text style={styles.text}>
        Clique aqui para selecionar
      </Text>
      {fileName ? (
        <Text style={styles.selectedFile}>Selecionado: {fileName}</Text>
      ) : null}
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: colors.muted,
  },
  boxSelected: {
    borderColor: colors.primary,
  },
  text: {
    color: colors.foreground,
    fontSize: 15,
    textAlign: "center",
    marginBottom: 4,
    fontFamily: fontFamily.sans,
  },
 label: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
    textAlign: "left",
    color: colors.foreground,
    fontFamily: fontFamily.sans,
  },
  selectedFile: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 8,
    fontWeight: "bold",
    fontFamily: fontFamily.sans,
  },
});