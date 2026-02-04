import React from 'react'
import { Clock3, Volume2, Clock } from 'lucide-react'
import { AlbumCard } from '../common/AlbumCard'

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
}

export const HomeView = ({
    search,
    gridAlbums,
    singles,
    currentTrack,
    openAlbum,
    playTrack,
    API_URL
}) => {
    return (
        <>
            {search.length > 0 && <h2 className="section-title">Arama Sonuçları</h2>}
            {search.length === 0 && <h2 className="section-title">Albümler</h2>}

            <div className="album-grid">
                {gridAlbums.map(album => (
                    <AlbumCard
                        key={album.id}
                        album={album}
                        onClick={() => openAlbum(album)}
                    />
                ))}
            </div>

            {/* Single Tracks Section */}
            {singles.length > 0 && (
                <div style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">Tekliler / Diğerleri</h2>
                    <div className="song-table-header" style={{ borderBottom: '1px solid #333', gridTemplateColumns: '40px 50px 4fr 3fr 1fr' }}>
                        <div>#</div>
                        <div></div>
                        <div>Başlık</div>
                        <div>Sanatçı</div>
                        <div style={{ textAlign: 'right' }}><Clock3 size={16} /></div>
                    </div>
                    {singles.map((track, i) => (
                        <div key={track.id} className="song-row" style={{ gridTemplateColumns: '40px 50px 4fr 3fr 1fr' }} onClick={() => playTrack(track)}>
                            <div style={{ textAlign: 'center' }}>{currentTrack?.id === track.id ? <Volume2 size={14} color="#1ed760" /> : i + 1}</div>
                            <div>
                                <img
                                    src={`${API_URL}/music/track-cover/${track.id}`}
                                    style={{ width: 40, height: 40, borderRadius: 4, objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none' }}
                                    alt=""
                                />
                            </div>
                            <div className="song-title" style={{ color: currentTrack?.id === track.id ? '#1ed760' : 'white' }}>{track.title}</div>
                            <div>{track.artist}</div>
                            <div style={{ textAlign: 'right' }}>{formatTime(track.duration)}</div>
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
