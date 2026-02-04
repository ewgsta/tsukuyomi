import React from 'react'
import { Play, Heart, Clock3, Volume2 } from 'lucide-react'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export const AlbumDetailView = ({
    selectedAlbum,
    currentTrack,
    isPlaying,
    playTrack
}) => {
    if (!selectedAlbum) return null

    return (
        <div className="album-detail">
            <div className="album-hero">
                <img
                    src={selectedAlbum.cover}
                    className="hero-art"
                    alt=""
                />
                <div className="hero-info">
                    <div className="hero-type">Album</div>
                    <h1 className="hero-title">{selectedAlbum.title}</h1>
                    <div className="hero-meta">
                        <span style={{ fontWeight: 800 }}>{selectedAlbum.artist}</span>
                        <span>•</span>
                        <span>{selectedAlbum.tracks.length} şarkı</span>
                    </div>
                </div>
            </div>

            <div className="action-bar" style={{ marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <button style={{ width: 56, height: 56, borderRadius: '50%', background: '#1ed760', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' }} onClick={() => playTrack(selectedAlbum.tracks[0])}>
                    <Play size={28} fill="black" style={{ marginLeft: 4 }} />
                </button>
                <Heart size={32} color="#b3b3b3" />
                <div style={{ fontSize: 24, color: '#b3b3b3', letterSpacing: -2, paddingBottom: 10 }}>...</div>
            </div>

            <div className="song-table-header">
                <div style={{ textAlign: 'center' }}>#</div>
                <div>Başlık</div>
                <div style={{ textAlign: 'right' }}><Clock3 size={16} /></div>
            </div>

            {selectedAlbum.tracks.map((track, index) => (
                <div key={track.id} className={`song-row ${currentTrack?.id === track.id ? 'active' : ''}`} onClick={() => playTrack(track)}>
                    <div style={{ textAlign: 'center' }}>
                        {currentTrack?.id === track.id && isPlaying ?
                            <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" width="14" alt="playing" /> :
                            index + 1
                        }
                    </div>
                    <div className="song-title">
                        {track.title}
                        <div style={{ fontSize: '0.8rem', color: '#b3b3b3', fontWeight: 400 }}>{track.artist}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>{formatTime(track.duration)}</div>
                </div>
            ))}
        </div>
    )
}
