// components/SkeletonLoader.js
// Skeleton loader animado para mejorar la percepción de carga
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const pulseAnim = new Animated.Value(0.3);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (type === 'bento') {
    return (
      <View style={styles.bentoContainer}>
        {/* Fila 1: Grande + Mediano */}
        <View style={styles.bentoRow}>
          <Animated.View style={[styles.bentoLarge, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.bentoMedium, { opacity: pulseAnim }]} />
        </View>
        
        {/* Fila 2: 3 pequeños */}
        <View style={styles.bentoRow}>
          <Animated.View style={[styles.bentoSmall, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.bentoSmall, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.bentoSmall, { opacity: pulseAnim }]} />
        </View>
        
        {/* Fila 3: Ancho */}
        <View style={styles.bentoRow}>
          <Animated.View style={[styles.bentoWide, { opacity: pulseAnim }]} />
        </View>
      </View>
    );
  }

  if (type === 'card') {
    return (
      <View style={styles.cardContainer}>
        {[...Array(count)].map((_, index) => (
          <Animated.View
            key={index}
            style={[styles.card, { opacity: pulseAnim }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleSkeleton} />
              <View style={styles.badgeSkeleton} />
            </View>
            <View style={styles.metaSkeleton} />
            <View style={styles.metaSmallSkeleton} />
          </Animated.View>
        ))}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  bentoContainer: {
    gap: 14,
    marginBottom: 32,
  },
  bentoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  bentoLarge: {
    flex: 2,
    minHeight: 180,
    backgroundColor: '#E5E5EA',
    borderRadius: 28,
  },
  bentoMedium: {
    flex: 1,
    minHeight: 180,
    backgroundColor: '#E5E5EA',
    borderRadius: 28,
  },
  bentoSmall: {
    flex: 1,
    minHeight: 140,
    backgroundColor: '#E5E5EA',
    borderRadius: 28,
  },
  bentoWide: {
    flex: 1,
    minHeight: 110,
    backgroundColor: '#E5E5EA',
    borderRadius: 28,
  },
  cardContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFAF0',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F5DEB3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSkeleton: {
    width: '60%',
    height: 20,
    backgroundColor: '#E5E5EA',
    borderRadius: 8,
  },
  badgeSkeleton: {
    width: 70,
    height: 30,
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
  },
  metaSkeleton: {
    width: '80%',
    height: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
    marginBottom: 8,
  },
  metaSmallSkeleton: {
    width: '40%',
    height: 14,
    backgroundColor: '#E5E5EA',
    borderRadius: 6,
  },
});
