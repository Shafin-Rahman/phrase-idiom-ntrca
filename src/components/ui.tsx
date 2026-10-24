import React from 'react';
import {
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { AppTheme } from '../theme';

export function Card({
  children,
  style,
  theme,
  elevation = 2,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  theme: AppTheme;
  elevation?: number;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          shadowOpacity: theme.dark ? 0.3 : 0.08,
          elevation,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function BadgeChip({
  text,
  textColor,
  bgColor,
  style,
}: {
  text: string;
  textColor: string;
  bgColor: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{text}</Text>
    </View>
  );
}

export function ProgressBar({
  progress,
  color,
  trackColor,
  height = 6,
}: {
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View
      style={[
        styles.progressTrack,
        { backgroundColor: trackColor, height, borderRadius: height / 2 },
      ]}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export function SectionTitle({
  children,
  theme,
  style,
}: {
  children: React.ReactNode;
  theme: AppTheme;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[styles.sectionTitle, { color: theme.onSurface }, style]}>
      {children}
    </Text>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  theme,
  variant = 'category',
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
  variant?: 'category' | 'quick' | 'small';
  style?: StyleProp<ViewStyle>;
}) {
  const isQuick = variant === 'quick';
  const isSmall = variant === 'small';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? isQuick
              ? theme.primaryContainer
              : theme.primary
            : isQuick
              ? withAlpha(theme.surfaceVariant, 0.5)
              : theme.surface,
          borderColor: selected
            ? isQuick
              ? theme.primary
              : theme.primary
            : isQuick
              ? 'transparent'
              : withAlpha(theme.outline, 0.25),
          borderWidth: selected || !isQuick ? 1 : 0,
          opacity: pressed ? 0.7 : 1,
          paddingHorizontal: isSmall ? 9 : 12,
          paddingVertical: isSmall ? 5 : 7,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: isSmall ? 11 : 12,
          fontWeight: selected ? '700' : '500',
          color: selected
            ? isQuick
              ? theme.primary
              : '#FFFFFF'
            : isQuick
              ? theme.onSurfaceVariant
              : theme.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function AlphaChip({
  label,
  selected,
  onPress,
  theme,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  theme: AppTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderRadius: 8,
        backgroundColor: selected
          ? theme.primary
          : withAlpha(theme.surfaceVariant, 0.5),
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginVertical: 2,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: selected ? '700' : '500',
          color: selected ? '#FFFFFF' : theme.onSurface,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Dialog({
  visible,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onCancel,
  theme,
  danger = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  theme: AppTheme;
  danger?: boolean;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={dialogStyles.root}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel ?? onConfirm}
        />
        <View style={[dialogStyles.card, { backgroundColor: theme.surface }]}>
          <Text style={[dialogStyles.title, { color: theme.onSurface }]}>
            {title}
          </Text>
          <Text style={[dialogStyles.message, { color: theme.onSurfaceVariant }]}>
            {message}
          </Text>
          <View style={dialogStyles.actions}>
            {cancelLabel && onCancel ? (
              <Pressable onPress={onCancel} style={dialogStyles.textButton}>
                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                  {cancelLabel}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onConfirm}
              style={[
                dialogStyles.confirmButton,
                { backgroundColor: danger ? theme.error : theme.primary },
              ]}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function PressableScale({
  children,
  onPress,
  style,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [style, { opacity: pressed ? 0.75 : 1 }]}
    >
      {children}
    </Pressable>
  );
}

export const withAlpha = (hex: string, alpha: number): string => {
  const clean = hex.replace('#', '');
  if (clean.length === 6) {
    const value = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${clean}${value}`;
  }
  return hex;
};

const dialogStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  textButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  confirmButton: {
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
});

export const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    width: '100%',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chip: {
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
