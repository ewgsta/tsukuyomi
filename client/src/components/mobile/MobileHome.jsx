import React from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Clock3, MoreVertical } from 'lucide-react-native';
import { MobileGlass } from './MobileGlass';
import { COLORS, SIZES } from './MobileTheme';

const AlbumCard = ({ album, onPress }) => (
    <TouchableOpacity style={styles.albumCard} onPress={onPress}>
        <Image
            source={{ uri: album.cover || 'https://via.placeholder.com/150' }}
            style={styles.albumCover}
        />
        <Text style={styles.albumTitle} numberOfLines={1}>{album.title}</Text>
        <Text style={styles.albumArtist} numberOfLines={1}>{album.artist}</Text>
    </TouchableOpacity>
);

const SongRow = ({ track, number, onPress }) => (
    <TouchableOpacity style={styles.songRow} onPress={onPress}>
        <Text style={styles.songNum}>{number}</Text>
        <Image
            source={{ uri: `http://localhost:8000/api/v1/music/track-cover/${track.id}` }} // Mock URL handling needed
            style={styles.songCover}
        />
        <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1}>{track.title}</Text>
            <Text style={styles.songArtist} numberOfLines={1}>{track.artist}</Text>
        </View>
        <TouchableOpacity style={{ padding: 8 }}>
            <MoreVertical size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
    </TouchableOpacity>
);

export const MobileHome = ({ albums, tracks, onAlbumPress, onTrackPress }) => {
    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.greeting}>İyi geceler</Text>

            <Text style={styles.sectionTitle}>Albümler</Text>
            <FlatList
                horizontal
                data={albums}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => <AlbumCard album={item} onPress={() => onAlbumPress(item)} />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: SIZES.padding }}
                style={{ marginBottom: 30 }}
            />

            <Text style={[styles.sectionTitle, { paddingHorizontal: SIZES.padding }]}>Tekliler</Text>
        </View>
    );

    return (
        <FlatList
            data={tracks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
                <SongRow track={item} number={index + 1} onPress={() => onTrackPress(item)} />
            )}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 150 }} // Space for PlayerBar
            style={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60, // Safe area
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
        paddingHorizontal: SIZES.padding,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 16,
        paddingHorizontal: SIZES.padding
    },
    albumCard: {
        width: 140,
        marginRight: 16,
    },
    albumCover: {
        width: 140,
        height: 140,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#333'
    },
    albumTitle: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 14,
    },
    albumArtist: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    songRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: SIZES.padding,
    },
    songNum: {
        width: 25,
        color: COLORS.textSecondary,
        fontSize: 14,
        marginRight: 10
    },
    songCover: {
        width: 48,
        height: 48,
        borderRadius: 6,
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
        fontSize: 14
    }
});
