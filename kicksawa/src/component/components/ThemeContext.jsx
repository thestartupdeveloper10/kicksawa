import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'theme';

/**
 * Read the theme the inline bootstrap script in index.html already applied.
 * Initialising from the DOM rather than from a default keeps the first React
 * paint identical to the pre-hydration paint, so there is no flash.
 */
const readInitialTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    // `class` drives every Tailwind `dark:` variant. `data-theme` is kept for
    // any plain CSS still selecting on it.
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', theme);

    // Tells the UA to render native controls, scrollbars and form widgets in
    // the matching scheme. Without it scrollbars stay white on a black page.
    root.style.colorScheme = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private mode / storage disabled — theme just won't persist.
    }
  }, [theme]);

  // Keep tabs in sync when the toggle is used in another window.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        setTheme(event.newValue === 'dark' ? 'dark' : 'light');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, isDark: theme === 'dark' }),
    [theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
