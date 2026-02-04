import React, { useRef, useEffect } from 'react'

export const LyricsView = ({
    currentTrack,
    syncedLyrics,
    lyrics,
    isLoadingLyrics,
    currentTime,
    setCurrentTime,
    audioRef,
    lyricsContainerRef,
    API_URL
}) => {
    useEffect(() => {
        // Only scroll if NOT using synced lyrics (synced lyrics use transform)
        if (syncedLyrics.length === 0 && lyricsContainerRef.current) {
            // basic scroll logic if needed for plain lyrics
        }
    }, [currentTime])

    return (
        <div className="view-content" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {currentTrack ? (
                <>
                    <div style={{ display: 'flex', gap: 24, marginBottom: 32, alignItems: 'center', width: '100%', maxWidth: 800 }}>
                        <img
                            src={currentTrack.has_cover ? `${API_URL}/music/cover/${currentTrack.album_id}` : `${API_URL}/music/track-cover/${currentTrack.id}`}
                            style={{ width: 120, height: 120, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                            onError={(e) => { e.target.style.opacity = 0 }}
                            alt=""
                        />
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>{currentTrack.title}</h2>
                            <div style={{ fontSize: '1.2rem', color: '#b3b3b3' }}>{currentTrack.artist}</div>
                        </div>
                    </div>

                    {/* Lyrics Container */}
                    <div
                        ref={lyricsContainerRef}
                        style={{
                            flex: 1,
                            width: '100%',
                            maxWidth: 800,
                            position: 'relative',
                            overflow: 'hidden',
                            maskImage: syncedLyrics.length > 0 ? 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' : 'none',
                            WebkitMaskImage: syncedLyrics.length > 0 ? 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' : 'none',
                        }}
                    >
                        {isLoadingLyrics ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 16 }}>
                                <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#1ed760', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                <div style={{ color: '#888', fontSize: '1.2rem' }}>Sözler aranıyor...</div>
                            </div>
                        ) : syncedLyrics.length > 0 ? (
                            (() => {
                                const ITEM_HEIGHT = 80 // Estimate height of a line including margin
                                const activeIndex = syncedLyrics.findIndex((line, i) => currentTime >= line.time && (!syncedLyrics[i + 1] || currentTime < syncedLyrics[i + 1].time))
                                const safeIndex = activeIndex === -1 ? 0 : activeIndex

                                return (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: 0,
                                            right: 0,
                                            transform: `translateY(-${safeIndex * ITEM_HEIGHT + (ITEM_HEIGHT / 2)}px)`, // Center the active item
                                            transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                            width: '100%'
                                        }}
                                    >
                                        {syncedLyrics.map((line, i) => {
                                            const isActive = i === safeIndex
                                            // Render only nearby lines for DOM performance, though transform handles view
                                            // Adjust range as needed. +/- 10 is safe for smooth scrolling feels
                                            if (Math.abs(i - safeIndex) > 10) return null

                                            // Calculate blur and scale based on distance from active
                                            const distance = Math.abs(i - safeIndex)
                                            const scale = isActive ? 1.05 : 1 - (distance * 0.05)
                                            const opacity = isActive ? 1 : 1 - (distance * 0.4)
                                            const blur = isActive ? 0 : distance * 2

                                            return (
                                                <p
                                                    key={i}
                                                    style={{
                                                        height: ITEM_HEIGHT,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: isActive ? '2rem' : '1.4rem',
                                                        fontWeight: isActive ? 800 : 600,
                                                        color: 'white',
                                                        opacity: Math.max(0.1, opacity),
                                                        transform: `scale(${scale})`,
                                                        filter: `blur(${blur}px)`,
                                                        margin: 0,
                                                        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        padding: '0 20px'
                                                    }}
                                                    onClick={() => {
                                                        if (audioRef.current) {
                                                            audioRef.current.currentTime = line.time
                                                            setCurrentTime(line.time)
                                                        }
                                                    }}
                                                >
                                                    {line.text}
                                                </p>
                                            )
                                        })}
                                    </div>
                                )
                            })()
                        ) : lyrics?.plainLyrics ? (
                            <div style={{ height: '100%', overflowY: 'auto', padding: '0 20px', textAlign: 'center' }} className="hide-scrollbar">
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 2, fontSize: '1.4rem', color: '#ccc', padding: '40px 0' }}>
                                    {lyrics.plainLyrics}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
                                <div style={{ color: '#888', fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>Sözler bulunamadı</div>
                                <div style={{ color: '#555', fontSize: '1rem' }}>Bu şarkı için henüz söz eklenmemiş.</div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                    Şarkı çalmıyor
                </div>
            )}
        </div>
    )
}
