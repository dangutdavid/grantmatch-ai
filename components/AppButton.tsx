import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { brand } from '@/constants/brand';

interface AppButtonProps {
  title: string;
  disabled?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function AppButton({ title, disabled = false, onPress, variant = 'primary', style }: AppButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, styles[variant], disabled && styles.disabled, style]}>
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText, disabled && styles.disabledText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  primary: {
    backgroundColor: brand.colors.primary,
    borderColor: brand.colors.primary,
  },
  secondary: {
    backgroundColor: brand.colors.surface,
    borderColor: brand.colors.subtle,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  disabled: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: brand.colors.ink,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});
