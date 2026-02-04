import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES } from './MobileTheme';

export const MobileGlass = ({ children, style, intensity = 20, tint = "dark" }) => {
    return (
        <View style={[styles.container, style]}>
            {/* 
        NOTE: expo-blur works best on iOS. 
        On Android it might need specific setup or fallback to simple opacity. 
        For this 'premium' request, we assume high-end support. 
      */}
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.03)', // Subtle tint
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: SIZES.radius,
    },
    content: {
        // Ensure content sits above the blur
        position: 'relative',
        zIndex: 1,
    }
});
