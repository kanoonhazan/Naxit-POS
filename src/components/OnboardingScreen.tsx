import React, {useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import {theme} from '../theme';
import {Button} from './Primitives';

const {width, height} = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Streamline Your Sales',
    description: 'Process checkouts in seconds with an intuitive, touch-optimized point of sale interface.',
    color: theme.colors.primary,
  },
  {
    id: '2',
    title: 'Powerful Reporting',
    description: 'Get real-time insights into your revenue, top products, and inventory levels anytime.',
    color: theme.colors.accent,
  },
  {
    id: '3',
    title: 'Secure & Offline',
    description: 'Your data stays on your device. Work without internet and keep your business private.',
    color: theme.colors.success,
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / width);
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const renderSlide = ({item}: {item: typeof SLIDES[0]}) => (
    <View style={styles.slide}>
      <View style={[styles.imagePlaceholder, {backgroundColor: item.color + '15'}]}>
        <View style={[styles.circle, {backgroundColor: item.color}]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={item => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index ? styles.activeDot : null,
              ]}
            />
          ))}
        </View>

        <Button
          label={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
        />
        
        {activeIndex < SLIDES.length - 1 && (
          <Button
            label="Skip"
            onPress={onComplete}
            variant="ghost"
            compact
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.panel,
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  imagePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.ink,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
});
