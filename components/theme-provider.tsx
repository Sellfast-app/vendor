'use client';

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from 'next-themes';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { themes, ThemeName } from '@/lib/themes';

type CustomThemeProviderProps = ThemeProviderProps & {
  children: React.ReactNode;
};

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<ThemeName>('surge-green');
  const pathname = usePathname();

  useEffect(() => {
    const isDashboardRoute = ['/dashboard', '/products', '/orders', '/analytics', '/payouts', '/settings'].some(route => pathname.startsWith(route));

    const syncTheme = () => {
      if (!isDashboardRoute) {
        setUserTheme('surge-green');
        return;
      }

      const storedTheme = localStorage.getItem('colorScheme') as ThemeName;
      if (storedTheme && themes[storedTheme]) {
        setUserTheme(storedTheme);
      } else {
        setUserTheme('surge-green');
      }
    };

    syncTheme();
    window.addEventListener('themeChange', syncTheme);
    window.addEventListener('storage', syncTheme);

    return () => {
      window.removeEventListener('themeChange', syncTheme);
      window.removeEventListener('storage', syncTheme);
    };
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[userTheme];
    const mode = root.classList.contains('dark') ? 'dark' : 'light';
    root.style.setProperty('--primary', theme[mode].primary);
    root.style.setProperty('--primary-secondary', theme[mode].secondary);
    root.style.setProperty('--primary-tertiary', theme[mode].tertiary);
  }, [userTheme]);

  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
