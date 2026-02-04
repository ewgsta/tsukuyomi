import React from 'react'
import { Moon, Home, Music, Plus, Heart, ListMusic } from 'lucide-react'

export const Sidebar = ({
    view,
    setView,
    playlists,
    selectedPlaylist,
    openPlaylist,
    setShowNewPlaylistModal
}) => {
    return (
        <aside className="sidebar">
            <div className="logo">
                <Moon size={24} fill="white" />
                Tsukuyomi
            </div>
            <nav>
                <div className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>
                    <Home size={22} /> Ana Sayfa
                </div>
                <div className={`nav-item ${view === 'songs' ? 'active' : ''}`} onClick={() => setView('songs')}>
                    <Music size={22} /> Kütüphane
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1rem', paddingLeft: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: '#b3b3b3' }}>Listeler</span>
                    <Plus size={18} color="#b3b3b3" style={{ cursor: 'pointer' }} onClick={() => setShowNewPlaylistModal(true)} />
                </div>
                <div className={`nav-item ${view === 'favorites' ? 'active' : ''}`} onClick={() => setView('favorites')}>
                    <Heart size={22} fill={view === 'favorites' ? '#1ed760' : '#b3b3b3'} color={view === 'favorites' ? '#1ed760' : '#b3b3b3'} /> Beğenilenler
                </div>
                {playlists.map(pl => (
                    <div
                        key={pl.id}
                        className={`nav-item ${view === 'playlist' && selectedPlaylist?.id === pl.id ? 'active' : ''}`}
                        onClick={() => openPlaylist(pl.id)}
                    >
                        <ListMusic size={22} /> {pl.name}
                    </div>
                ))}
            </nav>
        </aside>
    )
}
