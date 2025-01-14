import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Text } from '@/components/Themed';

interface ArcSliderProps {
  size?: number;
  strokeWidth?: number;
  startAngle?: number;
  endAngle?: number;
  min?: number;
  max?: number;
  value: number;
  minLock?: number;
  onChange?: (value: number) => void;
  thumbColor?: string;
  trackColor?: string;
  progressColor?: string;
  backgroundColor?: string;
  disabled?: boolean;
  step?: number;
  description?: string;
  isDisabled?: boolean;
}

export default function ArcSlider({
  size = 200,
  strokeWidth = 20,
  startAngle = -90,
  endAngle = 90,
  min = 0,
  max = 100,
  value,
  minLock,
  onChange,
  thumbColor = '#CD8B65',
  trackColor = '#E5E5E5',
  progressColor = '#CD8B65',
  backgroundColor = '#F5F5F5',
  disabled = false,
  step = 10,
  description = '',
}: ArcSliderProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isPressed, setIsPressed] = useState(false);
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const animatedScale = new Animated.Value(1);

  // Calculate step points
  const stepPoints = Array.from(
    { length: Math.floor((max - min) / step) + 1 }, 
    (_, i) => {
      const value = min + i * step;
      return value <= max ? value : null;  // Ensure we don't exceed max
    }
  ).filter(value => value !== null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const polarToCartesian = useCallback((angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians),
    };
  }, [center, radius]);

  const createArcPath = useCallback((start: number, end: number) => {
    const startPoint = polarToCartesian(start);
    const endPoint = polarToCartesian(end);
    const largeArcFlag = end - start <= 180 ? 0 : 1;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  }, [polarToCartesian, radius]);

  const angleToValue = useCallback((angle: number) => {
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    const angleRange = endAngle - startAngle;
    const valueRange = max - min;
    return min + (normalizedAngle / angleRange) * valueRange;
  }, [startAngle, endAngle, min, max]);

  const valueToAngle = useCallback((value: number) => {
    const angleRange = endAngle - startAngle;
    const valueRange = max - min;
    return startAngle + ((value - min) / valueRange) * angleRange;
  }, [startAngle, endAngle, min, max]);

  const animateThumb = (pressed: boolean) => {
    Animated.spring(animatedScale, {
      toValue: pressed ? 1.3 : 1,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsPressed(true);
      animateThumb(true);
    },
    onPanResponderRelease: () => {
      setIsPressed(false);
      animateThumb(false);
    },
    onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      event.preventDefault();
      event.stopPropagation();
      if (disabled) return;

      const { locationX, locationY } = event.nativeEvent;
      const dx = locationX - center;
      const dy = locationY - center;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      
      const normalizedAngle = angle < startAngle ? angle + 360 : angle;
      if (normalizedAngle >= startAngle && normalizedAngle <= endAngle) {
        const newValue = Math.floor(angleToValue(normalizedAngle));
        
        if (minLock !== undefined && newValue < minLock) {
          if (currentValue !== minLock) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setCurrentValue(minLock);
            onChange?.(minLock);
          }
          return;
        }

        if (newValue !== currentValue) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCurrentValue(newValue);
          onChange?.(newValue);
        }
      }
    },
  });

  const currentAngle = valueToAngle(currentValue);
  const arcPath = createArcPath(startAngle, currentAngle);
  const trackPath = createArcPath(startAngle, endAngle);
  const thumbPosition = polarToCartesian(currentAngle);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} {...panResponder.panHandlers}>
        {/* Background Circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius + strokeWidth / 2}
          fill={backgroundColor}
        />
        {/* Track */}
        <Path
          d={trackPath}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress */}
        <Path
          d={arcPath}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Step Markers */}
        {stepPoints.map((stepValue) => {
          const stepAngle = valueToAngle(stepValue);
          const stepPos = polarToCartesian(stepAngle);
          const isActive = stepValue <= currentValue;
          return (
            <Circle
              key={stepValue}
              cx={stepPos.x}
              cy={stepPos.y}
              r={3}
              fill={isActive ? progressColor : trackColor}
            />
          );
        })}
        {/* Thumb */}
        <AnimatedCircle
          cx={thumbPosition.x}
          cy={thumbPosition.y}
          r={strokeWidth / 2}
          fill={thumbColor}
          scale={animatedScale}
        />
        {/* Inner dot on thumb */}
        <Circle
          cx={thumbPosition.x}
          cy={thumbPosition.y}
          r={strokeWidth / 6}
          fill="#FFF"
        />
      </Svg>
      <Text style={styles.valueText}>
        {Math.max(min, Math.min(max, Math.round(currentValue)))}
      </Text>
      <Text style={styles.descriptionText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionText: {
    position: 'absolute',
    paddingTop: 50,
    maxWidth: 100,
    textAlign: 'center',
    fontSize: 12,
    color: '#808080',
  },
});
