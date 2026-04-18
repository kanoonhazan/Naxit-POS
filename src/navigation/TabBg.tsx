import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TabBgProps {
  color?: string;
  width?: number;
}

const TAB_BAR_HEIGHT = 82;
const NOTCH_WIDTH = 110;
const NOTCH_HEIGHT = 45;

export function TabBg({ color = '#FFFFFF', width = 0 }: TabBgProps) {
  // SVG path for a notched bottom bar
  // We use Bézier curves for the smooth "dip"
  const d = `
    M 0 20
    C 0 8.954 8.954 0 20 0
    H ${width / 2 - NOTCH_WIDTH / 2}
    C ${width / 2 - NOTCH_WIDTH / 3} 0 ${width / 2 - NOTCH_WIDTH / 4} ${NOTCH_HEIGHT} ${width / 2} ${NOTCH_HEIGHT}
    C ${width / 2 + NOTCH_WIDTH / 4} ${NOTCH_HEIGHT} ${width / 2 + NOTCH_WIDTH / 3} 0 ${width / 2 + NOTCH_WIDTH / 2} 0
    H ${width - 20}
    C ${width - 8.954} 0 ${width} 8.954 ${width} 20
    V ${TAB_BAR_HEIGHT}
    H 0
    Z
  `;

  return (
    <View style={styles.container}>
      <Svg width={width} height={TAB_BAR_HEIGHT}>
        <Path d={d} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: TAB_BAR_HEIGHT,
  },
});
