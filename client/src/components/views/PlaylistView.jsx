import React from 'react'
import { ListMusic, Trash2, Clock3, Volume2, X, Search } from 'lucide-react'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export const PlaylistView = ({
    selectedPlaylist,
    currentTrack,
    playTrack,
    deletePlaylist,
    removeFromPlaylist,
    playlistSearch,
    setPlaylistSearch,
    playlistSearchResults,
    addToPlaylist,
    API_URL
}) => {
    if (!selectedPlaylist) return null

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #1ed760, #0d5a28)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ListMusic size={32} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <h2 className="section-title" style={{ margin: 0 }}>{selectedPlaylist.name}</h2>
                    <div style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>{selectedPlaylist.tracks.length} şarkı</div>
                </div>
                <Trash2 size={20} color="#ff4444" style={{ cursor: 'pointer' }} onClick={() => deletePlaylist(selectedPlaylist.id)} />
            </div>

            {selectedPlaylist.tracks.length === 0 ? (
                <div style={{ color: '#888', padding: '1rem 0' }}>Bu playlist'te henüz şarkı yok</div>
            ) : (
                <>
                    <div className="song-table-header" style={{ borderBottom: '1px solid #333', gridTemplateColumns: '40px 50px 4fr 3fr 40px 1fr' }}>
                        <div>#</div>
                        <div></div>
                        <div>Başlık</div>
                        <div>Sanatçı</div>
                        <div></div>
                        <div style={{ textAlign: 'right' }}><Clock3 size={16} /></div>
                    </div>
                    {selectedPlaylist.tracks.map((track, i) => (
                        <div key={track.id} className="song-row" style={{ gridTemplateColumns: '40px 50px 4fr 3fr 40px 1fr' }} onClick={() => playTrack(track)}>
                            <div style={{ textAlign: 'center' }}>{currentTrack?.id === track.id ? <Volume2 size={14} color="#1ed760" /> : i + 1}</div>
                            <div>
                                <img
                                    src={`${API_URL}/music/track-cover/${track.id}`}
                                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                    alt=""
                                />
                            </div>
                            <div style={{ fontWeight: 500 }}>{track.title}</div>
                            <div>{track.artist}</div>
                            <div>
                                <X size={16} className="remove-btn" color="#888" style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); removeFromPlaylist(track.id) }} />
                            </div>
                            <div style={{ textAlign: 'right' }}>{formatTime(track.duration)}</div>
                        </div>
                    ))}
                </>
            )}

            <div style={{ marginTop: '2rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Şarkı Ekle</h3>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3' }} />
                    <input
                        type="text"
                        placeholder="Şarkı ara..."
                        value={playlistSearch}
                        onChange={(e) => setPlaylistSearch(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px 10px 40px', background: '#2a2a2a', border: 'none', borderRadius: 8, color: 'white', fontSize: '0.9rem' }}
                    />
                </div>
                {playlistSearchResults.map(track => (
                    <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #222' }}>
                        <img
                            src={`${API_URL}/music/track-cover/${track.id}`}
                            style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                            onError={(e) => { e.target.style.display = 'none' }}
                            alt=""
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem' }}>{track.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{track.artist}</div>
                        </div>
                        <div
                            style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: 16, fontSize: '0.8rem', cursor: 'pointer' }}
                            onClick={() => addToPlaylist(track.id)}
                        >
                            Ekle
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
