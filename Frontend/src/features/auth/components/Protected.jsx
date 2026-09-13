import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate, useNavigate } from 'react-router'
import { useEffect } from 'react'

const Protected = ({ children }) => {

    const {
        user, loading
    } = useAuth()
    const navigate = useNavigate()

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0B0B0F',
                gap: '16px'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid rgba(139, 92, 246, 0.2)',
                    borderTopColor: '#8B5CF6',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite'
                }} />
                <p style={{ color: '#71717A', fontSize: '0.9rem', fontWeight: 500 }}>
                    Loading VibeTrack...
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }
    
    if (!user) {
        return <Navigate to="/login" />
    }

    return children
}

export default Protected