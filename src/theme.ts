import { useColorScheme } from 'react-native';

import {
  AmberAccent,
  BackgroundDark,
  BackgroundLight,
  ErrorRose,
  IndigoLight,
  IndigoPrimary,
  IndigoPrimaryVariant,
  SkySecondary,
  SuccessGreen,
  SuccessGreenLight,
  ErrorRoseLight,
  AmberGold,
  SurfaceDark,
  SurfaceLight,
  SurfaceVariantDark,
  SurfaceVariantLight,
  TextPrimaryDark,
  TextPrimaryLight,
  TextSecondaryDark,
  TextSecondaryLight,
} from './colors';

export {
  AmberAccent,
  AmberGold,
  ErrorRose,
  ErrorRoseLight,
  IndigoLight,
  IndigoPrimary,
  IndigoPrimaryVariant,
  SkySecondary,
  SuccessGreen,
  SuccessGreenLight,
};

export interface AppTheme {
  dark: boolean;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  tertiary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;
  error: string;
  outline: string;
}

const lightTheme: AppTheme = {
  dark: false,
  primary: IndigoPrimary,
  onPrimary: '#FFFFFF',
  primaryContainer: IndigoLight,
  onPrimaryContainer: IndigoPrimaryVariant,
  secondary: SkySecondary,
  onSecondary: '#FFFFFF',
  tertiary: AmberAccent,
  background: BackgroundLight,
  surface: SurfaceLight,
  surfaceVariant: SurfaceVariantLight,
  onBackground: TextPrimaryLight,
  onSurface: TextPrimaryLight,
  onSurfaceVariant: TextSecondaryLight,
  error: ErrorRose,
  outline: '#CBD5E1',
};

const darkTheme: AppTheme = {
  dark: true,
  primary: '#818CF8',
  onPrimary: '#0F172A',
  primaryContainer: '#312E81',
  onPrimaryContainer: '#E0E7FF',
  secondary: '#38BDF8',
  onSecondary: '#0C4A6E',
  tertiary: AmberGold,
  background: BackgroundDark,
  surface: SurfaceDark,
  surfaceVariant: SurfaceVariantDark,
  onBackground: TextPrimaryDark,
  onSurface: TextPrimaryDark,
  onSurfaceVariant: TextSecondaryDark,
  error: ErrorRose,
  outline: '#475569',
};

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
