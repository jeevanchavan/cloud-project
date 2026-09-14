import axios from "axios";


const api = axios.create({
    baseURL: "/api",
    withCredentials: true
})


export async function getSong({ mood }) {
    const response = await api.get("/songs?mood=" + mood)
    console.log(response)
    return response.data
}