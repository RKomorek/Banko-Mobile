/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: "#ffffff",
    foreground: "#24243a",
    card: "#ffffff",
    cardForeground: "#24243a",
    popover: "#ffffff",
    popoverForeground: "#24243a",
    primary: "#e11d48",
    primaryForeground: "#fff5f0",
    secondary: "#f7f7fa",
    secondaryForeground: "#36364a",
    muted: "#f7f7fa",
    mutedForeground: "#8c8ca1",
    accent: "#f7f7fa",
    accentForeground: "#36364a",
    destructive: "#dc2626",
    constructive: "#1a9447ff",
    border: "#e0e0e6",
    input: "#e0e0e6",
    ring: "#e11d48",
    chart1: "#f7b267",
    chart2: "#5ec2e7",
    chart3: "#5a6ee6",
    chart4: "#f7e967",
    chart5: "#e6c35a",
    sidebar: "#fafafd",
    sidebarForeground: "#24243a",
    sidebarPrimary: "#e11d48",
    sidebarPrimaryForeground: "#fff5f0",
    sidebarAccent: "#f3f3fa",
    sidebarAccentForeground: "#24243a",
    sidebarBorder: "#e0e0e6",
    sidebarRing: "#e11d48",
    black: "#000000",
  },
  dark: {
    background: "#24243a",
    foreground: "#fafafd",
    card: "#36364a",
    cardForeground: "#fafafd",
    popover: "#36364a",
    popoverForeground: "#fafafd",
    primary: "#e11d48",
    primaryForeground: "#fff5f0",
    secondary: "#47475a",
    secondaryForeground: "#fafafd",
    muted: "#47475a",
    mutedForeground: "#bcbcd1",
    accent: "#47475a",
    accentForeground: "#fafafd",
    destructive: "#dc2626",
    constructive: "#1a9447ff",
    border: "#ffffff1a", // branco com 10% de opacidade
    input: "#ffffff26",  // branco com 15% de opacidade
    ring: "#e11d48",
    chart1: "#7c5fe6",
    chart2: "#5ec2e7",
    chart3: "#e6c35a",
    chart4: "#b267f7",
    chart5: "#f7b267",
    sidebar: "#36364a",
    sidebarForeground: "#fafafd",
    sidebarPrimary: "#e11d48",
    sidebarPrimaryForeground: "#fff5f0",
    sidebarAccent: "#47475a",
    sidebarAccentForeground: "#fafafd",
    sidebarBorder: "#ffffff1a",
    sidebarRing: "#e11d48",
    black: "#000000",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Lato, sans-serif",
  },
  default: {
    sans: "Lato, sans-serif",
  },
});
