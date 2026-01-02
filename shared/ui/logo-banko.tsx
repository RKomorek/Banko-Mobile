import { Colors } from "@/shared/constants/theme";
import React from "react";
import { Image, ImageProps, useColorScheme } from "react-native";

type LogoBankoProps = {
  variant?: "icon" | "full";
  size?: number;
  style?: ImageProps["style"];
};

export function LogoBanko({ variant = "icon", size = 64, style }: LogoBankoProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  let source;
  if (variant === "icon") {
    source =
      colorScheme === "dark"
        ? require("@/assets/logo/logo-icon-dark.svg")
        : require("@/assets/logo/logo-icon-light.svg");
  } else {
    source =
      colorScheme === "dark"
        ? require("@/assets/logo/logo-banko-full-dark.webp")
        : require("@/assets/logo/logo-banko-full-light.webp");
  }

  return (
    <Image
      source={source}
      style={[
        { width: size, height: size, resizeMode: "contain" },
        style,
      ]}
      accessibilityLabel="Logo Banko"
    />
  );
}
