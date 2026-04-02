# drowsiness_detector.py
# Stateful drowsiness scoring class.
# Receives one set of signal values per frame and returns
# a drowsiness level, score, and all sub-signal details.
#
# Owns:
#   - calibration (first 3 seconds)
#   - PERCLOS rolling window (30 frames)
#   - consecutive closed-eye counter
#   - yawn event counter (per 60 seconds)
#   - score smoothing (10 frames)
#   - alert level with hysteresis
import numpy as np
from collections import deque


class DrowsinessDetector:

    def __init__(self):

        # calibration
        # We collect EAR samples for the first 3 seconds while
        # the driver sits normally with eyes open.
        # This sets a PERSONAL threshold — because people with
        # naturally smaller eyes have a lower open-eye EAR and
        # the generic threshold of 0.22 would flag them as drowsy
        # even when they are perfectly awake.

        self.calibrating    = True
        self.calib_samples  = []
        self.CALIB_FRAMES   = 60       # 3 seconds at 30fps

        # These get overwritten after calibration
        self.ear_threshold  = 0.15
        self.mar_threshold  = 0.4

        self.ear_history    = deque(maxlen=30)  # 1 second at 30fps

        # consecutive frame counters
        # We require multiple CONSECUTIVE frames before deciding
        # something is happening. This prevents a single bad
        # detection from triggering a false alarm.

        self.consec_closed        = 0
        self.consec_yawn          = 0
        self.CONSEC_EYE_THRESH    = 3    # 3 frames         self.CONSEC_YAWN_THRESH   = 15   # 15 frames

        self.yawn_events       = deque(maxlen=10)
        self.currently_yawning = False   

        self.score_history  = deque(maxlen=10)

        # current alert level
        self.current_level  = "CALIBRATING"
        self.frame_count    = 0

    # Calibration — private method

    def _run_calibration(self, ear: float) -> dict:

        self.calib_samples.append(ear)

        if len(self.calib_samples) >= self.CALIB_FRAMES:

            # Compute personal baseline from collected samples
            baseline = np.mean(self.calib_samples)
            std      = np.std(self.calib_samples)

            # Personal threshold = 75% of their open-eye baseline
            # minus half a standard deviation for stability
            raw_threshold = baseline * 0.75 - std * 0.5

            # Clamp between 0.15 and 0.25 as sanity bounds
            self.ear_threshold = float(np.clip(raw_threshold, 0.12, 0.29))

            self.calibrating   = False
            self.current_level = "OK"

            return {
                "level":          "CALIBRATED",
                "ear_threshold":  round(self.ear_threshold, 3),
                "baseline_ear":   round(float(baseline), 3),
            }

        progress = len(self.calib_samples) / self.CALIB_FRAMES
        return {
            "level":    "CALIBRATING",
            "progress": round(progress, 2),
            "message":  "Keep eyes open and look at camera",
        }
    # main
    def update(
        self,
        ear:          float,
        blink_left:   float,
        blink_right:  float,
        mar:          float,
        jaw_open:     float,
        pitch:        float,
        yaw:          float,
        roll:         float,
        timestamp_ms: int,
        yolo_eye_signal: str = None,
    ) -> dict:
        

        self.frame_count += 1
        if self.calibrating:
            print(f"Calibrating... frame")
            return self._run_calibration(ear)

        #  EAR signal
        avg_blink = (blink_left + blink_right) / 2.0

        eye_closed_this_frame = (
    ear < self.ear_threshold or
    avg_blink > 0.5 or
    yolo_eye_signal == "BOTH_CLOSED"
)
        # Add this frame to the PERCLOS rolling window
        # 1 = eye was closed this frame
        # 0 = eye was open this frame
        self.ear_history.append(1 if eye_closed_this_frame else 0)

        # PERCLOS = fraction of recent frames where eyes were closed
        # If ear_history = [0,0,1,1,0,1,0,0,0,1,...] (30 values)
        # and 9 of them are 1 → perclos = 9/30 = 0.30 = 30%
        perclos = (
            sum(self.ear_history) / len(self.ear_history)
            if self.ear_history else 0.0
        )

        # Update consecutive closed counter
        # This resets to 0 the moment eyes open again
        if eye_closed_this_frame:
            self.consec_closed += 1
        else:
            self.consec_closed  = 0

        # MAR / yawn signal

        # Same dual-signal approach as EAR
        # mar > threshold = mouth geometry says open
        # jaw_open > 0.6  = model prediction says open
        yawning_this_frame = (
            mar      > self.mar_threshold or
            jaw_open > 0.6
        )

        if yawning_this_frame:
            self.consec_yawn += 1
        else:
            # Decay slowly instead of instant reset
            self.consec_yawn = max(0, self.consec_yawn - 1)

        
        yawn_event_fired = (
            self.consec_yawn == self.CONSEC_YAWN_THRESH and
            not self.currently_yawning
        )

        if yawn_event_fired:
            self.currently_yawning = True
            # Store timestamp of this yawn event
            self.yawn_events.append(timestamp_ms)

        elif self.consec_yawn < 5:
            # Yawn ended — reset flag when mouth has been
            # closed for several frames
            self.currently_yawning = False



        sixty_sec_ago     = timestamp_ms - 60_000
        recent_yawn_count = sum(
            1 for t in self.yawn_events
            if t > sixty_sec_ago
        )


        yawn_score = min(recent_yawn_count * 0.35, 1.0)

        # an ongoing yawn raises the score immediately
        # not just after the event is logged
        if self.currently_yawning:
            yawn_score = max(
                yawn_score,
                min(self.consec_yawn / 30.0, 0.7)
            )

        # head pitch 

        PITCH_DEAD_ZONE  = 12.0   # degrees — normal driving variation
        PITCH_FULL_SCORE = 28.0   

        # Remove dead zone and normalize to 0-1
        nod_amount  = max(pitch - PITCH_DEAD_ZONE, 0.0)
        pitch_score = min(nod_amount / PITCH_FULL_SCORE, 1.0)

        nodding = pitch > PITCH_DEAD_ZONE

        # Fused drowsiness score 
        ear_score = min(perclos * 2.0, 1.0)

    #weighted sum
        raw_score = (
            ear_score    * 0.50 +
            yawn_score   * 0.30 +
            pitch_score  * 0.20
        )

        # Smooth over last 10 frames
        self.score_history.append(raw_score)
        smooth_score = sum(self.score_history) / len(self.score_history)

        # Alert level
        if smooth_score > 0.60:
            self.current_level = "ALERT"

        elif smooth_score > 0.35:
            # Only upgrade to WARNING — don't downgrade from ALERT here
            if self.current_level != "ALERT":
                self.current_level = "WARNING"

        elif smooth_score < 0.25:
            # Must drop well below 0.35 to reset to OK
            # The gap between 0.25 and 0.35 is the hysteresis zone
            self.current_level = "OK"

        # If score is between 0.25 and 0.35 and current level is WARNING:
        # do nothing — stay at WARNING until score drops below 0.25

        return {
            # top-level drowsiness
            "drowsy_level":   self.current_level,
            "drowsy_score":   round(smooth_score, 3),

            # ear sub-signals
            "ear":            round(ear, 3),
            "ear_threshold":  round(self.ear_threshold, 3),
            "perclos":        round(perclos, 3),
            "blink_avg":      round(avg_blink, 3),
            "consec_closed":  self.consec_closed,

            # yawn sub-signals
            "mar":            round(mar, 3),
            "jaw_open":       round(jaw_open, 3),
            "yawning":        self.currently_yawning,
            "yawn_score":     round(yawn_score, 3),
            "yawn_count_60s": recent_yawn_count,

            # head pose sub-signals
            "pitch":          round(pitch, 1),
            "yaw":            round(yaw, 1),
            "roll":           round(roll, 1),
            "nodding":        nodding,
            "pitch_score":    round(pitch_score, 3),
        }