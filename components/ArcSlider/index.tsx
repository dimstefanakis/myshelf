import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Text } from '@/components/Themed';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from 'react-native-reanimated';

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
  endAngle = 270,
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
  const scale = useSharedValue(1);

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
    const largeArcFlag = Math.abs(end - start) <= 180 ? 0 : 1;
    const sweepFlag = end >= start ? 1 : 0;

    return `M ${startPoint.x} ${startPoint.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${endPoint.x} ${endPoint.y}`;
  }, [polarToCartesian, radius]);

  const angleToValue = useCallback((angle: number) => {
    'worklet';
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

  // Create the gesture handler
  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      'worklet';
      scale.value = withSpring(1.3);
      runOnJS(setIsPressed)(true);
    })
    .onUpdate((event) => {
      'worklet';
      if (disabled) return;

      const dx = event.x - center;
      const dy = event.y - center;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      
      if (angle < startAngle) {
        angle += 360;
      }
      
      if (angle >= startAngle && angle <= endAngle) {
        const newValue = Math.floor(angleToValue(angle));
        
        if (minLock !== undefined && newValue < minLock) {
          if (currentValue !== minLock) {
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
            runOnJS(setCurrentValue)(minLock);
            if (onChange) runOnJS(onChange)(minLock);
          }
          return;
        }

        if (newValue !== currentValue) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
          runOnJS(setCurrentValue)(newValue);
          if (onChange) runOnJS(onChange)(newValue);
        }
      }
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
      runOnJS(setIsPressed)(false);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const currentAngle = valueToAngle(currentValue);
  const arcPath = createArcPath(startAngle, currentAngle);
  const trackPath = createArcPath(startAngle, endAngle);
  const thumbPosition = polarToCartesian(currentAngle);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Svg width={size} height={size}>
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
          <Animated.View style={animatedStyle}>
            <Circle
              cx={thumbPosition.x}
              cy={thumbPosition.y}
              r={strokeWidth / 2}
              fill={thumbColor}
            />
          </Animated.View>
          {/* Inner dot on thumb */}
          <Circle
            cx={thumbPosition.x}
            cy={thumbPosition.y}
            r={strokeWidth / 6}
            fill="#FFF"
          />
        </Svg>
      </GestureDetector>
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
