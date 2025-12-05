// components/BentoCard.js
// Tarjeta animada para el bento grid con animación de presión
import React, { useRef, memo } from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const BentoCard = memo(function BentoCard({ 
  size = 'large', 
  colors, 
  icon, 
  iconSize = 32,
  title, 
  number, 
  subtitle,
  onPress,
  style
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 3
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 3
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: size === 'small' ? 1 : undefined }}>
      <TouchableOpacity 
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={style}
      >
        <LinearGradient 
          colors={colors} 
          style={size === 'small' ? styles.bentoGradientSmall : styles.bentoGradient}
        >
          {size === 'small' ? (
            <>
              <View style={styles.bentoIconCircleSmall}>
                <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
              </View>
              <Text style={styles.bentoNumberSmall}>{number}</Text>
              <Text style={styles.bentoLabel}>{title}</Text>
            </>
          ) : (
            <>
              <View style={size === 'medium' ? styles.bentoIconCircleMedium : styles.bentoIconCircle}>
                <Ionicons name={icon} size={iconSize} color="#FFFFFF" />
              </View>
              <View style={styles.bentoContent}>
                <Text style={size === 'large' ? styles.bentoTitleLarge : styles.bentoTitleSmall}>
                  {title}
                </Text>
                <Text style={size === 'large' ? styles.bentoNumberLarge : styles.bentoNumberMedium}>
                  {number}
                </Text>
                {subtitle && <Text style={styles.bentoSubtext}>{subtitle}</Text>}
              </View>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = {
  bentoGradient: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6
  },
  bentoGradientSmall: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  bentoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bentoIconCircleMedium: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  bentoIconCircleSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  bentoContent: {
    flex: 1
  },
  bentoTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.3
  },
  bentoTitleSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.2
  },
  bentoNumberLarge: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 52,
    letterSpacing: -1
  },
  bentoNumberMedium: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
    letterSpacing: -0.5
  },
  bentoNumberSmall: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    marginBottom: 4
  },
  bentoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2
  },
  bentoLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.3
  }
};

export default BentoCard;
