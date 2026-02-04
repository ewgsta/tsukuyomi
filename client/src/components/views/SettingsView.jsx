import React, { useRef, useEffect } from 'react'
import { Server, Folder, Check } from 'lucide-react'

// Check tauri environment helper
const isTauriEnv = typeof window !== 'undefined' && 'current' in (window.__TAURI_INTERNALS__ ?? {})

export const SettingsView = ({
    settingsForm,
    setSettingsForm,
    showToast,
    saveSettings,
    setView
}) => {
    return (
        <div className="view-content" style={{ padding: '60px 40px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                <h2 className="section-title" style={{ fontSize: '3rem', marginBottom: 40, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)', letterSpacing: '-0.03em', fontWeight: 800 }}>Ayarlar</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48 }}>

                    {/* Settings Sidebar */}
                    <div>
                        <div className="glass-panel" style={{ borderRadius: 16, padding: 12 }}>
                            <div className="premium-transition" style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <Server size={20} />
                                <span style={{ letterSpacing: '-0.01em' }}>Genel</span>
                            </div>
                            <div className="premium-transition" style={{ padding: '14px 18px', borderRadius: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 14, cursor: 'not-allowed', opacity: 0.6, marginTop: 4 }}>
                                <Music size={20} />
                                <span style={{ letterSpacing: '-0.01em' }}>Ses</span>
                            </div>
                            <div className="premium-transition" style={{ padding: '14px 18px', borderRadius: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 14, cursor: 'not-allowed', opacity: 0.6, marginTop: 4 }}>
                                <Disc size={20} />
                                <span style={{ letterSpacing: '-0.01em' }}>Görünüm</span>
                            </div>
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 28, letterSpacing: '-0.02em' }}>Bağlantı Ayarları</h3>

                        <div className="glass-panel" style={{ borderRadius: 24, padding: 32 }}>
                            <label style={{ display: 'block', marginBottom: 16, color: '#b3b3b3', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>BAĞLANTI TÜRÜ</label>

                            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 6, marginBottom: 36, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <button
                                    onClick={() => setSettingsForm({ ...settingsForm, mode: 'remote' })}
                                    className="premium-transition"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: settingsForm.mode === 'remote' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: settingsForm.mode === 'remote' ? 'white' : '#666',
                                        borderRadius: 10,
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        boxShadow: settingsForm.mode === 'remote' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    <Server size={18} /> Uzak Sunucu
                                </button>
                                <button
                                    onClick={() => setSettingsForm({ ...settingsForm, mode: 'local' })}
                                    className="premium-transition"
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: settingsForm.mode === 'local' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: settingsForm.mode === 'local' ? 'white' : '#666',
                                        borderRadius: 10,
                                        border: 'none',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        boxShadow: settingsForm.mode === 'local' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                                    }}
                                >
                                    <Folder size={18} /> Yerel Klasör
                                </button>
                            </div>

                            {settingsForm.mode === 'remote' && (
                                <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                    <label style={{ display: 'block', marginBottom: 12, color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Sunucu Adresi</label>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <Server size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={settingsForm.serverUrl}
                                                onChange={e => setSettingsForm({ ...settingsForm, serverUrl: e.target.value })}
                                                placeholder="http://localhost:8000"
                                                style={{
                                                    width: '100%',
                                                    padding: '16px 16px 16px 50px',
                                                    borderRadius: 12,
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    fontWeight: 400,
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                        </div>
                                        <button
                                            className="premium-button-secondary"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${settingsForm.serverUrl}/api/v1/music/search?q=test`)
                                                    if (res.ok) showToast('Bağlantı Başarılı', 'success')
                                                    else showToast('Sunucuya ulaşılamadı', 'error')
                                                } catch {
                                                    showToast('Bağlantı Hatası', 'error')
                                                }
                                            }}
                                            style={{
                                                padding: '0 28px',
                                                borderRadius: 12,
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Test Et
                                        </button>
                                    </div>
                                    <p style={{ marginTop: 16, fontSize: '0.9rem', color: '#777', lineHeight: 1.6, fontWeight: 400 }}>
                                        Tsukuyomi sunucusunun çalıştığı IP adresi ve portu girin. Genellikle bu <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>http://localhost:8000</code> şeklindedir.
                                    </p>
                                </div>
                            )}

                            {settingsForm.mode === 'local' && (
                                <div style={{ animation: 'fadeIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                                    <label style={{ display: 'block', marginBottom: 12, color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>Müzik Klasörü</label>
                                    <div style={{ display: 'flex', gap: 16 }}>
                                        <div style={{ flex: 1, position: 'relative' }}>
                                            <Folder size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                            <input
                                                type="text"
                                                className="premium-input"
                                                value={settingsForm.musicFolder}
                                                onChange={e => setSettingsForm({ ...settingsForm, musicFolder: e.target.value })}
                                                placeholder="Örn: C:\Users\Music"
                                                style={{
                                                    width: '100%',
                                                    padding: '16px 16px 16px 50px',
                                                    borderRadius: 12,
                                                    color: 'white',
                                                    fontSize: '0.9rem',
                                                    outline: 'none',
                                                    fontWeight: 400,
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                        </div>
                                        <button
                                            className="premium-button-secondary"
                                            onClick={async () => {
                                                if (isTauriEnv) {
                                                    try {
                                                        const { open } = await import('@tauri-apps/plugin-dialog')
                                                        const selected = await open({ directory: true, multiple: false })
                                                        if (selected) {
                                                            setSettingsForm({ ...settingsForm, musicFolder: selected })
                                                        }
                                                    } catch (e) {
                                                        showToast('Klasör seçilemedi', 'error')
                                                    }
                                                } else {
                                                    showToast('Sadece masaüstü uygulamasında kullanılabilir', 'info')
                                                }
                                            }}
                                            style={{
                                                padding: '0 28px',
                                                borderRadius: 12,
                                                color: 'white',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Gözat...
                                        </button>
                                    </div>
                                    <p style={{ marginTop: 16, fontSize: '0.9rem', color: '#777', lineHeight: 1.6, fontWeight: 400 }}>
                                        Müzik dosyalarınızın bulunduğu ana klasörü seçin. Alt klasörler otomatik olarak taranacaktır.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 48 }}>
                            <button
                                onClick={() => setView('home')}
                                className="premium-button-secondary"
                                style={{
                                    padding: '16px 36px',
                                    borderRadius: 30,
                                    color: '#ccc',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    background: 'transparent',
                                    border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#ccc'; e.currentTarget.style.background = 'transparent' }}
                            >
                                Vazgeç
                            </button>
                            <button
                                onClick={saveSettings}
                                style={{
                                    padding: '16px 48px',
                                    background: 'white',
                                    border: 'none',
                                    borderRadius: 30,
                                    color: 'black',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    fontSize: '1rem',
                                    boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
                                    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,255,255,0.25)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,255,255,0.15)' }}
                            >
                                <Check size={20} strokeWidth={3} /> Değişiklikleri Kaydet
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

function Music({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg> }
function Disc({ size }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg> }
