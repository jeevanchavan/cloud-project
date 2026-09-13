import { getSong } from "../service/song.api";
import { useContext } from "react";
import { SongContext } from "../song.context";


export const useSong = () => {
    const context = useContext(SongContext)

    const {
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
    } = context

    async function handleGetSong({ mood }) {
        setLoading(true)
        if (setError) setError(null)

        // Normalize mood to match backend enum (happy, sad, surprised)
        let normalizedMood = (mood || "happy").toLowerCase()
        if (normalizedMood === "neutral") {
            normalizedMood = "happy"
        }

        try {
            const data = await getSong({ mood: normalizedMood })
            if (data?.song) {
                setSong(data.song)
                if (setError) setError(null)
            } else {
                // Pick a matching song from the curated playlist
                const matchingSongs = playlist.filter((s) => s.mood === normalizedMood)
                if (matchingSongs.length > 0) {
                    const randomSong = matchingSongs[Math.floor(Math.random() * matchingSongs.length)]
                    setSong(randomSong)
                }
            }
        } catch (err) {
            console.warn("Backend unavailable, picking from local playlist for mood:", normalizedMood)
            const matchingSongs = playlist.filter((s) => s.mood === normalizedMood)
            if (matchingSongs.length > 0) {
                const randomSong = matchingSongs[Math.floor(Math.random() * matchingSongs.length)]
                setSong(randomSong)
            }
        } finally {
            setLoading(false)
        }
    }

    return ({
        loading,
        song,
        playlist,
        nextSong,
        prevSong,
        selectSong,
        error,
        handleGetSong,
        setSong,
        setError
    })
}
