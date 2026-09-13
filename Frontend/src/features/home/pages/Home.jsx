import React, { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useSong } from '../hooks/useSong'
import FaceExpression from '../../Expression/components/FaceExpression'
import Player from '../components/Player'
import Sidebar from '../components/Sidebar'
import './home.scss'

const MOOD_OPTIONS = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'sad', label: 'Sad', emoji: '💔' },
    { id: 'surprised', label: 'Surprised', emoji: '⚡' }
]

const FILTER_MOODS = ['all', 'happy', 'sad', 'surprised']

const Home = () => {
    const { user } = useAuth()
    const { handleGetSong, song, playlist, selectSong, nextSong } = useSong()
    const [ activeFilter, setActiveFilter ] = useState('all')
    const [ activeTab, setActiveTab ] = useState('home')

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

    const filteredSongs = activeFilter === 'all'
        ? playlist
        : playlist?.filter((s) => s.mood === activeFilter)

    const handleTabSelect = (tab) => {
        setActiveTab(tab)
        const element = document.getElementById(tab)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <div className="dashboard-layout">
            {/* Desktop Sidebar */}
            <Sidebar activeTab={activeTab} onSelectTab={handleTabSelect} />

            {/* Main Content Area */}
            <main className="dashboard-main" id="home">
                {/* Greeting Header */}
                <header className="dash-header">
                    <h1 className="dash-header__greeting">
                        {greeting}, {user?.username || 'Listener'}
                    </h1>
                    <p className="dash-header__subtitle">
                        How are you feeling today? Scan your face or pick a vibe below to get customized recommendations.
                    </p>
                </header>

                {/* What's Your Vibe */}
                <section className="vibe-section">
                    <h3 className="vibe-section__title">What's your vibe?</h3>
                    <div className="vibe-section__pills">
                        {MOOD_OPTIONS.map((m) => (
                            <button
                                key={m.id}
                                className={`vibe-section__pill vibe-section__pill--${m.id} ${song?.mood === m.id ? 'active' : ''}`}
                                onClick={() => handleGetSong({ mood: m.id })}
                            >
                                <span className="vibe-section__emoji">{m.emoji}</span>
                                <span className="vibe-section__name">{m.label}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Hero Mood Match Card */}
                {song && (
                    <section className="hero-match">
                        <div className="hero-match__artwork-wrap">
                            <img
                                className="hero-match__artwork"
                                src={song.posterUrl}
                                alt={song.title}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
                                }}
                            />
                        </div>

                        <div className="hero-match__content">
                            <div className="hero-match__badge">
                                Your Mood Match
                            </div>
                            <h2 className="hero-match__title">{song.title}</h2>
                            <div className="hero-match__meta">
                                <span className={`hero-match__mood-tag hero-match__mood-tag--${song.mood}`}>
                                    {song.mood}
                                </span>
                                <p className="hero-match__artist">VibeTrack Recommendation</p>
                            </div>

                            <div className="hero-match__actions">
                                <button
                                    className="button hero-match__play-btn"
                                    onClick={() => selectSong(song)}
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <span>Play Track</span>
                                </button>
                                <button
                                    className="hero-match__next-btn"
                                    onClick={nextSong}
                                    title="Get another recommendation"
                                >
                                    <span>Next Track</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </section>
                )}

                {/* AI Expression Scanner */}
                <section className="scanner-section" id="scanner">
                    <FaceExpression
                        onClick={(expression) => { handleGetSong({ mood: expression }) }}
                    />
                </section>

                {/* Featured Song Library */}
                <section className="library-section" id="library">
                    <div className="library-section__header">
                        <div className="library-section__title-wrap">
                            <h3>Featured Tracks</h3>
                            <span>({playlist?.length || 0} songs available)</span>
                        </div>

                        <div className="library-section__filters">
                            {FILTER_MOODS.map((m) => (
                                <button
                                    key={m}
                                    className={activeFilter === m ? 'active' : ''}
                                    onClick={() => setActiveFilter(m)}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="library-section__grid">
                        {filteredSongs?.map((item, idx) => {
                            const isCurrent = song?.url === item.url
                            return (
                                <div
                                    key={idx}
                                    className={`library-section__card ${isCurrent ? 'active' : ''}`}
                                    onClick={() => selectSong(item)}
                                >
                                    <div className="library-section__card-img-wrap">
                                        <img
                                            className="library-section__card-img"
                                            src={item.posterUrl}
                                            alt={item.title}
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'
                                            }}
                                        />
                                        <div className="library-section__play-overlay">
                                            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="library-section__card-meta">
                                        <h4>{item.title}</h4>
                                        <span>{item.mood}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </main>

            {/* Sticky Bottom Music Player */}
            <Player />
        </div>
    )
}

export default Home