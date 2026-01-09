import { StyleSheet, Text, TextProps, View, ViewProps } from "react-native";

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

export function CardHeader({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.cardHeader, style]} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({ style, children, ...props }: TextProps) {
  return (
    <Text style={[styles.cardTitle, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardDescription({ style, children, ...props }: TextProps) {
  return (
    <Text style={[styles.cardDescription, style]} {...props}>
      {children}
    </Text>
  );
}

export function CardAction({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.cardAction, style]} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.cardContent, style]} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.cardFooter, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderColor: "#e5e5e5",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: "column",
    gap: 12,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  cardTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: "#111",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  cardAction: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  cardContent: {
    paddingHorizontal: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
  },
});
