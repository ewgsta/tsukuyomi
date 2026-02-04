import React from 'react'
import { Shuffle, SkipBack, Play, Pause, SkipForward, Repeat, Quote, Heart, Volume2 } from 'lucide-react'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export const PlayerBar = ({
    currentTrack,
    API_URL,
    isPlaying,
    togglePlay,
    playPrev,
    playNext,
    shuffle,
    setShuffle,
    repeat,
    setRepeat,
    currentTime,
    duration,
    progressRef,
    handleProgressMouseDown,
    volume,
    volumeRef,
    handleVolumeMouseDown,
    handleVolumeClick, // New prop for click mute/unmute
    view,
    setView,
    isFavorite,
    toggleFavorite
}) => {
    if (!currentTrack) return null

    // Calculate percentage locally for render
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className="player-bar">
            <div style={{ display: 'flex', alignItems: 'center', width: '30%' }}>
                <img
                    src={currentTrack.has_cover ? `${API_URL}/music/cover/${currentTrack.album_id}` : `${API_URL}/music/track-cover/${currentTrack.id}`}
                    className="now-playing-cover"
                    alt=""
                    onError={(e) => { e.target.style.opacity = 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'white', marginBottom: 2 }}>{currentTrack.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>{currentTrack.artist}</div>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '40%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 8 }}>
                    <button className="ctrl-btn" onClick={() => setShuffle(!shuffle)} style={{ color: shuffle ? '#1ed760' : '#b3b3b3' }}><Shuffle size={18} /></button>
                    <button className="ctrl-btn" onClick={playPrev}><SkipBack size={20} fill="#b3b3b3" /></button>
                    <button className="play-btn-circle" onClick={togglePlay}>
                        {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: 2 }} />}
                    </button>
                    <button className="ctrl-btn" onClick={playNext}><SkipForward size={20} fill="#b3b3b3" /></button>
                    <button className="ctrl-btn" onClick={() => setRepeat(!repeat)} style={{ color: repeat ? '#1ed760' : '#b3b3b3' }}><Repeat size={18} /></button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                    <span style={{ fontSize: '0.7rem', color: '#b3b3b3', minWidth: 35, textAlign: 'right' }}>{formatTime(currentTime)}</span>
                    <div
                        ref={progressRef}
                        onMouseDown={handleProgressMouseDown}
                        style={{ flex: 1, height: 4, background: '#4d4d4d', borderRadius: 2, position: 'relative', cursor: 'pointer' }}
                    >
                        <div style={{ width: `${progressPercent}%`, height: '100%', background: '#1ed760', borderRadius: 2 }}></div>
                        <div style={{ width: 12, height: 12, background: 'white', borderRadius: '50%', position: 'absolute', left: `${progressPercent}%`, top: '50%', transform: 'translate(-50%, -50%)', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#b3b3b3', minWidth: 35 }}>{formatTime(duration)}</span>
                </div>
            </div>

            <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                <Quote
                    size={18}
                    fill={view === 'lyrics' ? '#1ed760' : 'none'}
                    color={view === 'lyrics' ? '#1ed760' : '#b3b3b3'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setView(view === 'lyrics' ? 'home' : 'lyrics')}
                />
                <Heart
                    size={18}
                    fill={isFavorite(currentTrack.id) ? '#1ed760' : 'none'}
                    color={isFavorite(currentTrack.id) ? '#1ed760' : '#b3b3b3'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleFavorite(currentTrack)}
                />
                <Volume2 size={18} color="#b3b3b3" style={{ cursor: 'pointer' }} onClick={handleVolumeClick} />
                <div
                    ref={volumeRef}
                    onMouseDown={handleVolumeMouseDown}
                    style={{ width: 100, height: 4, background: '#4d4d4d', borderRadius: 2, cursor: 'pointer', position: 'relative' }}
                >
                    <div style={{ width: `${volume * 100}%`, height: '100%', background: 'white', borderRadius: 2 }}></div>
                    <div style={{ width: 10, height: 10, background: 'white', borderRadius: '50%', position: 'absolute', left: `${volume * 100}%`, top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#b3b3b3', minWidth: 30 }}>{Math.round(volume * 100)}%</span>
            </div>
        </div>
    )
}
