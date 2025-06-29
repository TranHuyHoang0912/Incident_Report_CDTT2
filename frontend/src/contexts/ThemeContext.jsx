// src/contexts/ThemeContext.jsx
import React, { createContext, useMemo, useState, useContext, useEffect } from 'react';
import getTheme from '../theme';

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  // Load mode từ localStorage nếu có
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) setMode(savedMode);
  }, []);

  // Đổi theme
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
