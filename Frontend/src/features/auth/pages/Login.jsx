import React, { useState } from 'react'
import "../style/login.scss"
import FormGroup from '../components/FormGroup'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

const Login = () => {
    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")
    const [ formError, setFormError ] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        setFormError("")
        try {
            await handleLogin({ email, password })
            navigate("/")
        } catch (err) {
            setFormError(err.response?.data?.message || "Invalid email or password. Please try again.")
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
                        <span className="auth-hero__badge">Mood-Based Music</span>
                        <h1 className="auth-hero__title">
                            Music tailored to how you feel.
                        </h1>
                        <p className="auth-hero__subtitle">
                            Analyze your facial expression in real time or select your vibe manually to instantly discover matching tracks.
                        </p>

                        <div className="auth-hero__chips">
                            <span className="auth-hero__chip">Happy</span>
                            <span className="auth-hero__chip">Sad</span>
                            <span className="auth-hero__chip">Surprised</span>
                        </div>
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="auth-form-side">
                    <div className="auth-card">
                        <div className="auth-card__header">
                            <h2>Welcome back</h2>
                            <p>Enter your credentials to continue your listening journey.</p>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                label="Email address"
                                type="email"
                                placeholder="name@example.com"
                                id="login-email"
                            />
                            <FormGroup
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                id="login-password"
                            />

                            <button className="button auth-card__submit-btn" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="auth-card__spinner" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <p className="auth-card__footer">
                            Don't have an account? <Link to="/register">Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Login