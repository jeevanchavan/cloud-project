import React, { useState } from 'react'
import "../style/register.scss"
import FormGroup from '../components/FormGroup'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Register = () => {
    const [ username, setUsername ] = useState("")
    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ formError, setFormError ] = useState("")

    const navigate = useNavigate()
    const { loading, handleRegister } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError("")
        try {
            await handleRegister({ username, password, email })
            navigate('/')
        } catch (err) {
            setFormError(err.response?.data?.message || "Registration failed. Please try again.")
        }
    }

    return (
        <main className="auth-page">
            <div className="auth-container">
                {/* Left Hero Side */}
                <div className="auth-hero">
                    <div className="auth-hero__backdrop" />
                    <div className="auth-hero__brand">
                        <div className="auth-hero__logo-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                                <rect x="2" y="10" width="2.5" height="4" rx="1.2" />
                                <rect x="6.5" y="6" width="2.5" height="12" rx="1.2" />
                                <rect x="11" y="2" width="2.5" height="20" rx="1.2" />
                                <rect x="15.5" y="7" width="2.5" height="10" rx="1.2" />
                                <rect x="20" y="10" width="2.5" height="4" rx="1.2" />
                            </svg>
                        </div>
                        <span className="auth-hero__logo-text">VibeTrack</span>
                    </div>

                    <div className="auth-hero__content">
                        <span className="auth-hero__badge">Join VibeTrack</span>
                        <h1 className="auth-hero__title">
                            Your mood. Your music.
                        </h1>
                        <p className="auth-hero__subtitle">
                            Unlock emotion-driven playlists powered by intelligent computer vision and real-time facial expression detection.
                        </p>

                        <div className="auth-hero__chips">
                            <span className="auth-hero__chip">Instant Detection</span>
                            <span className="auth-hero__chip">Curated Soundtracks</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-card__header">
                            <h2>Create your account</h2>
                            <p>Sign up in seconds and discover music tailored to your emotions.</p>
                        </div>

                        {formError && (
                            <div className="auth-card__error">
                                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-card__form">
                            <FormGroup
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                label="Username"
                                type="text"
                                placeholder="Choose a username"
                                id="reg-username"
                            />
                            <FormGroup
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email address"
                                type="email"
                                placeholder="name@example.com"
                                id="reg-email"
                            />
                            <FormGroup
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Password"
                                type="password"
                                placeholder="Create a secure password"
                                id="reg-password"
                            />

                            <button className="button auth-card__submit-btn" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="auth-card__spinner" />
                                        <span>Creating account...</span>
                                    </>
                                ) : (
                                    "Create Account"
                                )}
                            </button>
                        </form>

                        <p className="auth-card__footer">
                            Already have an account? <Link to="/login">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Register


