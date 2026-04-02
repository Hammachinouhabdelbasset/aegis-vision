# driver_monitor.py
import threading

import cv2
import numpy as np
import time
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import torch
from ultralytics import YOLO
from collections import deque
from signals import (
    avg_ear, get_blink_blendshape,
    compute_mar, get_jaw_blendshape,
    compute_head_angles, get_gaze_direction,
)
from drowsiness_detector import DrowsinessDetector

# Maps internal drowsy level → frontend schema
# This mapping is applied ONLY in the return dict
# NOT before calling _unified_danger_level
DROWSY_LEVEL_MAP = {
    "OK":          "LOW",
    "WARNING":     "MODERATE",
    "ALERT":       "HIGH",
    "CRITICAL":    "CRITICAL",
    "CALIBRATING": "LOW",
    "CALIBRATED":  "LOW",
}


class DriverMonitor:

    PHONE_CLASS_ID = 67 

    def __init__(
        self,
        face_model_path: str  = "models/face_landmarker.task",
        yolo_eye_path:   str  = "models/best.pt",
        yolo_phone_path: str  = "models/yolov8n.pt",
        use_gpu:         bool = True if torch.cuda.is_available() else False,
    ):
        self.device = "cuda" if use_gpu else "cpu"

        # mediapipe
        self.landmarker = mp_vision.FaceLandmarker.create_from_options(
            mp_vision.FaceLandmarkerOptions(
                base_options=mp_python.BaseOptions(
                    model_asset_path=face_model_path
                ),
                running_mode=mp_vision.RunningMode.VIDEO,
                num_faces=1,
                min_face_detection_confidence=0.6,
                min_face_presence_confidence=0.6,
                min_tracking_confidence=0.5,
                output_face_blendshapes=True,
                output_facial_transformation_matrixes=True,
            )
        )

        # yolo models
        self.yolo_eye   = YOLO(yolo_eye_path)
        self.yolo_eye.to(self.device)
        self.yolo_phone = YOLO(yolo_phone_path)
        self.yolo_phone.to(self.device)

        # frame skip
        self.frame_idx        = 0
        self.YOLO_EYE_EVERY   = 3
        self.YOLO_PHONE_EVERY = 5

        # yolo cache
        self.last_yolo_eye_signal = "OPEN"
        self.eye_boxes            = None
        self.last_phone_detected  = False
        self.last_phone_box       = None

        # phone tracking
        self.phone_first_seen_ts   = None
        self.PHONE_ALERT_AFTER_MS  = 2000
        self.phone_violations      = 0
        self.last_phone_alert_state = False

        # gaze tracking
        self.gaze_off_road_since  = None
        self.GAZE_ALERT_AFTER_MS  = 2500

        # ear value history for frontend timeline chart
        # Stores actual EAR float values, not 0/1 PERCLOS flags
        self.ear_value_history    = deque(maxlen=30)

        # fps
        self.fps_history      = deque(maxlen=30)
        self.last_frame_time  = time.time()
        self.session_start    = time.time()
        self.last_frame = None
        # drowsinessdetector
        self.drowsiness = DrowsinessDetector()
        self._lock = threading.Lock()
        self.cap = cv2.VideoCapture(0)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH,  640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE,   1)
        if not self.cap.isOpened():
            raise RuntimeError(
                "Could not open webcam. "
                "Check that no other program is using the camera."
            )
        print("Camera opened successfully")
        print(f"Using device: {self.device}")
        
    # YOLO eye

    def _run_yolo_eye(self, frame):
        results = self.yolo_eye(
            frame, conf=0.45, iou=0.45,
            verbose=False, device=self.device
        )
        boxes = results[0].boxes

        if len(boxes) == 0:
            return "NO_EYES", boxes

        closed = sum(1 for b in boxes if int(b.cls[0]) == 1)
        total  = len(boxes)

        if total >= 2 and closed >= 2:
            return "BOTH_CLOSED", boxes
        elif closed >= 1:
            return "ONE_CLOSED", boxes
        return "OPEN", boxes

    # YOLO phone

    def _run_yolo_phone(self, frame, timestamp_ms):
        h       = frame.shape[0]
        results = self.yolo_phone(
            frame,
            conf=0.45,
            classes=[self.PHONE_CLASS_ID],
            verbose=False,
            device=self.device,
        )
        boxes       = results[0].boxes
        phone_found = False
        best_box    = None

        for b in boxes:
            x1, y1, x2, y2 = map(int, b.xyxy[0].tolist())
            if (y1 + y2) / 2 > h * 0.40:
                phone_found = True
                best_box    = (x1, y1, x2, y2, float(b.conf[0]))
                break

        self.last_phone_box      = best_box
        self.last_phone_detected = phone_found

        if phone_found:
            if self.phone_first_seen_ts is None:
                self.phone_first_seen_ts = timestamp_ms
        else:
            self.phone_first_seen_ts = None

    # process_frame


    def process_frame(self, frame=None) -> dict:
        with self._lock:
            # FPS
            now                  = time.time()
            delta                = now - self.last_frame_time
            self.last_frame_time = now
            fps                  = 1.0 / delta if delta > 0 else 0.0
            self.fps_history.append(fps)
            avg_fps              = sum(self.fps_history) / len(self.fps_history)
            timestamp_ms         = int((now - self.session_start) * 1000)
            print(f"FPS: {fps:.1f}")
            print(f"Average FPS: {avg_fps:.1f}")
            if frame is None:
                ret, frame = self.cap.read()
                if not ret or frame is None:
                    self.frame_idx += 1
                    return {
                        "level":             "NO_FACE",
                        "fps":               round(avg_fps, 1),
                        "frame_idx":         self.frame_idx,
                        "timestamp_ms":      timestamp_ms,
                        "drowsy_level":      "LOW",
                        "drowsy_score":      0.0,
                        "ear":               0.0,
                        "ear_history":       list(self.ear_value_history),
                        "perclos":           0.0,
                        "yawning":           False,
                        "yawn_count_60s":    0,
                        "mar":               0.0,
                        "pitch":             0.0,
                        "yaw":               0.0,
                        "roll":              0.0,
                        "nodding":           False,
                        "gaze_direction":    "FORWARD",
                        "gaze_alert":        False,
                        "gaze_off_duration": 0.0,
                        "phone_detected":    False,
                        "phone_alert":       False,
                        "phone_duration":    0.0,
                        "phone_violations":  self.phone_violations,
                    }

            # MP
            rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result   = self.landmarker.detect_for_video(mp_image, timestamp_ms)

            if not result.face_landmarks:
                self.frame_idx += 1
                return {
                    "level":            "NO_FACE",
                    "fps":              round(avg_fps, 1),
                    "frame_idx":        self.frame_idx,
                    "timestamp_ms":     timestamp_ms,
                    "drowsy_level":     "LOW",
                    "drowsy_score":     0.0,
                    "ear":              0.0,
                    "ear_history":      list(self.ear_value_history),
                    "perclos":          0.0,
                    "yawning":          False,
                    "yawn_count_60s":   0,
                    "mar":              0.0,
                    "pitch":            0.0,
                    "yaw":              0.0,
                    "roll":             0.0,
                    "nodding":          False,
                    "gaze_direction":   "FORWARD",
                    "gaze_alert":       False,
                    "gaze_off_duration": 0.0,
                    "phone_detected":   False,
                    "phone_alert":      False,
                    "phone_duration":   0.0,
                    "phone_violations": self.phone_violations,
                }

            
            landmarks   = result.face_landmarks[0]
            blendshapes = result.face_blendshapes[0]
            lm = np.array([[p.x, p.y] for p in landmarks], dtype=np.float32)
            matrix = np.array(
                result.facial_transformation_matrixes[0].data
            ).reshape(4, 4)

            ear                     = avg_ear(lm)
            blink_left, blink_right = get_blink_blendshape(blendshapes)
            mar                     = compute_mar(lm)
            jaw_open                = get_jaw_blendshape(blendshapes)
            pitch, yaw, roll        = compute_head_angles(matrix)
            gaze_data               = get_gaze_direction(lm)

            self.ear_value_history.append(round(ear, 3))

            if self.drowsiness.calibrating:
                calib_result = self.drowsiness._run_calibration(ear)
                self.frame_idx += 1
                return {
                    **calib_result,
                    "fps":       round(avg_fps, 1),
                    "frame_idx": self.frame_idx,
                }

            if self.frame_idx % self.YOLO_EYE_EVERY == 0:
                self.last_yolo_eye_signal, self.eye_boxes = \
                    self._run_yolo_eye(frame)

            if self.frame_idx % self.YOLO_PHONE_EVERY == 0:
                self._run_yolo_phone(frame, timestamp_ms)

            drowsy_data = self.drowsiness.update(
                ear=ear,
                blink_left=blink_left,
                blink_right=blink_right,
                mar=mar,
                jaw_open=jaw_open,
                pitch=pitch,
                yaw=yaw,
                roll=roll,
                timestamp_ms=timestamp_ms,
                yolo_eye_signal=self.last_yolo_eye_signal,
            )

            internal_drowsy_level = drowsy_data["drowsy_level"]

            if gaze_data["direction"] != "FORWARD":
                if self.gaze_off_road_since is None:
                    self.gaze_off_road_since = timestamp_ms
            else:
                self.gaze_off_road_since = None

            gaze_alert = (
                self.gaze_off_road_since is not None and
                (timestamp_ms - self.gaze_off_road_since) > self.GAZE_ALERT_AFTER_MS
            )
            gaze_off_duration = (
                (timestamp_ms - self.gaze_off_road_since) / 1000.0
                if self.gaze_off_road_since else 0.0
            )

            phone_alert = (
                self.last_phone_detected and
                self.phone_first_seen_ts is not None and
                (timestamp_ms - self.phone_first_seen_ts) > self.PHONE_ALERT_AFTER_MS
            )
            phone_duration = (
                (timestamp_ms - self.phone_first_seen_ts) / 1000.0
                if self.phone_first_seen_ts else 0.0
            )

            if phone_alert and not self.last_phone_alert_state:
                self.phone_violations += 1
            self.last_phone_alert_state = phone_alert

            danger_count = sum([
                internal_drowsy_level == "ALERT",
                phone_alert,
                gaze_alert,
            ])

            if danger_count >= 2:
                unified_level = "CRITICAL"
            elif internal_drowsy_level == "ALERT":
                unified_level = "ALERT"
            elif phone_alert or gaze_alert or internal_drowsy_level == "WARNING":
                unified_level = "WARNING"
            else:
                unified_level = "OK"

            self.frame_idx += 1

            return {
                "level":          unified_level,
                "fps":            round(avg_fps, 1),
                "frame_idx":      self.frame_idx,
                "timestamp_ms":   timestamp_ms,
                "drowsy_level":   DROWSY_LEVEL_MAP.get(internal_drowsy_level, "LOW"),
                "drowsy_score":   round(drowsy_data["drowsy_score"] * 100, 1),
                "ear":            round(ear, 3),
                "ear_history":    list(self.ear_value_history),
                "perclos":        drowsy_data["perclos"],
                "blink_avg":      drowsy_data["blink_avg"],
                "ear_threshold":  drowsy_data["ear_threshold"],
                "consec_closed":  drowsy_data["consec_closed"],
                "yawning":        drowsy_data["yawning"],
                "yawn_count_60s": drowsy_data["yawn_count_60s"],
                "yawn_score":     drowsy_data["yawn_score"],
                "mar":            round(mar, 3),
                "jaw_open":       round(jaw_open, 3),
                "pitch":          round(pitch, 1),
                "yaw":            round(yaw, 1),
                "roll":           round(roll, 1),
                "nodding":        pitch > 10.0,
                "gaze_direction":    gaze_data["direction"],
                "gaze_h":            gaze_data["gaze_h"],
                "gaze_v":            gaze_data["gaze_v"],
                "gaze_alert":        gaze_alert,
                "gaze_off_duration": round(gaze_off_duration, 1),
                "phone_detected":   self.last_phone_detected,
                "phone_alert":      phone_alert,
                "phone_duration":   round(phone_duration, 1),
                "phone_violations": self.phone_violations,
                "phone_box":        self.last_phone_box,
                "yolo_eye_signal":  self.last_yolo_eye_signal,
                "yolo_eye_boxes":   self.eye_boxes,
            }
    def close(self):
        self.landmarker.close()
        if hasattr(self, "cap") and self.cap.isOpened():
            self.cap.release()
        print("DriverMonitor closed")