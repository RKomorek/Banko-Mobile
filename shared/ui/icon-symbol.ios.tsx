import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

const SF_SYMBOL_MAPPING: Record<string, SymbolViewProps['name']> = {
  'house.fill': 'house.fill',
  'paperplane.fill': 'paperplane.fill',
  'chevron.left.forwardslash.chevron.right': 'chevron.left.forwardslash.chevron.right',
  'chevron.right': 'chevron.right',
  'repeat': 'repeat',
  'person': 'person',
  'pencil': 'pencil',
  'list': 'list.bullet',
  'add-card': 'plus.circle.fill',
  'filter': 'line.3.horizontal.decrease.circle',
} as const;

type IconSymbolName = keyof typeof SF_SYMBOL_MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: IconSymbolName;
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const sfSymbolName = SF_SYMBOL_MAPPING[name];
  
  if (!sfSymbolName) {
    console.warn(`SF Symbol não encontrado para: ${name}`);
    return null;
  }

  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={sfSymbolName}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
