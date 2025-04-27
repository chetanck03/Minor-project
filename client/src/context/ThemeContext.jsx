import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Check if media query and localStorage are available
  const isMediaQuerySupported = typeof window !== 'undefined' && typeof window.matchMedia === 'function';
  const isLocalStorageAvailable = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  
  // Initialize dark mode based on system preference or stored value
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Default to false (light mode) if browser APIs aren't available
    if (!isMediaQuerySupported || !isLocalStorageAvailable) return false;
    
    // Check for stored preference
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme) {
      // Use stored preference if available
      return storedTheme === 'dark';
    } else {
      // Otherwise use system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Listen for system theme changes
  useEffect(() => {
    if (!isMediaQuerySupported) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    
    // Add event listener with newer API if available, fall back to older API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }
    
    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [isMediaQuerySupported]);

  // Apply theme to document
  useEffect(() => {
    if (!isLocalStorageAvailable) return;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, isLocalStorageAvailable]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const setLightMode = () => {
    setIsDarkMode(false);
  };
  
  const setDarkMode = () => {
    setIsDarkMode(true);
  };

  const value = {
    isDarkMode,
    toggleTheme,
    setLightMode,
    setDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 