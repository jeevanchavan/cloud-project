const songModel = require("../models/song.model")
const storageService = require("../services/storage.service")
const id3 = require("node-id3")


async function uploadSong(req, res) {

    const songBuffer = req.file.buffer
    const { mood } = req.body

    const tags = id3.read(songBuffer)

    const [ songFile, posterFile ] = await Promise.all([
        storageService.uploadFile({
            buffer: songBuffer,
            filename: tags.title + ".mp3",
            folder: "/cohort-2/moodify/songs"
        }),
        storageService.uploadFile({
            buffer: tags.image.imageBuffer,
            filename: tags.title + ".jpeg",
            folder: "/cohort-2/moodify/posters"
        })
    ])

    const song = await songModel.create({
        title: tags.title,
        url: songFile.url,
        posterUrl: posterFile.url,
        mood
    })

    res.status(201).json({
        message: "song created successfully",
        song
    })

}

async function getSong(req, res) {
    try {
        const { mood } = req.query
        const query = mood ? { mood } : {}

        const count = await songModel.countDocuments(query)
        let song = null

        if (count > 0) {
            const randomIndex = Math.floor(Math.random() * count)
            song = await songModel.findOne(query).skip(randomIndex)
        }

        res.status(200).json({
            message: "song fetched successfully.",
            song,
        })
    } catch (err) {
        res.status(500).json({ message: "Error fetching song", error: err.message })
    }
}

async function getAllSongs(req, res) {
    try {
        const { mood } = req.query
        const query = mood ? { mood } : {}
        const songs = await songModel.find(query)
        res.status(200).json({ songs })
    } catch (err) {
        res.status(500).json({ message: "Error fetching songs", error: err.message })
    }
}

async function seedSongs(req, res) {
    const songsToSeed = [
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

    try {
        for (const item of songsToSeed) {
            await songModel.findOneAndUpdate(
                { title: item.title },
                item,
                { upsert: true, new: true }
            )
        }
        const all = await songModel.find({})
        res.status(200).json({ message: "Songs seeded successfully", count: all.length, songs: all })
    } catch (err) {
        res.status(500).json({ message: "Error seeding songs", error: err.message })
    }
}

module.exports = { uploadSong, getSong, getAllSongs, seedSongs }