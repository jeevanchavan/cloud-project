import React, { useRef, useState, useEffect, useContext } from 'react'
import { SongContext } from '../song.context'
import { useSong } from '../hooks/useSong'
import './player.scss'

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2]

const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

const Player = () => {
    const { song, error, nextSong, prevSong } = useSong()

    const audioRef = useRef(null)
    const progressRef = useRef(null)

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [speed, setSpeed] = useState(1)
    const [volume, setVolume] = useState(1)
    const [showSpeed, setShowSpeed] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackError, setPlaybackError] = useState(null)

    // Reset player when song changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
            setIsPlaying(false)
            setCurrentTime(0)
            setPlaybackError(null)
        }
    }, [song?.url])

    const togglePlay = () => {
        const audio = audioRef.current
        if (!audio) return
        setPlaybackError(null)
        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
        } else {
            const playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true)
                    })
                    .catch((err) => {
                        console.error("Audio play error:", err)
                        setIsPlaying(false)
                        setPlaybackError("Cannot play audio. Please verify audio source.")
                    })
            }
        }
    }

    const skip = (secs) => {
        const audio = audioRef.current
        if (!audio || !duration || isNaN(duration)) return
        audio.currentTime = Math.min(Math.max(audio.currentTime + secs, 0), duration)
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime || 0)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration || 0)
            setPlaybackError(null)
        }
    }

    const handleProgressClick = (e) => {
        if (!duration || isNaN(duration) || duration <= 0) return
        const bar = progressRef.current
        if (!bar) return
        const rect = bar.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const newTime = ratio * duration
        if (audioRef.current && !isNaN(newTime)) {
            audioRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleSpeedChange = (s) => {
        setSpeed(s)
        if (audioRef.current) {
            audioRef.current.playbackRate = s
        }
        setShowSpeed(false)
    }

    const handleVolume = (e) => {
        const val = parseFloat(e.target.value)
        setVolume(val)
        if (audioRef.current) {
            audioRef.current.volume = val
        }
        setIsMuted(val === 0)
    }

    const toggleMute = () => {
        const audio = audioRef.current
        if (!audio) return
        if (isMuted) {
            audio.volume = volume || 0.5
            setIsMuted(false)
        } else {
            audio.volume = 0
            setIsMuted(true)
        }
    }

    const handleSongEnd = () => {
        setIsPlaying(false)
        setCurrentTime(0)
    }

    const progress = duration ? (currentTime / duration) * 100 : 0

    if (!song) {
        return (
            <div className="player player--empty">
                <p>No song selected. Detect an expression or upload songs to start playing.</p>
            </div>
        )
    }

    return (
        <div className="player">
            <audio
                ref={audioRef}
                src={song.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleSongEnd}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => {
                    setIsPlaying(false)
                    setPlaybackError("Failed to load audio stream.")
                }}
            />

            {/* Left: Poster + Info */}
            <div className="player__left">
                <img
                    className="player__poster"
                    src={song.posterUrl}
                    alt={song.title}
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100"
                    }}
                />
                <div className="player__meta">
                    <p className="player__title" title={song.title}>{song.title}</p>
                    <div className="player__submeta">
                        <span className={`player__mood player__mood--${song.mood}`}>{song.mood}</span>
                        <span className="player__artist">VibeTrack</span>
                    </div>
                    {(playbackError || error) && (
                        <span className="player__error-badge" title={playbackError || error}>
                            {playbackError || error}
                        </span>
                    )}
                </div>
            </div>

            {/* Center: Controls + Progress bar */}
            <div className="player__center">
                <div className="player__controls">
                    {/* Previous Song */}
                    <button className="player__btn player__btn--nav" onClick={prevSong} title="Previous Song">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </button>

                    {/* Backward 5s */}
                    <button className="player__btn player__btn--skip" onClick={() => skip(-5)} title="Back 5s">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M1 4v6h6"/>
                            <path d="M3.51 15a9 9 0 1 0 .49-3.6"/>
                        </svg>
                        <span>5s</span>
                    </button>

                    {/* Play / Pause */}
                    <button className="player__btn player__btn--play" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                <rect x="6" y="4" width="4" height="16" rx="1"/>
                                <rect x="14" y="4" width="4" height="16" rx="1"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                <path d="M8 5.14v14l11-7-11-7z"/>
                            </svg>
                        )}
                    </button>

                    {/* Forward 5s */}
                    <button className="player__btn player__btn--skip" onClick={() => skip(5)} title="Forward 5s">
                        <span>5s</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M23 4v6h-6"/>
                            <path d="M20.49 15a9 9 0 1 1-.49-3.6"/>
                        </svg>
                    </button>

                    {/* Next Song */}
                    <button className="player__btn player__btn--nav" onClick={nextSong} title="Next Song">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </button>
                </div>

                {/* Progress bar */}
                <div className="player__progress-wrap">
                    <span className="player__time">{formatTime(currentTime)}</span>
                    <div
                        className="player__progress"
                        ref={progressRef}
                        onClick={handleProgressClick}
                    >
                        <div className="player__progress-fill" style={{ width: `${progress}%` }} />
                        <div className="player__progress-thumb" style={{ left: `${progress}%` }} />
                    </div>
                    <span className="player__time">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Right: Speed + Volume */}
            <div className="player__right">
                {/* Speed picker */}
                <div className="player__speed-wrap">
                    <button
                        className="player__btn player__btn--speed"
                        onClick={() => setShowSpeed(!showSpeed)}
                        title="Playback speed"
                    >
                        {speed}×
                    </button>
                    {showSpeed && (
                        <div className="player__speed-menu">
                            {SPEED_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    className={`player__speed-option ${s === speed ? 'active' : ''}`}
                                    onClick={() => handleSpeedChange(s)}
                                >
                                    {s}×
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Volume */}
                <div className="player__volume">
                    <button className="player__btn player__btn--vol" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                        {isMuted || volume === 0 ? (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.87 8.87 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                            </svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolume}
                        className="player__volume-slider"
                    />
                </div>
            </div>
        </div>
    )
}

export default Player