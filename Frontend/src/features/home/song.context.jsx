import { createContext } from "react";
import { useState } from "react";

export const DEFAULT_SONGS = [
    {
        title: "Sunny Horizons",
        mood: "happy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        posterUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500"
    },
    {
        title: "Golden Vibes",
        mood: "happy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        posterUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500"
    },
    {
        title: "Sunset Groove",
        mood: "happy",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        posterUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500"
    },
    {
        title: "Rainy Day Melancholy",
        mood: "sad",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        posterUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500"
    },
    {
        title: "Midnight Blues",
        mood: "sad",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        posterUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500"
    },
    {
        title: "Quiet Shadows",
        mood: "sad",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        posterUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500"
    },
    {
        title: "Electric Pulse",
        mood: "surprised",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500"
    },
    {
        title: "Cosmic Odyssey",
        mood: "surprised",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        posterUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
    },
    {
        title: "Starlight Wonder",
        mood: "surprised",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        posterUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500"
    }
]

export const SongContext = createContext()

export const SongContextProvider = ({ children }) => {
    const [ playlist, setPlaylist ] = useState(DEFAULT_SONGS)
    const [ song, setSong ] = useState(DEFAULT_SONGS[0])
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState(null)

    const nextSong = () => {
        setSong((current) => {
            const index = playlist.findIndex((s) => s.url === current?.url)
            const nextIndex = (index + 1) % playlist.length
            return playlist[nextIndex]
        })
    }

    const prevSong = () => {
        setSong((current) => {
            const index = playlist.findIndex((s) => s.url === current?.url)
            const prevIndex = (index - 1 + playlist.length) % playlist.length
            return playlist[prevIndex]
        })
    }

    const selectSong = (selectedSong) => {
        setSong(selectedSong)
    }

    return (
        <SongContext.Provider
            value={{
                loading,
                setLoading,
                song,
                setSong,
                playlist,
                setPlaylist,
                nextSong,
                prevSong,
                selectSong,
                error,
                setError
            }}
        >
            {children}
        </SongContext.Provider>
    )
}