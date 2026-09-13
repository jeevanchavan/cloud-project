import { login, register, getMe, logout } from "../services/auth.api";
import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { useEffect } from "react";


export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    async function handleRegister({ username, email, password }) {
        setLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
            return data
        } catch (error) {
            console.error("Registration error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    async function handleLogin({ username, email, password }) {
        setLoading(true)
        try {
            const data = await login({ username, email, password })
            setUser(data.user)
            return data
        } catch (error) {
            console.error("Login error:", error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    async function handleGetMe() {
        setLoading(true)
        try {
            const data = await getMe()
            setUser(data.user)
        } catch (error) {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    async function handleLogout() {
        setLoading(true)
        try {
            await logout()
            setUser(null)
        } catch (error) {
            console.error("Logout error:", error)
        } finally {
            setUser(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        handleGetMe()
    }, [])

    return ({
        user, loading, handleRegister, handleLogin, handleLogout, handleGetMe
    })
}