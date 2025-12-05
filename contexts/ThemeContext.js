// contexts/ThemeContext.js
// Contexto para manejar el tema (claro/oscuro) de la aplicación
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  const theme = {
    // Colores principales
    primary: isDark ? '#B22222' : '#8B0000',
    primaryLight: isDark ? '#8B0000' : '#6B0000',
    primaryDark: isDark ? '#6B0000' : '#4A0000',
    
    // Fondos
    background: isDark ? '#121212' : '#F8F9FA',
    surface: isDark ? '#1E1E1E' : '#FFFFFF',
    surfaceVariant: isDark ? '#2C2C2C' : '#FFFAF0',
    
    // Textos
    text: isDark ? '#FFFFFF' : '#1A1A1A',
    textSecondary: isDark ? '#B0B0B0' : '#6E6E73',
    textTertiary: isDark ? '#808080' : '#8E8E93',
    
    // Bordes
    border: isDark ? '#3A3A3A' : '#F5DEB3',
    borderLight: isDark ? '#2C2C2C' : '#E5E5EA',
    
    // Estados
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
    
    // Tarjetas de prioridad
    priorityHigh: isDark ? '#8B0000' : '#8B0000',
    priorityMedium: isDark ? '#FF8C00' : '#FF9500',
    priorityLow: isDark ? '#4682B4' : '#5856D6',
    
    // Overlay
    overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
    card: isDark ? '#252525' : '#FFFFFF',
    
    // Sombras (se ajustan automáticamente)
    shadowColor: isDark ? '#000000' : '#000000',
    
    // Iconos
    icon: isDark ? '#FFFFFF' : '#8B0000',
    iconInactive: isDark ? '#808080' : '#8E8E93',
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
