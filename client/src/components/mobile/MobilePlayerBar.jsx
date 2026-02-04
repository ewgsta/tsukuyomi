import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react-native';
import { MobileGlass } from './MobileGlass';
import { COLORS } from './MobileTheme';

const { width } = Dimensions.get('window');

export const MobilePlayerBar = ({
    currentTrack,
    isPlaying,
    onTogglePlay,
    onNext,
    onPrev,
    progress = 0.4 // 0 to 1
}) => {
    if (!currentTrack) return null;

    return (
        <View style={styles.wrapper}>
            <MobileGlass style={styles.container} intensity={30}>
                {/* Progress Line */}
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>

                <View style={styles.content}>
                    {/* Cover & Info */}
                    <TouchableOpacity style={styles.infoContainer}>
                        <Image
                            source={{ uri: currentTrack.cover || 'https://via.placeholder.com/100' }}
                            style={styles.cover}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
                            <Text style={styles.artist} numberOfLines={1}>{currentTrack.artist}</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.iconBtn} onPress={onTogglePlay}>
                            {isPlaying ?
                                <Pause size={24} color={COLORS.text} fill={COLORS.text} /> :
                                <Play size={24} color={COLORS.text} fill={COLORS.text} />
                            }
                        </TouchableOpacity>
                        {/* Note: Full controls usually in expanded view, kept simple for bar */}
                    </View>
                </View>
            </MobileGlass>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 80, // Above tab bar
        left: 10,
        right: 10,
    },
    container: {
        padding: 0,
        borderRadius: 12,
        backgroundColor: 'rgba(20, 20, 20, 0.85)',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        justifyContent: 'space-between'
    },
    progressBarBg: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    progressBarFill: {
        height: 2,
        backgroundColor: COLORS.primary,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    cover: {
        width: 42,
        height: 42,
        borderRadius: 6,
        backgroundColor: '#333',
    },
    textContainer: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    artist: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingRight: 8
    },
    iconBtn: {
        padding: 4
    }
});
