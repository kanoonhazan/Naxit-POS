import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View, Dimensions} from 'react-native';
import {theme} from '../theme';

const {height} = Dimensions.get('window');

interface IntroScreenProps {
  onAnimationComplete?: () => void;
}

export function IntroScreen({onAnimationComplete}: IntroScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const exitAnim = useRef(new Animated.Value(1)).current;
  const dotScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Sequence of intro animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Start pulse animation after intro
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotScale, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [fadeAnim, slideAnim, scaleAnim, dotScale]);

  // We expose a "triggerExit" method or just let App.tsx control visibility
  // For simplicity, we'll let App.tsx unmount it, but we can also handle exit here if needed.
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { opacity: exitAnim }
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          }}
        >
          <Text style={styles.logoText}>NAXIT</Text>
        </Animated.View>
        
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          }}
        >
          <Text style={styles.subtitle}>POINT OF SALE</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.dot, 
            { 
              opacity: fadeAnim,
              transform: [{scale: dotScale}]
            }
          ]} 
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: 4,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.accent,
    marginTop: theme.spacing.xl,
  },
});
