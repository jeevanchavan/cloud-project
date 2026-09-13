import { useEffect, useRef, useState } from "react";
import { detect, init } from "../utils/utils";
import "./faceExpression.scss";

export default function FaceExpression({ onClick = () => { } }) {
    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const streamRef = useRef(null);

    const [ expression, setExpression ] = useState("Ready to Scan");

    useEffect(() => {
        init({ landmarkerRef, videoRef, streamRef });

        return () => {
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }

            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

    async function handleClick() {
        const detected = detect({ landmarkerRef, videoRef, setExpression })
        console.log("Detected expression:", detected)
        if (detected) {
            onClick(detected)
        }
    }

    const moodEmoji = {
        happy: "😊",
        sad: "💔",
        surprised: "⚡",
        neutral: "😌"
    }[expression?.toLowerCase()] || "✨"

    return (
        <div className="ai-scanner">
            <div className="ai-scanner__header">
                <span className="ai-scanner__badge">Expression Detection</span>
                <h3 className="ai-scanner__title">Mood Scanner</h3>
                <p className="ai-scanner__desc">
                    Look directly into your camera and scan your facial expression to instantly find music that matches your vibe.
                </p>
            </div>

            <div className="ai-scanner__viewport">
                <video
                    ref={videoRef}
                    className="ai-scanner__video"
                    playsInline
                />
            </div>

            <div className="ai-scanner__footer">
                <div className={`ai-scanner__status-pill ai-scanner__status-pill--${expression?.toLowerCase()}`}>
                    <span>{moodEmoji}</span>
                    <span>{expression ? `Mood: ${expression}` : "Ready to scan"}</span>
                </div>

                <button className="button ai-scanner__btn" onClick={handleClick}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span>Scan My Expression</span>
                </button>
            </div>
        </div>
    );
}