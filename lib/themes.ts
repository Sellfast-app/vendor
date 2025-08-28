// lib/themes.ts
export type ThemeName = 'surge-green' | 'ocean-blue' | 'purple-elegance' | 'sunset-orange';

export const themes: Record<
  ThemeName,
  {
    light: { primary: string; secondary: string; tertiary: string };
    dark: { primary: string; secondary: string; tertiary: string };
  }
> = {
  'surge-green': {
    light: {
      primary: '#4FCA6A', // Main green
      secondary: '#45B862', // Lighter green (mixed with white)
      tertiary: '#D1FFDB', // Very light green
    },
    dark: {
      primary: '#3BA65A', // Darker green (mixed with black)
      secondary: '#2F8A4A', // Even darker green
      tertiary: '#1A4B2A', // Darkest green
    },
  },
  'ocean-blue': {
    light: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      tertiary: '#E7F2FF',
    },
    dark: {
      primary: '#1D4ED8',
      secondary: '#1E40AF',
      tertiary: '#1E3A8A',
    },
  },
  'purple-elegance': {
    light: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      tertiary: '#EDE8FF',
    },
    dark: {
      primary: '#6D28D9',
      secondary: '#5B21B6',
      tertiary: '#4C1D95',
    },
  },
  'sunset-orange': {
    light: {
      primary: '#F97316',
      secondary: '#EA580C',
      tertiary: '#FFEDD5',
    },
    dark: {
      primary: '#DC2626',
      secondary: '#B91C1C',
      tertiary: '#991B1B',
    },
  },
};