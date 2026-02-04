import React from 'react'
import { Search, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

// Helper to check tauri environment, can also be passed as prop
const isTauriEnv = typeof window !== 'undefined' && 'current' in (window.__TAURI_INTERNALS__ ?? {})

export const TopNav = ({
    search,
    setSearch,
    view,
    setView,
    settings,
    setSettingsForm
}) => {

    const handleMinimize = async () => {
        if (!isTauriEnv) return
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        getCurrentWindow().minimize()
    }

    const handleMaximize = async () => {
        if (!isTauriEnv) return
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        getCurrentWindow().toggleMaximize()
    }

    const handleClose = async () => {
        if (!isTauriEnv) return
        const { getCurrentWindow } = await import('@tauri-apps/api/window')
        getCurrentWindow().close()
    }

    return (
        <header className="top-bar" data-tauri-drag-region>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="search-container" style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#b3b3b3' }} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Ne dinlemek istersin?"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    className="nav-arrow-btn"
                    style={{ background: 'transparent' }}
                    onClick={() => {
                        if (setSettingsForm) setSettingsForm(settings)
                        setView('settings')
                    }}
                >
                    <Settings size={20} color={view === 'settings' ? '#1ed760' : '#b3b3b3'} />
                </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="nav-arrows">
                    <button className="nav-arrow-btn" onClick={() => setView('home')}><ChevronLeft size={20} /></button>
                    <button className="nav-arrow-btn"><ChevronRight size={20} /></button>
                </div>
                {isTauriEnv && (
                    <div className="window-controls">
                        <button className="window-btn window-btn-minimize" onClick={handleMinimize} />
                        <button className="window-btn window-btn-maximize" onClick={handleMaximize} />
                        <button className="window-btn window-btn-close" onClick={handleClose} />
                    </div>
                )}
            </div>
        </header>
    )
}
