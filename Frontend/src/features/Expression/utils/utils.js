import {
    FaceLandmarker,
    FilesetResolver
} from "@mediapipe/tasks-vision";


export const init = async ({ landmarkerRef, videoRef, streamRef }) => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    landmarkerRef.current = await FaceLandmarker.createFromOptions(
        vision,
        {
            baseOptions: {
                modelAssetPath:
                    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
            },
            outputFaceBlendshapes: true,
            runningMode: "VIDEO",
            numFaces: 1
        }
    );

    streamRef.current = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = streamRef.current;
    await videoRef.current.play();
};

export const detect = ({ landmarkerRef, videoRef, setExpression }) => {
    if (!landmarkerRef.current || !videoRef.current) {
        if (setExpression) setExpression("Camera not ready");
        return null;
    }

    const results = landmarkerRef.current.detectForVideo(
        videoRef.current,
        performance.now()
    );

    if (results.faceBlendshapes?.length > 0) {
        const blendshapes = results.faceBlendshapes[ 0 ].categories;

        const getScore = (name) =>
            blendshapes.find((b) => b.categoryName === name)?.score || 0;

        // 1. Happy Signals (mouth smile + cheek squint)
        const smileLeft = getScore("mouthSmileLeft");
        const smileRight = getScore("mouthSmileRight");
        const cheekSquintLeft = getScore("cheekSquintLeft");
        const cheekSquintRight = getScore("cheekSquintRight");
        const avgSmile = (smileLeft + smileRight) / 2;
        const avgCheek = (cheekSquintLeft + cheekSquintRight) / 2;
        const happyScore = avgSmile * 1.3 + avgCheek * 0.3;

        // 2. Surprised Signals (wide eyes + raised outer/inner brows + open jaw)
        const jawOpen = getScore("jawOpen");
        const eyeWideLeft = getScore("eyeWideLeft");
        const eyeWideRight = getScore("eyeWideRight");
        const avgEyeWide = (eyeWideLeft + eyeWideRight) / 2;
        const browOuterUpLeft = getScore("browOuterUpLeft");
        const browOuterUpRight = getScore("browOuterUpRight");
        const browInnerUp = getScore("browInnerUp");
        const avgBrowUp = (browOuterUpLeft + browOuterUpRight + browInnerUp) / 3;
        const surprisedScore = (avgEyeWide * 1.5) + (avgBrowUp * 1.1) + (jawOpen * 0.9);

        // 3. Sad Signals (lip corner depressor + chin shrug + inner brow raise + brow furrow)
        const frownLeft = getScore("mouthFrownLeft");
        const frownRight = getScore("mouthFrownRight");
        const avgFrown = (frownLeft + frownRight) / 2;
        const mouthShrugLower = getScore("mouthShrugLower");
        const mouthRollLower = getScore("mouthRollLower");
        const browDownLeft = getScore("browDownLeft");
        const browDownRight = getScore("browDownRight");
        const avgBrowDown = (browDownLeft + browDownRight) / 2;

        // MediaPipe mouthFrown has low dynamic range (~0.01-0.04), so scale appropriately
        const mouthSadness = (avgFrown * 4.5) + (mouthShrugLower * 1.8) + (mouthRollLower * 1.2);
        // Inner brow raise indicates sadness only when eyes are NOT wide open
        const sadBrow = Math.max(0, browInnerUp - avgEyeWide * 0.7) * 1.3;
        // Inhibit sadness if actively smiling or mouth wide open
        const sadInhibition = Math.max(0, 1 - (avgSmile * 3.0) - (jawOpen * 2.0));
        const sadScore = ((mouthSadness * 0.55) + (sadBrow * 0.35) + (avgBrowDown * 0.25)) * sadInhibition;

        // --- Minimum threshold required to trigger non-neutral ---
        const THRESHOLD = 0.26;

        let detected = "neutral";
        let highest = 0;

        if (happyScore > highest && happyScore >= THRESHOLD) {
            highest = happyScore;
            detected = "happy";
        }
        if (surprisedScore > highest && surprisedScore >= THRESHOLD) {
            highest = surprisedScore;
            detected = "surprised";
        }
        if (sadScore > highest && sadScore >= THRESHOLD) {
            highest = sadScore;
            detected = "sad";
        }

        console.log(`[VibeTrack Emotion Detection] Happy: ${happyScore.toFixed(2)}, Sad: ${sadScore.toFixed(2)}, Surprised: ${surprisedScore.toFixed(2)} -> Result: ${detected}`);

        if (setExpression) setExpression(detected);
        return detected;
    } else {
        if (setExpression) setExpression("No face detected");
        return null;
    }
};