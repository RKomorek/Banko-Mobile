import React from "react";
import { Image, ImageProps } from "react-native";
import { useThemeContext } from "./theme";

type LogoBankoProps = {
  variant?: "icon" | "full";
  size?: number;
  style?: ImageProps["style"];
};

export function LogoBanko({ variant = "icon", size = 64, style }: LogoBankoProps) {
  const { isDark } = useThemeContext();

  let source;
  if (variant === "icon") {
    source = isDark
      ? require("../../assets/images/logo-icon-dark.png")
      : require("../../assets/images/logo-icon-light.png");
  } else {
    source = isDark
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