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

## 🧠 Machine Learning (Computer Vision) Integration Guide

This section is specifically for the ML/Python Developer to connect real face-tracking models (like YOLO, Mediapipe, dlib) to the UI.

The system is designed with a **Drop-In Architecture**. The FastAPI backend runs on a loop (~30 FPS) and asks an internal `Monitor` class for the current state. Currently, the backend is relying on the `MockDriverMonitor` to simulate data.

### Step 1: Create your ML Monitor
Create a new file in the backend folder named `driver_monitor.py`. Inside, create a class named `DriverMonitor`. The wrapper class simply needs one method: `process_frame()`, which returns a strictly-formatted dictionary of what your model detects.

```python
# backend/driver_monitor.py

class DriverMonitor:
    def __init__(self):
        # Initialize your ML models here (e.g. YOLO, Mediapipe)
        self.fps = 0.0
        print("ML Models loaded!")

    def process_frame(self, frame=None) -> dict:
        # 1. Grab camera frame
        # 2. Run inference
        # 3. Calculate EAR, MAR, Head Pose, etc.
        
        return {
            "level": "OK",                   # "OK", "WARNING", "ALERT", "CRITICAL"
            "fps": 30.0,
            "timestamp_ms": 1714567890123,
            
            # --- DROWSINESS ---
            "drowsy_level": "LOW",           # "LOW", "MODERATE", "HIGH", "CRITICAL"
            "drowsy_score": 12.4,            # 0.0 to 100.0 scale
            "ear": 0.31,                     # Eye Aspect Ratio
            "ear_history": [0.3, 0.3, 0.31], # Recent history for timeline charts
            "perclos": 0.05,                 # Percentage of eye closure
            
            # --- YAWNING ---
            "yawning": False,                # Boolean
            "yawn_count_60s": 0,             # Times yawned in last 60 seconds
            "mar": 0.12,                     # Mouth Aspect Ratio
            
            # --- HEAD POSE ---
            "pitch": 4.2,                    # Head pitch in degrees
            "yaw": -12.1,                    # Head yaw in degrees
            "roll": 1.5,                     # Head roll in degrees
            "nodding": False,                # Is head dropping?
            
            # --- GAZE ATTENTION ---
            "gaze_direction": "FORWARD",     # "FORWARD", "LEFT", "RIGHT", "DOWN"
            "gaze_alert": False,             # Has gaze been off-road too long?
            "gaze_off_duration": 0.0,        # Seconds looking away
            
            # --- PHONE DISTRACTION ---
            "phone_detected": False,
            "phone_alert": False,            # Has phone been detected for > 2 seconds?
            "phone_duration": 0.0,           # Seconds phone has been up
            "phone_violations": 0            # Running total of phone usages
        }
```

*(Note: Use `snake_case` exactly as written above. The backend will automatically translate it to `camelCase` before sending it across the WebSocket to React).*

### Step 2: Swap the implementation in `main.py`
Open `backend/main.py`. Near the very top of the file, locate the Monitor import line (around line 30) and switch it from the Mock to your real ML class:

```python
# --- CHANGE THIS ---
# from mock_monitor import MockDriverMonitor as Monitor

# --- TO THIS ---
from driver_monitor import DriverMonitor as Monitor
```

That's it! Restart the FastAPI backend (`python main.py`). 
The backend will immediately begin continuously calling **your** `process_frame()` method, securely converting the output to JSON, and firing it via WebSockets into the frontend dashboard for live rendering.

---

## 📁 System Architecture Summary
1.  **React Frontend:** Receives telemetry at ~30Hz. Components dynamically re-render SVG paths, needle gauges, and data cards using pure CSS/React state mechanics with zero database lag.
2.  **FastAPI Backend:** Runs a highly concurrent `asyncio` WebSocket loop. Generates standard Reports (CSV, PDF) natively.
3.  **JSON Contract:** Enforces a rigid data schema (see above) ensuring the computer vision/ML engineers never have to write any React code, and the UI developers never have to touch PyTorch/OpenCV logs.
