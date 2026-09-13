import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useSong } from '../hooks/useSong'
import './sidebar.scss'

const SUPPORTED_MOODS = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sad', label: 'Sad', emoji: '💔' },
    { id: 'surprised', label: 'Surprised', emoji: '⚡' }
]

const Sidebar = ({ activeTab = 'home', onSelectTab }) => {
    const { user, handleLogout } = useAuth()
    const { handleGetSong } = useSong()
    const navigate = useNavigate()
    const [mobileOpen, setMobileOpen] = useState(false)

    const initialLetter = (user?.username?.[0] || 'U').toUpperCase()

    const handleNavClick = (tab) => {
        if (onSelectTab) onSelectTab(tab)
        setMobileOpen(false)
    }

    const onLogoutClick = async () => {
        try {
            await handleLogout()
            navigate('/login')
        } catch (err) {
            console.error("Logout failed:", err)
            navigate('/login')
        }
    }

    return (
        <>
            {/* Mobile Top Header */}
            <div className="mobile-header">
                <div className="mobile-header__brand">
                    <div className="mobile-header__logo-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <rect x="2" y="10" width="2.5" height="4" rx="1.2" />
                            <rect x="6.5" y="6" width="2.5" height="12" rx="1.2" />
                            <rect x="11" y="2" width="2.5" height="20" rx="1.2" />
                            <rect x="15.5" y="7" width="2.5" height="10" rx="1.2" />
                            <rect x="20" y="10" width="2.5" height="4" rx="1.2" />
                        </svg>
                    </div>
                    <span className="mobile-header__title">VibeTrack</span>
                </div>
                <button
                    className="mobile-header__toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    {mobileOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Backdrop */}
            {mobileOpen && (
                <div
                    className="sidebar__backdrop"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Sidebar (Desktop fixed / Mobile drawer) */}
            <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
                {/* Top Brand Logo */}
                <div className="sidebar__brand">
                    <div className="sidebar__logo-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                            <rect x="2" y="10" width="2.5" height="4" rx="1.2" />
                            <rect x="6.5" y="6" width="2.5" height="12" rx="1.2" />
                            <rect x="11" y="2" width="2.5" height="20" rx="1.2" />
                            <rect x="15.5" y="7" width="2.5" height="10" rx="1.2" />
                            <rect x="20" y="10" width="2.5" height="4" rx="1.2" />
                        </svg>
                    </div>
                    <div className="sidebar__brand-text">
                        <span className="sidebar__logo-title">VibeTrack</span>
                        <span className="sidebar__logo-tag">Music & Mood</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar__nav">
                    <div className="sidebar__section-label">Navigation</div>
                    <button
                        className={`sidebar__nav-item ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => handleNavClick('home')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        <span>Dashboard</span>
                    </button>

                    <button
                        className={`sidebar__nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
                        onClick={() => handleNavClick('scanner')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>Mood Scanner</span>
                    </button>

                    <button
                        className={`sidebar__nav-item ${activeTab === 'library' ? 'active' : ''}`}
                        onClick={() => handleNavClick('library')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                        <span>Featured Tracks</span>
                    </button>
                </nav>

                {/* Quick Mood Shortcuts */}
                <div className="sidebar__moods">
                    <div className="sidebar__section-label">Quick Vibes</div>
                    <div className="sidebar__mood-list">
                        {SUPPORTED_MOODS.map((m) => (
                            <button
                                key={m.id}
                                className={`sidebar__mood-btn sidebar__mood-btn--${m.id}`}
                                onClick={() => {
                                    handleGetSong({ mood: m.id })
                                    setMobileOpen(false)
                                }}
                                title={`Play ${m.label} songs`}
                            >
                                <span className="sidebar__mood-emoji">{m.emoji}</span>
                                <span className="sidebar__mood-name">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* User Profile & Logout */}
                <div className="sidebar__profile">
                    <div className="sidebar__user">
                        <div className="sidebar__avatar">
                            {initialLetter}
                        </div>
                        <div className="sidebar__user-meta">
                            <p className="sidebar__username">{user?.username || 'User'}</p>
                            <span className="sidebar__user-email">{user?.email || 'Active'}</span>
                        </div>
                    </div>

                    <button
                        className="sidebar__logout-btn"
                        onClick={onLogoutClick}
                        title="Sign Out"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export default Sidebar
