import React from 'react'
import { Heart, Clock3, Volume2 } from 'lucide-react'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const FavoritesView = ({
    favorites,
    currentTrack,
    playTrack,
    toggleFavorite,
    API_URL
}) => {
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #450af5, #8e8ee5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={32} fill="white" color="white" />
                </div>
                <div>
                    <h2 className="section-title" style={{ margin: 0 }}>Beğenilenler</h2>
                    <div style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>{favorites.length} şarkı</div>
                </div>
            </div>
            {favorites.length === 0 ? (
                <div style={{ color: '#888', padding: '2rem 0' }}>Henüz beğenilen şarkı yok</div>
            ) : (
                <>
                    <div className="song-table-header" style={{ borderBottom: '1px solid #333', gridTemplateColumns: '40px 50px 4fr 3fr 2fr 1fr' }}>
                        <div>#</div>
                        <div></div>
                        <div>Başlık</div>
                        <div>Sanatçı</div>
                        <div>Eklenme Tarihi</div>
                        <div style={{ textAlign: 'right' }}><Clock3 size={16} /></div>
                    </div>
                    {favorites.map((track, i) => (
                        <div key={track.id} className="song-row" style={{ gridTemplateColumns: '40px 50px 4fr 3fr 2fr 1fr' }} onClick={() => playTrack(track)}>
                            <div style={{ textAlign: 'center' }}>{currentTrack?.id === track.id ? <Volume2 size={14} color="#1ed760" /> : i + 1}</div>
                            <div>
                                <img
                                    src={`${API_URL}/music/track-cover/${track.id}`}
                                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                    alt=""
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontWeight: 500 }}>{track.title}</span>
                                <Heart
                                    size={16}
                                    fill="#1ed760"
                                    color="#1ed760"
                                    style={{ cursor: 'pointer' }}
                                    onClick={(e) => toggleFavorite(track, e)}
                                />
                            </div>
                            <div>{track.artist}</div>
                            <div style={{ color: '#b3b3b3' }}>{formatDate(track.added_at)}</div>
                            <div style={{ textAlign: 'right' }}>{formatTime(track.duration)}</div>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}
