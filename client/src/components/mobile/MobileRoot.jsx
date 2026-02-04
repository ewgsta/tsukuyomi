import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, Text, ActivityIndicator } from 'react-native';
import { MobileHome } from './MobileHome';
import { MobilePlayerBar } from './MobilePlayerBar';
import { MobileBottomBar } from './MobileBottomBar';
import { COLORS } from './MobileTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const MobileRoot = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [serverUrl, setServerUrl] = useState('http://localhost:8000'); // Default for emulator
    const [isLoading, setIsLoading] = useState(true);

    // Load Settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedUrl = await AsyncStorage.getItem('serverUrl');
                if (savedUrl) setServerUrl(savedUrl);
            } catch (e) {
                console.log('Failed to load settings');
            }
        };
        loadSettings();
    }, []);

    const API_URL = `${serverUrl}/api/v1`;

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch(`${API_URL}/music/search?q=a&limit=100`);
                const data = await res.json();
                setTracks(data);

                // Group into albums
                const groups = {};
                data.forEach(track => {
                    if (track.album_id && track.has_cover) {
                        if (!groups[track.album_id]) {
                            groups[track.album_id] = {
                                id: track.album_id,
                                title: track.album,
                                artist: track.artist || 'Bilinmeyen Sanatçı',
                                cover: `${API_URL}/music/cover/${track.album_id}`,
                                tracks: []
                            };
                        }
                        groups[track.album_id].tracks.push(track);
                    }
                });
                setAlbums(Object.values(groups));

            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [serverUrl]);

    // Audio Playback
    async function playSound(track) {
        if (!track) return;

        // Unload previous
        if (sound) {
            await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: `${API_URL}/music/stream/${track.id}` },
            { shouldPlay: true }
        );

        setSound(newSound);
        setCurrentTrack(track);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
                setIsPlaying(false);
                // Auto play next logic could go here
            }
        });

        await newSound.playAsync();
    }

    const togglePlay = async () => {
        if (!sound) {
            if (currentTrack) playSound(currentTrack);
            return;
        }
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);


    return (
        <View style={styles.container}>
            {/* Background Gradient */}
            <LinearGradient
                colors={['#1a1a1a', '#000000']}
                style={StyleSheet.absoluteFill}
            />
            <StatusBar barStyle="light-content" />

            <SafeAreaView style={styles.safeArea}>
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={{ color: COLORS.textSecondary, marginTop: 10 }}>Bağlanıyor: {serverUrl}</Text>
                    </View>
                ) : (
                    <>
                        {activeTab === 'home' && (
                            <MobileHome
                                albums={albums}
                                tracks={tracks}
                                onAlbumPress={(album) => console.log('Album press not impl', album.title)}
                                onTrackPress={playSound}
                            />
                        )}

                        {activeTab === 'search' && (
                            <View style={styles.center}>
                                <Text style={{ color: COLORS.text }}>Arama (Yakında)</Text>
                            </View>
                        )}
                    </>
                )}
            </SafeAreaView>

            {/* Floating Elements */}
            {currentTrack && (
                <MobilePlayerBar
                    currentTrack={{
                        ...currentTrack,
                        // Fix cover url using absolute path for mobile
                        cover: currentTrack.has_cover
                            ? `${API_URL}/music/cover/${currentTrack.album_id}`
                            : `${API_URL}/music/track-cover/${currentTrack.id}`
                    }}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    progress={0.3} // TODO: Link to real progress status
                />
            )}

            <MobileBottomBar
                activeTab={activeTab}
                onTabPress={setActiveTab}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
