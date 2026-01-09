import { Colors } from "@/shared/constants/theme";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { UploadIcon } from "./icons-personalized";


export function ReceiptUploadBox({ 
  onPress, 
  selected, 
  fileName,
  imageUri,
  isImage,
  fileType = 'other',
  fileIcon = '📎',
  onRemove,
  onViewFull,
}: {
  onPress: () => void;
  selected?: boolean;
  fileName?: string | null;
  imageUri?: string | null;
  isImage?: boolean;
  fileType?: 'image' | 'pdf' | 'svg' | 'other';
  fileIcon?: string;
  onRemove?: () => void;
  onViewFull?: () => void;
}) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  
  // Debug
  console.log('ReceiptUploadBox:', { imageUri, isImage, fileName, fileType });
  
  return (
    <View>
    <Text style={[styles.label,{color: theme.foreground}]}>Anexo (opcional)</Text>
    <View
      style={[[styles.box,{borderColor:theme.border, backgroundColor:theme.card}], selected && {borderColor:theme.primary}]}
    >
      {imageUri && isImage ? (
        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.previewImage}
            resizeMode="cover"
          />
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              onPress={onRemove}
              style={[styles.actionButtonOutline, { backgroundColor: theme.card, borderColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={onViewFull}
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, { color: theme.primaryForeground }]}>Ver maior</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : imageUri && !isImage ? (
        <View style={styles.fileContainer}>
          <Text style={[styles.fileNameOnlyText, {color: theme.primary}]} numberOfLines={3}>
            {fileName}
          </Text>
          <TouchableOpacity 
            onPress={onRemove}
            style={[styles.removeButtonFull, { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 1 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.actionButtonText, { color: theme.primary }]}>Remover</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={styles.uploadArea}
        >
          <UploadIcon color={theme.mutedForeground} style={{ marginBottom: 8 }} />
          <Text style={[styles.text,{color:theme.foreground}]}>
            Clique aqui para selecionar
          </Text>
        </TouchableOpacity>
      )}
    </View>
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
    minHeight: 120,
  },
  uploadArea: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  previewContainer: {
    width: "100%",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 6,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonOutline: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  fileContainer: {
    width: "100%",
    alignItems: "center",
  },
  fileNameOnlyText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  removeButtonFull: {
    width: "100%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});