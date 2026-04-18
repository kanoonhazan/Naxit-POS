import { useColorScheme } from 'react-native';
import { useSettingsStore } from './stores/useSettingsStore';

const lightColors = {
  background: '#EEF2F6',
  panel: '#FFFFFF',
  panelMuted: '#F7F9FC',
  border: '#D6DEE8',
  ink: '#112033',
  muted: '#66758A',
  primary: '#173A63',
  primarySoft: '#DDE8F7',
  success: '#138A54',
  successSoft: '#DDF5E8',
  warning: '#C88A14',
  warningSoft: '#FFF2D9',
  danger: '#C44536',
  dangerSoft: '#FCE3DF',
  accent: '#0A6E6E',
  accentSoft: '#D9F0F0',
  black: '#0B1522',
};

const darkColors = {
  background: '#080C12',
  panel: '#101217',
  panelMuted: '#161920',
  border: '#2A2A2A',
  ink: '#F8F9FA',
  muted: '#808080',
  primary: '#3B82F6', // More vibrant neutral blue
  primarySoft: '#181818',
  success: '#22C55E',
  successSoft: '#064E3B',
  warning: '#F59E0B',
  warningSoft: '#451A03',
  danger: '#EF4444',
  dangerSoft: '#450A0A',
  accent: '#14B8A6',
  accentSoft: '#134E4A',
  black: '#000000',
};

const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

const shadow = {
  shadowColor: '#000000',
  shadowOpacity: 0.1,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 6,
  },
  elevation: 2,
};

export const theme = {
  colors: lightColors,
  spacing,
  radius,
  shadow,
};

export function useAppTheme() {
  const systemScheme = useColorScheme();
  const settings = useSettingsStore(state => state.settings);

  const themeMode = settings?.themeMode ?? 'system';
  const isDark = themeMode === 'system' ? systemScheme === 'dark' : themeMode === 'dark';

  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    spacing,
    radius,
    shadow,
    isDark,
  };
}
