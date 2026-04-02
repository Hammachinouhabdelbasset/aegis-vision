# AEGIS Vision Clinical Dashboard

AEGIS Vision Clinical is a high-performance, real-time driver monitoring system (DMS) dashboard. It provides low-latency, clinical-grade telemetry visualization constructed with a React frontend and a FastAPI (WebSocket) backend. 

---

## 🚀 Quick Start / Setup Guide

### 1. Backend Setup (FastAPI)
The backend manages the data pipeline, aggregates tracking variables, and streams frame updates to the frontend via WebSockets.

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
python -m pip install fastapi uvicorn fpdf2

# Start the server (Dev Mode)
python main.py
```
*The backend will boot up and listen on `http://localhost:8000`.*

### 2. Frontend Setup (React / Vite)
The frontend uses React 19 and Tailwind CSS v4 to render real-time UI components like drowsiness gauges, telemetry timelines, and clinical assessment heatmaps.

```bash
# Open a NEW terminal tab and navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The interactive dashboard will now be available in your browser at `http://localhost:5175`.*

---

## Machine Learning (Computer Vision) Integration Guide
# AEGIS Vision — Real-Time Driver Monitoring System

A real-time computer vision system that monitors driver behavior and detects multiple risk signals simultaneously using a single camera.

![Python](https://img.shields.io/badge/Python-3.12-blue)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10-green)
![YOLOv8](https://img.shields.io/badge/YOLO-v8-red)
![FastAPI](https://img.shields.io/badge/FastAPI-WebSocket-teal)
![React](https://img.shields.io/badge/React-19-blue)

## What it detects

The system continuously tracks five critical driver states:

* **Eye closure / drowsiness**
  Uses Eye Aspect Ratio (EAR), PERCLOS, and blendshape signals.
  Triggers when eye closure exceeds 30% over a sustained period.

* **Yawning**
  Based on Mouth Aspect Ratio (MAR) and jawOpen blendshape.
  Detects repeated yawns (2 or more within 60 seconds).

* **Head nodding**
  Derived from head pose estimation (pitch angle).
  Flags sustained downward head movement beyond 10 degrees.

* **Gaze inattention**
  Uses iris position relative to eye landmarks.
  Triggers when the driver looks away from the road for more than 2.5 seconds.

* **Phone usage**
  Detected using YOLOv8 with COCO class 67.
  Flags when a phone is visible for more than 2 seconds.

## Project structure

aegis-vision/
├── backend/
│   ├── main.py
│   ├── driver_monitor.py
│   ├── signals.py
│   ├── drowsiness_detector.py
│   ├── landmark_indices.py
│   ├── face_landmarker.task
│   ├── best.pt
│   ├── yolov8n.pt
│   └── requirements.txt
└── frontend/
    ├── src/
    └── package.json

## Quick start

### Requirements

* Python 3.12
* Node.js 18+
* Webcam

### 1 — Download MediaPipe model

```bash
cd backend
curl -L -o face_landmarker.task \
https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task

Place both `face_landmarker.task` and `best.pt` inside the `backend/` directory.

### 2 — Backend setup

```bash
cd backend

py -3.12 -m pip install fastapi uvicorn mediapipe opencv-python ultralytics scipy numpy fpdf2

py -3.12 main.py

The server will run at:

http://localhost:8000

You should see logs indicating that the camera opened successfully and the monitor is running.

### 3 — Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at:

http://localhost:5175

## ML pipeline overview:
Webcam frame (640×480)
        |
        v
MediaPipe FaceLandmarker
  → 478 landmarks
  → 52 blendshapes
  → 4×4 head pose matrix
        |
        v
Signal extraction
  EAR   (eye openness)
  MAR   (mouth opening)
  Pose  (pitch, yaw, roll)
  Gaze  (iris position)
        |
        v
Drowsiness analysis
  - Rolling PERCLOS window
  - Yawn frequency tracking
  - Weighted scoring:
      EAR (50%) + yawning (30%) + pitch (20%)
  - Hysteresis levels:
      OK → WARNING → ALERT
        |
        +-- YOLO eye detector (every 3 frames)
        +-- YOLO phone detector (every 5 frames)
        |
        v
Final state:
  OK / WARNING / ALERT / CRITICAL
        |
        v
FastAPI WebSocket → React dashboard (8–30 FPS)

## Data output format

Each processed frame produces structured JSON:


{
  "level": "OK | WARNING | ALERT | CRITICAL",
  "fps": 30.0,
  "timestamp_ms": 1714567890123,
  "drowsy_level": "LOW | MODERATE | HIGH | CRITICAL",
  "drowsy_score": 0.0,
  "ear": 0.31,
  "perclos": 0.05,
  "yawning": false,
  "yawn_count_60s": 0,
  "mar": 0.12,
  "pitch": 4.2,
  "yaw": -12.1,
  "roll": 1.5,
  "gaze_direction": "FORWARD",
  "phone_detected": false
}


## Configuration

Key parameters can be adjusted directly in the code:

* `use_gpu` in `driver_monitor.py` enables CUDA acceleration
* `CALIB_FRAMES` controls the initial calibration period
* `PHONE_ALERT_AFTER_MS` sets the phone detection delay
* `GAZE_ALERT_AFTER_MS` defines how long gaze must be off-road before alerting
* `FRAME_INTERVAL_S` controls how often data is sent to the frontend

## Performance

Performance depends on hardware:

* GPU systems (e.g. RTX 3050) can reach 55–70 FPS
* CPU-only systems typically run at 8–15 FPS
* Embedded devices like Raspberry Pi 5 run around 8–12 FPS
* Jetson Nano with CUDA can reach 25–35 FPS

## Dataset

The eye detection model is trained on a dataset of 2,700 images sourced from Roboflow Universe.

It includes two classes:

* `eye_open`
* `eye_closed`

The data is split into training and validation sets (85% / 15%).

## Design choices

**MediaPipe + YOLO hybrid approach**

MediaPipe provides stable geometric measurements such as EAR, MAR, and head pose.
YOLO complements this by adding visual classification when landmarks become unreliable (for example with glasses, occlusion, or extreme angles).

**Avoiding full-face classification**

Full-face models require significantly larger datasets and tend to generalize poorly across different individuals.
Focusing on the eye region provides better consistency with fewer training samples.

**Dynamic EAR calibration**

Instead of using a fixed threshold, the system performs a short calibration phase at startup.
This adapts to each user's natural eye shape and reduces false positives.


## 📁 System Architecture Summary
1.  **React Frontend:** Receives telemetry at ~10Hz(it can be more depending on hardware). Components dynamically re-render SVG paths, needle gauges, and data cards using pure CSS/React state mechanics with zero database lag.
2.  **FastAPI Backend:** Runs a highly concurrent `asyncio` WebSocket loop. Generates standard Reports (CSV, PDF) natively.
3.  **JSON Contract:** Enforces a rigid data schema (see above) ensuring the computer vision/ML engineers never have to write any React code, and the UI developers never have to touch PyTorch/OpenCV logs.
