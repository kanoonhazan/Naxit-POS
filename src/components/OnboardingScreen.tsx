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
import {useAppTheme} from '../theme';
import {Button} from './Primitives';

const {width, height} = Dimensions.get('window');

export function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const {colors, radius} = useAppTheme();
  
  const SLIDES = [
    {
      id: '1',
      title: 'Streamline Your Sales',
      description: 'Process checkouts in seconds with an intuitive, touch-optimized point of sale interface.',
      color: colors.primary,
    },
    {
      id: '2',
      title: 'Powerful Reporting',
      description: 'Get real-time insights into your revenue, top products, and inventory levels anytime.',
      color: colors.accent,
    },
    {
      id: '3',
      title: 'Secure & Offline',
      description: 'Your data stays on your device. Work without internet and keep your business private.',
      color: colors.success,
    },
  ];

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
      <View style={[styles.imagePlaceholder, {backgroundColor: item.color + '25', borderRadius: radius.lg}]}>
        <View style={[styles.circle, {backgroundColor: item.color}]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, {color: colors.ink}]}>{item.title}</Text>
        <Text style={[styles.description, {color: colors.muted}]}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, {backgroundColor: colors.panel}]}>
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
                { backgroundColor: colors.border, borderRadius: 4 },
                activeIndex === index ? [styles.activeDot, { backgroundColor: colors.primary }] : null,
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
  },
  slide: {
    width,
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  imagePlaceholder: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    opacity: 0.8,
  },
  textContainer: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    gap: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
});
