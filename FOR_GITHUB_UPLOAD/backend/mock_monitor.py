"""
AEGIS Vision — Mock Driver Monitor
Simulates realistic DMS telemetry matching the CV pipeline's exact output contract.
Used for frontend development and testing without a webcam.
"""

from __future__ import annotations

import math
import random
import time


class MockDriverMonitor:
    """
    Drop-in mock for the real DriverMonitor.
    Produces the exact same dict shape as the CV pipeline:

    {
        "level", "fps", "timestamp_ms",
        "drowsy_level", "drowsy_score", "ear", "perclos",
        "yawning", "yawn_count_60s", "mar",
        "pitch", "nodding",
        "gaze_direction", "gaze_alert", "gaze_off_duration",
        "phone_detected", "phone_alert", "phone_duration", "phone_box",
    }
    """

    def __init__(self, **kwargs) -> None:
        self._t: float = 0.0
        self._start: float = time.time()
        self._frame_count: int = 0
        self._last_fps_time: float = self._start
        self._fps: float = 0.0
        self._gaze_off_acc: float = 0.0
        self._phone_acc: float = 0.0
        self._yawn_count: int = 0
        self._last_yawn: bool = False

    # ── public API matching DriverMonitor ──

    def start(self) -> None:
        self._start = time.time()

    def process_frame(self, frame=None) -> dict:
        """Generate one frame of simulated telemetry."""
        now = time.time()
        dt = 1 / 30
        self._t += dt

        # FPS tracking
        self._frame_count += 1
        fps_elapsed = now - self._last_fps_time
        if fps_elapsed >= 1.0:
            self._fps = self._frame_count / fps_elapsed
            self._frame_count = 0
            self._last_fps_time = now

        t = self._t

        # ── 60 Second Story Cycle ──
        # 0-35s: Normal driving (Stable)
        # 35-45s: Drowsiness onset (Yawning, EAR drops -> WARNING)
        # 45-55s: Distraction/Phone (Critical event -> ALERT/CRITICAL)
        # 55-60s: Recovery to normal
        
        cycle = t % 60
        is_drowsy = 35 <= cycle < 45
        is_distracted = 45 <= cycle < 55

        # ── Eye metrics ──
        if is_drowsy:
            ear = 0.20 + math.sin(t * 2) * 0.05 + random.gauss(0, 0.005)
            drowsy_score = min(100.0, ((cycle - 35) / 10) * 60 + random.randint(0, 5))
        else:
            ear = 0.30 + random.gauss(0, 0.005)
            drowsy_score = max(0.0, drowsy_score - 1.0) if hasattr(self, '_last_phone_alert') else 0.0
            
        perclos = round((drowsy_score / 100) * 0.12, 3)
        ear = max(0.05, round(ear, 3))

        # ── Yawning ──
        yawning = is_drowsy and (38 <= cycle <= 41)
        if yawning and not self._last_yawn:
            self._yawn_count += 1
        self._last_yawn = yawning
        mar = round(0.6 + math.sin(t * 5) * 0.05, 3) if yawning else round(0.12 + random.gauss(0, 0.01), 3)

        # ── Head pose ──
        pitch = round(2 * math.sin(t / 3), 1)
        yaw = round(15 * math.sin(t * 2), 1) if is_distracted else round(2 * math.sin(t / 4), 1)
        roll = round(1 * math.cos(t / 5), 1)
        nodding = is_drowsy and math.sin(t * 1.5) > 0.8

        # ── Gaze ──
        gaze_direction = "LEFT" if is_distracted else ("DOWN" if nodding else "FORWARD")
        if gaze_direction != "FORWARD":
            self._gaze_off_acc = min(5.0, self._gaze_off_acc + dt)
        else:
            self._gaze_off_acc = max(0.0, self._gaze_off_acc - dt * 2)
            
        gaze_alert = self._gaze_off_acc > 2.5
        gaze_off_duration = round(self._gaze_off_acc, 2)

        # ── Phone detection ──
        phone_detected = is_distracted and (48 <= cycle <= 52)
        phone_alert = phone_detected and (self._phone_acc > 2.0)
        
        # Phone violations counter
        if not hasattr(self, "_last_phone_alert"):
            self._last_phone_alert = False
            self._phone_violations = 0
            
        if phone_alert and not self._last_phone_alert:
            self._phone_violations += 1
        self._last_phone_alert = phone_alert

        if phone_detected:
            self._phone_acc = min(5.0, self._phone_acc + dt)
        else:
            self._phone_acc = max(0.0, self._phone_acc - dt)
        phone_duration = round(self._phone_acc, 1)
        phone_box = (120, 200, 280, 400) if phone_detected else None

        # ── History ──
        if not hasattr(self, "_ear_history"):
            self._ear_history = [0.3] * 12
        # Only update array every 0.5s to create a staggered chart look
        if not hasattr(self, "_last_hist_update") or (time.time() - self._last_hist_update > 0.5):
            self._ear_history = self._ear_history[1:] + [round(ear, 3)]
            self._last_hist_update = time.time()

        # ── Drowsy level classification ──
        if drowsy_score > 70 or phone_alert:
            drowsy_level = "CRITICAL"
            level = "CRITICAL"
        elif drowsy_score > 45 or gaze_alert:
            drowsy_level = "HIGH"
            level = "ALERT"
        elif drowsy_score > 25 or nodding or yawning:
            drowsy_level = "MODERATE"
            level = "WARNING"
        else:
            drowsy_level = "LOW"
            level = "OK"

        return {
            "level":             level,
            "fps":               round(self._fps, 1),
            "timestamp_ms":      int(now * 1000),

            "drowsy_level":      drowsy_level,
            "drowsy_score":      drowsy_score,
            "ear":               round(ear, 4),
            "ear_history":       self._ear_history,
            "perclos":           perclos,
            "yawning":           yawning,
            "yawn_count_60s":    self._yawn_count,
            "mar":               mar,

            "pitch":             pitch,
            "yaw":               yaw,
            "roll":              roll,
            "nodding":           nodding,

            "gaze_direction":    gaze_direction,
            "gaze_alert":        gaze_alert,
            "gaze_off_duration": gaze_off_duration,

            "phone_detected":    phone_detected,
            "phone_alert":       phone_alert,
            "phone_duration":    phone_duration,
            "phone_violations":  self._phone_violations,
            "phone_box":         phone_box,
        }

    def close(self) -> None:
        """Cleanup (no-op for mock)."""
        pass

    # Legacy compatibility
    def stop(self) -> None:
        self.close()

    def get_current_state(self) -> dict:
        return self.process_frame()
