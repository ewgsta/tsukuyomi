import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Image,
    TouchableOpacity,
    FlatList,
    StatusBar,
    ActivityIndicator,
    Platform,
    TextInput,
    Modal,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native';
import Slider from '@react-native-community/slider';
import { registerRootComponent } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Home,
    Search,
    Library,
    Play,
    Pause,
    SkipForward,
    SkipBack,
    MoreVertical,
    Clock,
    Settings,
    ChevronDown,
    Repeat,
    Shuffle
} from 'lucide-react-native';


const COLORS = {
    background: '#000000',
    surface: '#121212',
    surfaceLight: '#1E1E1E',
    primary: '#1ed760',
    text: '#FFFFFF',
    textSecondary: '#b3b3b3',
    border: 'rgba(255, 255, 255, 0.08)',
    glassBg: 'rgba(20, 20, 20, 0.7)',
    danger: '#ff4444'
};

const SIZES = {
    padding: 20,
    radius: 16,
    playerHeight: 80,
    bottomBarHeight: 65
};

const { width, height } = Dimensions.get('window');

const MobileGlass = ({ children, style, intensity = 20, tint = "dark" }) => {
    if (Platform.OS === 'android') {
        return (
            <View style={[styles.glassContainer, { backgroundColor: 'rgba(30,30,30,0.95)' }, style]}>
                {children}
            </View>
        );
    }
    return (
        <View style={[styles.glassContainer, style]}>
            <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
            <View style={{ zIndex: 1 }}>{children}</View>
        </View>
    );
};

const AlbumCard = ({ album, onPress, API_URL }) => (
    <TouchableOpacity style={styles.albumCard} onPress={onPress} activeOpacity={0.7}>
        <Image
            source={{ uri: album.cover }}
            style={styles.albumCover}
        />
        <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
    </TouchableOpacity>
);

const SongRow = ({ track, number, onPress, isPlayingCurrent, API_URL }) => (
    <TouchableOpacity style={[styles.songRow, isPlayingCurrent && { backgroundColor: 'rgba(30,215,96,0.1)' }]} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.songNumContainer}>
            {isPlayingCurrent ? (
                <Play size={12} color={COLORS.primary} fill={COLORS.primary} />
            ) : (
                <Text style={[styles.songNum, isPlayingCurrent && { color: COLORS.primary }]}>{number}</Text>
            )}
        </View>
        <Image
            source={{ uri: `${API_URL}/music/track-cover/${track.id}` }}
            style={styles.songCover}
        />
        <View style={styles.songInfo}>
            <Text style={[styles.songTitle, isPlayingCurrent && { color: COLORS.primary }]} numberOfLines={1}>
                {track.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>{track.artist}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
            <MoreVertical size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
);

const PlayerBar = ({ currentTrack, isPlaying, onTogglePlay, progress, onExpand }) => {
    if (!currentTrack) return null;
    const coverUri = currentTrack.coverUrl || 'https://via.placeholder.com/100';

    return (
        <View style={styles.playerBarWrapper}>
            <TouchableOpacity activeOpacity={0.9} onPress={onExpand}>
                <MobileGlass style={styles.playerBarContainer} intensity={40}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>

                    <View style={styles.playerContent}>
                        <View style={styles.playerInfo}>
                            <Image source={{ uri: coverUri }} style={styles.playerCover} />
                            <View style={styles.playerTextContainer}>
                                <Text style={styles.playerTitle} numberOfLines={1}>{currentTrack.title}</Text>
                                <Text style={styles.playerArtist} numberOfLines={1}>{currentTrack.artist}</Text>
                            </View>
                        </View>

                        <View style={styles.playerControls}>
                            <TouchableOpacity style={[styles.controlBtn, styles.playBtn]} onPress={(e) => { e.stopPropagation(); onTogglePlay(); }}>
                                {isPlaying ?
                                    <Pause size={20} color={COLORS.background} fill={COLORS.background} /> :
                                    <Play size={20} color={COLORS.background} fill={COLORS.background} />
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </MobileGlass>
            </TouchableOpacity>
        </View>
    );
};

const FullPlayer = ({ visible, onClose, currentTrack, isPlaying, onTogglePlay, duration, position, onSeek }) => {
    if (!currentTrack) return null;
    const coverUri = currentTrack.coverUrl || 'https://via.placeholder.com/300';

    // Format seconds to mm:ss
    const formatTime = (millis) => {
        if (!millis) return '0:00';
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
                <LinearGradient colors={['#333', '#121212', '#000']} style={StyleSheet.absoluteFill} />

                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' }}>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                        <ChevronDown size={28} color="white" />
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 12, letterSpacing: 1 }}></Text>
                    <TouchableOpacity>
                        <MoreVertical size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Cover Art */}
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 20 }}>
                    <Image
                        source={{ uri: coverUri }}
                        style={{ width: width - 60, height: width - 60, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 }}
                    />
                </View>

                {/* Track Info */}
                <View style={{ paddingHorizontal: 30, marginBottom: 30 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 5 }} numberOfLines={1}>{currentTrack.title}</Text>
                            <Text style={{ color: '#b3b3b3', fontSize: 18 }} numberOfLines={1}>{currentTrack.artist}</Text>
                        </View>
                    </View>

                    {/* Slider */}
                    <Slider
                        style={{ width: '100%', height: 40 }}
                        minimumValue={0}
                        maximumValue={duration || 1}
                        value={position || 0}
                        onSlidingComplete={onSeek}
                        minimumTrackTintColor={COLORS.primary}
                        maximumTrackTintColor="#555"
                        thumbTintColor="white"
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: '#b3b3b3', fontSize: 12 }}>{formatTime(position)}</Text>
                        <Text style={{ color: '#b3b3b3', fontSize: 12 }}>{formatTime(duration)}</Text>
                    </View>

                    {/* Controls */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 30 }}>
                        <Shuffle size={24} color={COLORS.primary} />
                        <SkipBack size={32} color="white" fill="white" />
                        <TouchableOpacity
                            onPress={onTogglePlay}
                            style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                            {isPlaying ? <Pause size={32} color="black" fill="black" /> : <Play size={32} color="black" fill="black" style={{ marginLeft: 4 }} />}
                        </TouchableOpacity>
                        <SkipForward size={32} color="white" fill="white" />
                        <Repeat size={24} color="#b3b3b3" />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const SettingsModal = ({ visible, onClose, serverUrl, setServerUrl }) => {
    const [urlInput, setUrlInput] = useState(serverUrl);

    const onSave = () => {
        setServerUrl(urlInput);
        AsyncStorage.setItem('serverUrl', urlInput);
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '85%', backgroundColor: '#222', borderRadius: 16, padding: 24 }}>
                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Ayarlar</Text>

                    <Text style={{ color: '#aaa', fontSize: 12, marginBottom: 8 }}>SUNUCU ADRESİ</Text>
                    <TextInput
                        style={{ backgroundColor: '#333', color: 'white', padding: 12, borderRadius: 8, fontSize: 16, marginBottom: 20 }}
                        value={urlInput}
                        onChangeText={setUrlInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                        <TouchableOpacity onPress={onClose} style={{ padding: 10 }}>
                            <Text style={{ color: '#aaa' }}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onSave} style={{ backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 }}>
                            <Text style={{ color: 'black', fontWeight: 'bold' }}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const BottomBar = ({ activeTab, onTabPress }) => {
    return (
        <View style={styles.bottomBarWrapper}>
            <MobileGlass style={styles.bottomBarContainer} intensity={50}>
                <View style={styles.bottomBarInner}>
                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('home')}>
                        <Home size={24} color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, { color: activeTab === 'home' ? COLORS.primary : COLORS.textSecondary }]}>Ana Sayfa</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('search')}>
                        <Search size={24} color={activeTab === 'search' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, { color: activeTab === 'search' ? COLORS.primary : COLORS.textSecondary }]}>Ara</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.tab} onPress={() => onTabPress('library')}>
                        <Library size={24} color={activeTab === 'library' ? COLORS.primary : COLORS.textSecondary} />
                        <Text style={[styles.tabText, { color: activeTab === 'library' ? COLORS.primary : COLORS.textSecondary }]}>Kitaplık</Text>
                    </TouchableOpacity>
                </View>
            </MobileGlass>
        </View>
    );
};

const MainContent = ({ activeTab, albums, tracks, onTrackPress, currentTrack, API_URL, onSearch, searchResults }) => {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');

    if (activeTab === 'search') {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
                <View style={{ paddingHorizontal: SIZES.padding, marginBottom: 20 }}>
                    <Text style={styles.sectionTitle}>Ara</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', borderRadius: 8, paddingHorizontal: 12 }}>
                        <Search size={20} color="#888" />
                        <TextInput
                            style={{ flex: 1, padding: 12, color: 'white', fontSize: 16 }}
                            placeholder="Şarkı, Albüm veya Sanatçı..."
                            placeholderTextColor="#666"
                            value={query}
                            onChangeText={(text) => { setQuery(text); onSearch(text); }}
                        />
                    </View>
                </View>
                <FlatList
                    data={query.length > 0 ? searchResults : []}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) => <SongRow track={item} number={index + 1} onPress={() => onTrackPress(item)} isPlayingCurrent={currentTrack?.id === item.id} API_URL={API_URL} />}
                    ListEmptyComponent={query.length > 0 && <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>Sonuç bulunamadı</Text>}
                    contentContainerStyle={{ paddingBottom: 160 }}
                />
            </View>
        );
    }

    if (activeTab === 'library') {
        return (
            <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: SIZES.padding }]}>Kitaplık</Text>
                <FlatList
                    data={tracks}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item, index }) => <SongRow track={item} number={index + 1} onPress={() => onTrackPress(item)} isPlayingCurrent={currentTrack?.id === item.id} API_URL={API_URL} />}
                    contentContainerStyle={{ paddingBottom: 160 }}
                />
            </View>
        );
    }

    // HOME TAB
    const renderHeader = () => (
        <>
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.greeting}></Text>
                    {/* SETTINGS TRIGGER HANDLED BY ROOT */}
                </View>
            </View>

            <View style={{ marginBottom: 30 }}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: SIZES.padding, marginBottom: 15 }]}>Albümler</Text>
                <FlatList
                    horizontal
                    data={albums}
                    keyExtractor={item => item.title} // fallback to title as key if id weak
                    renderItem={({ item }) => <AlbumCard album={item} onPress={() => { }} API_URL={API_URL} />}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
                />
            </View>
            <Text style={[styles.sectionTitle, { paddingHorizontal: SIZES.padding }]}>Şarkılar</Text>
        </View>
    );

return (
    <FlatList
        data={tracks}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item, index }) => <SongRow track={item} number={index + 1} onPress={() => onTrackPress(item)} isPlayingCurrent={currentTrack?.id === item.id} API_URL={API_URL} />}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 160 }}
        style={styles.container}
    />
);
};


const MobileApp = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [tracks, setTracks] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState(null);
    const [showFullPlayer, setShowFullPlayer] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const [duration, setDuration] = useState(0);
    // 1. AsyncStorage
    // 2. Local IP (10.236.67.209)
    // 3. Localhost
    const [serverUrl, setServerUrl] = useState('http://10.236.67.209:8000');

    // ... (Connection error states same as before)
    const [isLoading, setIsLoading] = useState(true);
    const [connectionError, setConnectionError] = useState(false);
    const [tempUrl, setTempUrl] = useState('http://10.236.67.209:8000'); // Sync with initial

    const API_URL = `${serverUrl}/api/v1`;

    // 1. Init
    useEffect(() => {
        const init = async () => {
            // Enable audio even if silent switch is on (iOS)
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const savedUrl = await AsyncStorage.getItem('serverUrl');
            if (savedUrl) {
                setServerUrl(savedUrl);
                setTempUrl(savedUrl);
            }
        };
        init();
    }, []);

    // 2. Fetch Logic
    const fetchData = async () => {
        try {
            setIsLoading(true);
            setConnectionError(false);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

            console.log(`Fetching from ${API_URL}...`);
            const res = await fetch(`${API_URL}/music/search?q=a&limit=100`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error('Network response was not ok');

            const data = await res.json();
            setTracks(data);

            // Robust Album Grouping
            const groups = {};
            data.forEach(track => {
                // Use album ID if available, otherwise hash title
                const albumKey = track.album_id || track.album;
                if (!groups[albumKey] && track.has_cover) {
                    groups[albumKey] = {
                        id: track.album_id,
                        title: track.album,
                        artist: track.artist || 'Bilinmeyen',
                        cover: `${API_URL}/music/cover/${track.album_id}`, // If id missing logic needs adjustment but assuming id exists for robust albums
                    };
                }
            });
            setAlbums(Object.values(groups));
        } catch (err) {
            console.warn('Fetch failed:', err);
            setConnectionError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        return () => { if (sound) sound.unloadAsync(); }
    }, [serverUrl]);

    // 3. Search Logic
    const handleSearch = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/music/search?q=${query}`);
            const data = await res.json();
            setSearchResults(data);
        } catch (e) {
            console.error(e);
        }
    };

    // 4. Audio Logic
    async function playSound(track) {
        if (!track) return;
        try {
            if (sound) await sound.unloadAsync();

            const uri = `${API_URL}/music/stream/${track.id}`;
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );

            setSound(newSound);
            setCurrentTrack({
                ...track,
                coverUrl: track.has_cover ? `${API_URL}/music/cover/${track.album_id}` : `${API_URL}/music/track-cover/${track.id}`
            });
            setIsPlaying(true);
            setShowFullPlayer(true); // Open player on play

            // Add progress listener
            newSound.setOnPlaybackStatusUpdate(status => {
                if (status.isLoaded) {
                    setDuration(status.durationMillis);
                    setPosition(status.positionMillis);
                    if (status.didJustFinish) setIsPlaying(false);
                }
            });
        } catch (error) {
            console.warn('Audio Error:', error);
        }
    }

    const togglePlay = async () => {
        if (!sound) return;
        if (isPlaying) await sound.pauseAsync();
        else await sound.playAsync();
        setIsPlaying(!isPlaying);
    };

    const handleSeek = async (value) => {
        if (sound) await sound.setPositionAsync(value);
    }

    // Retry / Server Change Handlers
    const handleRetry = () => {
        AsyncStorage.setItem('serverUrl', tempUrl);
        setServerUrl(tempUrl);
    };

    return (
        <SafeAreaProvider>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#000000" />
                <LinearGradient colors={['#242424', '#000000']} locations={[0, 0.4]} style={StyleSheet.absoluteFill} />

                {/* Settings Button (Top Right Absolute) */}
                <TouchableOpacity
                    style={{ position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 }}
                    onPress={() => setShowSettings(true)}
                >
                    <Settings size={24} color="#fff" />
                </TouchableOpacity>

                {connectionError ? (
                    <View style={styles.center}>
                        {/* Improved Error Screen */}
                        <View style={{ width: '90%', padding: 25, backgroundColor: 'rgba(30,30,30,0.95)', borderRadius: 20 }}>
                            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Bağlantı Hatası ⚠️</Text>
                            <Text style={{ color: '#ccc', marginBottom: 20, textAlign: 'center' }}>Sunucuya ulaşılamadı.</Text>

                            <Text style={{ color: COLORS.primary, fontSize: 12, marginBottom: 5, fontWeight: '700' }}>SUNUCU URL</Text>
                            <TextInput
                                style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: '#444' }}
                                value={tempUrl}
                                onChangeText={setTempUrl}
                                placeholder="http://..."
                                placeholderTextColor="#666"
                                autoCapitalize="none"
                            />

                            <TouchableOpacity onPress={handleRetry} style={{ backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center' }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>Bağlan</Text>
                            </TouchableOpacity>

                            <View style={{ marginTop: 20, gap: 10 }}>
                                <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>HIZLI SEÇENEKLER</Text>
                                <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                                    <TouchableOpacity onPress={() => setTempUrl('http://10.0.2.2:8000')} style={{ padding: 10, backgroundColor: '#333', borderRadius: 8 }}>
                                        <Text style={{ color: 'white', fontSize: 12 }}>Emulator</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setTempUrl('http://10.236.67.209:8000')} style={{ padding: 10, backgroundColor: '#333', borderRadius: 8 }}>
                                        <Text style={{ color: 'white', fontSize: 12 }}>IP (Otomatik)</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={{ color: '#888', marginTop: 10 }}>Müzikler yükleniyor...</Text>
                    </View>
                ) : (
                    <MainContent
                        activeTab={activeTab}
                        albums={albums}
                        tracks={tracks}
                        onTrackPress={playSound}
                        currentTrack={currentTrack}
                        API_URL={API_URL}
                        onSearch={handleSearch}
                        searchResults={searchResults}
                    />
                )}

                {/* Floating Elements */}
                <View style={styles.floatingContainer}>
                    <PlayerBar
                        currentTrack={currentTrack}
                        isPlaying={isPlaying}
                        onTogglePlay={togglePlay}
                        progress={duration > 0 ? position / duration : 0}
                        onExpand={() => setShowFullPlayer(true)}
                    />
                    <BottomBar activeTab={activeTab} onTabPress={setActiveTab} />
                </View>

                {/* Modals */}
                <FullPlayer
                    visible={showFullPlayer}
                    onClose={() => setShowFullPlayer(false)}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    duration={duration}
                    position={position}
                    onSeek={handleSeek}
                />

                <SettingsModal
                    visible={showSettings}
                    onClose={() => setShowSettings(false)}
                    serverUrl={tempUrl}
                    setServerUrl={(url) => { setTempUrl(url); setServerUrl(url); }}
                />
            </View>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.padding,
        marginBottom: 24
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    chip: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },

    // Album Card
    albumCard: {
        width: 150,
        marginRight: 16,
    },
    albumCover: {
        width: 150,
        height: 150,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: '#333'
    },
    albumTitle: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 2,
    },
    albumArtist: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },

    // Song Row
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: SIZES.padding,
    },
    songNumContainer: {
        width: 24,
        alignItems: 'center',
        marginRight: 12
    },
    songNum: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    songCover: {
        width: 48,
        height: 48,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#333'
    },
    songInfo: {
        flex: 1,
    },
    songTitle: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4
    },
    songArtist: {
        color: COLORS.textSecondary,
        fontSize: 13
    },

    // Floating Container
    floatingContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    // Player Bar
    playerBarWrapper: {
        paddingHorizontal: 8,
        marginBottom: 10,  // Space between player and bottom bar
    },
    playerBarContainer: {
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(56, 56, 56, 0.95)', // Darker fallback
        padding: 0,
    },
    glassContainer: {
        overflow: 'hidden',
        borderRadius: SIZES.radius,
        backgroundColor: 'rgba(255,255,255,0)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    progressBarBg: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
    },
    progressBarFill: {
        height: 2,
        backgroundColor: COLORS.primary,
    },
    playerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        justifyContent: 'space-between',
        paddingVertical: 10
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    playerCover: {
        width: 40,
        height: 40,
        borderRadius: 4,
        backgroundColor: '#333'
    },
    playerTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    playerTitle: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 13,
    },
    playerArtist: {
        color: COLORS.textSecondary,
        fontSize: 11,
    },
    playerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingRight: 4
    },
    controlBtn: {
        padding: 4
    },
    playBtn: {
        backgroundColor: COLORS.text, // White button
        borderRadius: 50,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // Bottom Bar
    bottomBarWrapper: {
        // Background gradient or simple absolute position
    },
    bottomBarContainer: {
        // Usually full width with blur
        borderTopWidth: 0,
        borderRadius: 0, // Flat bottom
        backgroundColor: 'rgba(0,0,0,0.85)',
    },
    bottomBarInner: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: SIZES.bottomBarHeight,
        paddingBottom: 5 // Adjust for home indicator
    },
    tab: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabText: {
        fontSize: 10,
        marginTop: 4
    }
});

export default MobileApp;
