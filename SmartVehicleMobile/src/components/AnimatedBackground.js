import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const NUM_ICONS = 18;

const VEHICLE_ICONS = ['🚗', '🚙', '🏎', '🚕', '🚓', '🚐', '🚌', '🚑'];

function rand(a, b) {
    return a + Math.random() * (b - a);
}

const FloatingIcon = () => {
    const posX = useRef(new Animated.Value(rand(0, width))).current;
    const posY = useRef(new Animated.Value(rand(0, height))).current;
    const opacity = useRef(new Animated.Value(rand(0.1, 0.4))).current;
    const rotate = useRef(new Animated.Value(rand(-30, 30))).current;

    const icon = VEHICLE_ICONS[Math.floor(Math.random() * VEHICLE_ICONS.length)];
    const size = rand(14, 28);
    const dur = rand(6000, 14000);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(posX, { toValue: rand(0, width), duration: dur, useNativeDriver: true }),
                Animated.timing(posX, { toValue: rand(0, width), duration: dur, useNativeDriver: true }),
                Animated.timing(posX, { toValue: rand(0, width), duration: dur, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(posY, { toValue: rand(0, height), duration: dur * 1.4, useNativeDriver: true }),
                Animated.timing(posY, { toValue: rand(0, height), duration: dur * 1.4, useNativeDriver: true }),
                Animated.timing(posY, { toValue: rand(0, height), duration: dur * 1.4, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: rand(0.4, 0.7), duration: dur * 0.5, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: rand(0.05, 0.2), duration: dur * 0.5, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(rotate, { toValue: rand(-45, 45), duration: dur * 0.7, useNativeDriver: true }),
                Animated.timing(rotate, { toValue: rand(-45, 45), duration: dur * 0.7, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const rotation = rotate.interpolate({ inputRange: [-45, 45], outputRange: ['-45deg', '45deg'] });

    return (
        <Animated.Text
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                fontSize: size,
                opacity,
                transform: [{ translateX: posX }, { translateY: posY }, { rotate: rotation }],
            }}
        >
            {icon}
        </Animated.Text>
    );
};

const AnimatedBackground = ({
    colors = ['#0f0c29', '#1a1a2e', '#16213e'],
    particleColor = '#8b5cf6',
}) => {
    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <LinearGradient
                colors={colors}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {Array.from({ length: NUM_ICONS }).map((_, i) => (
                <FloatingIcon key={i} />
            ))}
        </View>
    );
};

export default AnimatedBackground;
