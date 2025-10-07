import { Colors } from "@/constants/theme";
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
        ? require("../../assets/images/logo-icon-dark.png")
        : require("../../assets/images/logo-icon-light.png");
  } else {
    source =
      colorScheme === "dark"
        ? require("../../assets/images/logo-full-dark.png")
        : require("../../assets/images/logo-full-light.png");
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
