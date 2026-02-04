
import { useState, useEffect, useRef, useMemo } from 'react'
import { Clock3, Volume2, Heart, Play, Trash2, X, Search, Folder, Server, Check, Music, Disc } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { TopNav } from './components/TopNav'
import { PlayerBar } from './components/PlayerBar'
import { AlbumCard } from './components/common/AlbumCard'
import { HomeView } from './components/views/HomeView'
import { AlbumDetailView } from './components/views/AlbumDetailView'
import { LibraryView } from './components/views/LibraryView'
import { FavoritesView } from './components/views/FavoritesView'
import { PlaylistView } from './components/views/PlaylistView'
import { SettingsView } from './components/views/SettingsView'
import { LyricsView } from './components/views/LyricsView'

const isTauri = typeof window !== 'undefined' && 'current' in (window.__TAURI_INTERNALS__ ?? {})

const getStoredSettings = () => {
  const stored = localStorage.getItem('tsukuyomi_settings')
  if (stored) return JSON.parse(stored)
  return { mode: 'remote', serverUrl: 'http://localhost:8000', musicFolder: '' }
}

function App() {
  const [settings, setSettings] = useState(getStoredSettings)
  const [settingsForm, setSettingsForm] = useState(getStoredSettings)
  const API_URL = `${settings.serverUrl}/api/v1`

  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(null)
  const [view, setView] = useState('home')
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [search, setSearch] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [favorites, setFavorites] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [playlistSearch, setPlaylistSearch] = useState('')
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [lyrics, setLyrics] = useState(null)
  const [syncedLyrics, setSyncedLyrics] = useState([])
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false)
  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const volumeRef = useRef(null)
  const lyricsContainerRef = useRef(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const showConfirm = (message, onConfirm) => {
    setConfirmDialog({ message, onConfirm })
  }

  const saveSettings = async () => {
    localStorage.setItem('tsukuyomi_settings', JSON.stringify(settingsForm))

    // If local mode, also update the API's music directory
    if (settingsForm.mode === 'local' && settingsForm.musicFolder) {
      try {
        await fetch(`${settingsForm.serverUrl}/api/v1/settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ music_directory: settingsForm.musicFolder })
        })
      } catch (e) {
        console.log('Could not update server settings:', e)
      }
    }

    setSettings(settingsForm)
    setView('home')
    window.location.reload()
  }

  // Start backend sidecar in Tauri
  useEffect(() => {
    const startBackend = async () => {
      //   if (!isTauri) return
      if (!isTauri || import.meta.env.DEV) {
        console.log('Skipping sidecar spawn (Dev mode or Web)')
        return
      }

      try {
        const { Command } = await import('@tauri-apps/plugin-shell')
        const command = Command.sidecar('binaries/tsukuyomi-server')

        command.on('close', (data) => {
          console.log('Backend closed with code:', data.code)
        })

        command.on('error', (error) => {
          console.error('Backend error:', error)
        })

        command.stdout.on('data', (line) => {
          console.log('[backend]', line)
        })

        await command.spawn()
        console.log('Backend sidecar started')

        // Wait a bit for the server to start
        await new Promise(r => setTimeout(r, 2000))
      } catch (e) {
        console.log('Sidecar not available (dev mode):', e)
      }
    }

    startBackend()
  }, [])

  useEffect(() => {
    const fetchMusic = async () => {
      const query = search.length > 0 ? search : 'a'
      try {
        const res = await fetch(`${API_URL}/music/search?q=${query}&limit=1000`)
        const data = await res.json()
        setTracks(data)
      } catch (err) {
        console.error(err)
      }
    }
    const timeout = setTimeout(fetchMusic, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/music/favorites`)
      const data = await res.json()
      setFavorites(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${API_URL}/music/playlists`)
      const data = await res.json()
      setPlaylists(data)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchFavorites()
    fetchPlaylists()
  }, [])

  const parseLrc = (lrc) => {
    return lrc.split('\n').map(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3].padEnd(3, '0')) / 1000
        const time = minutes * 60 + seconds + milliseconds
        return { time, text: match[4].trim() }
      }
      return null
    }).filter(Boolean)
  }

  const fetchLyrics = async () => {
    if (!currentTrack) return
    setLyrics(null)
    setSyncedLyrics([])
    setIsLoadingLyrics(true)

    try {
      const query = new URLSearchParams({
        artist_name: currentTrack.artist,
        track_name: currentTrack.title,
        duration: currentTrack.duration
      })
      if (currentTrack.album) query.append('album_name', currentTrack.album)

      const res = await fetch(`${API_URL}/music/lyrics?${query.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setLyrics(data)
        if (data.syncedLyrics) {
          setSyncedLyrics(parseLrc(data.syncedLyrics))
        }
      }
    } catch (e) {
      console.log('Lyrics fetch failed', e)
    } finally {
      setIsLoadingLyrics(false)
    }
  }

  useEffect(() => {
    if (view === 'lyrics') {
      fetchLyrics()
    }
  }, [view, currentTrack?.id])

  useEffect(() => {
    if (view === 'lyrics' && syncedLyrics.length > 0 && lyricsContainerRef.current) {
      const activeIdx = syncedLyrics.findIndex((line, i) => {
        const nextLine = syncedLyrics[i + 1]
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time)
      })

      if (activeIdx !== -1) {
        const activeEl = lyricsContainerRef.current.children[activeIdx]
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
  }, [currentTime, view, syncedLyrics])

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return
    await fetch(`${API_URL}/music/playlists?name=${encodeURIComponent(newPlaylistName)}`, { method: 'POST' })
    await fetchPlaylists()
    setNewPlaylistName('')
    setShowNewPlaylistModal(false)
  }

  const openPlaylist = async (playlistId) => {
    try {
      const res = await fetch(`${API_URL}/music/playlists/${playlistId}`)
      const data = await res.json()
      setSelectedPlaylist(data)
      setView('playlist')
      setPlaylistSearch('')
    } catch (err) {
      console.error(err)
    }
  }

  const refreshPlaylist = async () => {
    if (!selectedPlaylist) return
    const res = await fetch(`${API_URL}/music/playlists/${selectedPlaylist.id}`)
    const data = await res.json()
    setSelectedPlaylist(data)
  }

  const addToPlaylist = async (trackId) => {
    if (!selectedPlaylist) return
    await fetch(`${API_URL}/music/playlists/${selectedPlaylist.id}/tracks/${trackId}`, { method: 'POST' })
    await refreshPlaylist()
  }

  const removeFromPlaylist = async (trackId) => {
    if (!selectedPlaylist) return
    await fetch(`${API_URL}/music/playlists/${selectedPlaylist.id}/tracks/${trackId}`, { method: 'DELETE' })
    await refreshPlaylist()
  }

  const deletePlaylist = (playlistId) => {
    showConfirm('Bu playlist silinsin mi?', async () => {
      await fetch(`${API_URL}/music/playlists/${playlistId}`, { method: 'DELETE' })
      await fetchPlaylists()
      setView('home')
      setConfirmDialog(null)
    })
  }

  const playlistSearchResults = useMemo(() => {
    if (!playlistSearch || playlistSearch.length < 2) return []
    const query = playlistSearch.toLowerCase()
    return tracks.filter(t =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query)
    ).slice(0, 20)
  }, [playlistSearch, tracks])

  const { gridAlbums, singles } = useMemo(() => {
    const groups = {}
    const singleList = []

    tracks.forEach(track => {
      const albumKey = track.album_id
      const hasCover = track.has_cover === true

      if (albumKey && hasCover) {
        if (!groups[albumKey]) {
          groups[albumKey] = {
            id: track.album_id,
            title: track.album,
            artist: track.artist || 'Bilinmeyen Sanatçı',
            cover: `${API_URL}/music/cover/${track.album_id}`,
            tracks: []
          }
        }
        groups[albumKey].tracks.push(track)
      } else {
        singleList.push(track)
      }
    })

    return { gridAlbums: Object.values(groups), singles: singleList }
  }, [tracks])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(() => setIsPlaying(false))
      else audioRef.current.pause()
    }
  }, [isPlaying])

  const playTrack = (track) => {
    if (currentTrack?.id === track.id) {
      togglePlay()
      return
    }
    setCurrentTrack(track)
    setIsPlaying(true)
    if (audioRef.current) {
      audioRef.current.src = `${API_URL}/music/stream/${track.id}`
      audioRef.current.play()
    }
  }

  const togglePlay = () => {
    if (!currentTrack) return
    setIsPlaying(!isPlaying)
  }

  const playNext = () => {
    if (!currentTrack) return
    const allTracks = [...gridAlbums.flatMap(a => a.tracks), ...singles]

    if (repeat) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      return
    }

    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * allTracks.length)
      playTrack(allTracks[randomIndex])
      return
    }

    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id)
    if (currentIndex < allTracks.length - 1) {
      playTrack(allTracks[currentIndex + 1])
    } else {
      playTrack(allTracks[0])
    }
  }

  const playPrev = () => {
    if (!currentTrack) return
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }
    const allTracks = [...gridAlbums.flatMap(a => a.tracks), ...singles]
    const currentIndex = allTracks.findIndex(t => t.id === currentTrack.id)
    if (currentIndex > 0) {
      playTrack(allTracks[currentIndex - 1])
    } else {
      playTrack(allTracks[allTracks.length - 1])
    }
  }

  const openAlbum = (album) => {
    setSelectedAlbum(album)
    setView('album')
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`
  }

  const isFavorite = (trackId) => favorites.some(f => f.id === trackId)

  const toggleFavorite = async (track, e) => {
    if (e) e.stopPropagation()
    const trackId = track.id
    if (isFavorite(trackId)) {
      await fetch(`${API_URL}/music/favorites/${trackId}`, { method: 'DELETE' })
    } else {
      await fetch(`${API_URL}/music/favorites/${trackId}`, { method: 'POST' })
    }
    await fetchFavorites()
  }

  const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const handleProgressChange = (e) => {
    if (!progressRef.current || !audioRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = percent * duration
    setCurrentTime(percent * duration)
  }

  const handleProgressMouseDown = (e) => {
    e.preventDefault()
    handleProgressChange(e)
    const handleMouseMove = (e) => {
      e.preventDefault()
      requestAnimationFrame(() => handleProgressChange(e))
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleVolumeChange = (e) => {
    if (!volumeRef.current || !audioRef.current) return
    const rect = volumeRef.current.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    setVolume(percent)
    audioRef.current.volume = percent
  }

  const handleVolumeMouseDown = (e) => {
    e.preventDefault()
    handleVolumeChange(e)
    const handleMouseMove = (e) => {
      e.preventDefault()
      requestAnimationFrame(() => handleVolumeChange(e))
    }
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      audioRef.current.volume = volume
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div id="app-container" style={{ display: 'flex', width: '100%', height: '100%' }}>

      <Sidebar
        view={view}
        setView={setView}
        playlists={playlists}
        selectedPlaylist={selectedPlaylist}
        openPlaylist={openPlaylist}
        setShowNewPlaylistModal={setShowNewPlaylistModal}
      />

      <div className="main-view">

        <TopNav
          search={search}
          setSearch={setSearch}
          view={view}
          setView={setView}
          settings={settings}
          setSettingsForm={setSettingsForm}
        />

        <div className="content-area">

          {view === 'home' && (
            <HomeView
              search={search}
              gridAlbums={gridAlbums}
              singles={singles}
              currentTrack={currentTrack}
              openAlbum={openAlbum}
              playTrack={playTrack}
              API_URL={API_URL}
              formatTime={formatTime}
            />
          )}

          {view === 'album' && selectedAlbum && (
            <AlbumDetailView
              selectedAlbum={selectedAlbum}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              playTrack={playTrack}
              API_URL={API_URL}
              formatTime={formatTime}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          )}

          {view === 'songs' && (
            <LibraryView
              tracks={tracks}
              currentTrack={currentTrack}
              playTrack={playTrack}
              API_URL={API_URL}
              formatTime={formatTime}
              isFavorite={isFavorite}
              toggleFavorite={toggleFavorite}
            />
          )}

          {view === 'favorites' && (
            <FavoritesView
              favorites={favorites}
              currentTrack={currentTrack}
              playTrack={playTrack}
              toggleFavorite={toggleFavorite}
              API_URL={API_URL}
              formatTime={formatTime}
            />
          )}

          {view === 'playlist' && selectedPlaylist && (
            <PlaylistView
              selectedPlaylist={selectedPlaylist}
              currentTrack={currentTrack}
              playTrack={playTrack}
              deletePlaylist={deletePlaylist}
              removeFromPlaylist={removeFromPlaylist}
              playlistSearch={playlistSearch}
              setPlaylistSearch={setPlaylistSearch}
              playlistSearchResults={playlistSearchResults}
              addToPlaylist={addToPlaylist}
              API_URL={API_URL}
              formatTime={formatTime}
            />
          )}

          {view === 'settings' && (
            <SettingsView
              settingsForm={settingsForm}
              setSettingsForm={setSettingsForm}
              showToast={showToast}
              saveSettings={saveSettings}
              setView={setView}
              isTauri={isTauri}
            />
          )}

          {view === 'lyrics' && (
            <LyricsView
              currentTrack={currentTrack}
              syncedLyrics={syncedLyrics}
              lyrics={lyrics}
              isLoadingLyrics={isLoadingLyrics}
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              audioRef={audioRef}
              API_URL={API_URL}
            />
          )}

        </div>

        {currentTrack && (
          <PlayerBar
            currentTrack={currentTrack}
            API_URL={API_URL}
            isPlaying={isPlaying}
            togglePlay={togglePlay}
            playPrev={playPrev}
            playNext={playNext}
            shuffle={shuffle}
            setShuffle={setShuffle}
            repeat={repeat}
            setRepeat={setRepeat}
            currentTime={currentTime}
            duration={duration}
            progressRef={progressRef}
            handleProgressMouseDown={handleProgressMouseDown}
            volume={volume}
            volumeRef={volumeRef}
            handleVolumeMouseDown={handleVolumeMouseDown}
            handleVolumeClick={() => { setVolume(volume > 0 ? 0 : 0.7); if (audioRef.current) audioRef.current.volume = volume > 0 ? 0 : 0.7 }}
            view={view}
            setView={setView}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
          />
        )}

        {/* Hidden Audio */}
        <audio
          ref={audioRef}
          onEnded={playNext}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

      </div >

      {showNewPlaylistModal && (
        <div className="modal-overlay" onClick={() => setShowNewPlaylistModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: '1.25rem', fontWeight: 700 }}>Yeni Playlist Oluştur</h3>
            <input
              type="text"
              placeholder="Playlist adı"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              autoFocus
              style={{ width: '100%', padding: '12px 16px', background: '#2a2a2a', border: '1px solid #333', borderRadius: 8, color: 'white', fontSize: '1rem', marginBottom: 20, outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowNewPlaylistModal(false)}
                style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #444', borderRadius: 20, color: 'white', cursor: 'pointer', fontWeight: 600 }}
              >
                İptal
              </button>
              <button
                onClick={createPlaylist}
                style={{ padding: '10px 24px', background: '#1ed760', border: 'none', borderRadius: 20, color: 'black', cursor: 'pointer', fontWeight: 600 }}
              >
                Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {
        toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )
      }

      {
        confirmDialog && (
          <div className="modal-overlay" onClick={() => setConfirmDialog(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <p style={{ margin: '0 0 20px', fontSize: '1rem' }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDialog(null)}
                  style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #444', borderRadius: 20, color: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Iptal
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  style={{ padding: '10px 24px', background: '#e74c3c', border: 'none', borderRadius: 20, color: 'white', cursor: 'pointer', fontWeight: 600 }}
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  )
}

export default App
