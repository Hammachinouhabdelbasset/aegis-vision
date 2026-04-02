# signals.py
import numpy as np
import scipy.spatial.distance as dist
from landmark_indices import (
    LEFT_EYE, RIGHT_EYE, MOUTH,
    LEFT_IRIS, RIGHT_IRIS,
    LEFT_EYE_CORNERS, RIGHT_EYE_CORNERS,
)
# ear

def compute_ear(lm, eye_indices):
    pts = lm[eye_indices]          # shape (6, 2)
    A   = dist.euclidean(pts[1], pts[5])
    B   = dist.euclidean(pts[2], pts[4])
    C   = dist.euclidean(pts[0], pts[3])
    if C == 0:
        return 0.0
    return (A + B) / (2.0 * C)


def avg_ear(lm):
    left  = compute_ear(lm, LEFT_EYE)
    right = compute_ear(lm, RIGHT_EYE)
    return (left + right) / 2.0


# blendshapes — still use mediapipe objects, not lm array

def get_blink_blendshape(blendshapes):
    blink_left  = 0.0
    blink_right = 0.0
    for b in blendshapes:
        if b.category_name == "eyeBlinkLeft":
            blink_left  = b.score
        elif b.category_name == "eyeBlinkRight":
            blink_right = b.score
    return blink_left, blink_right


# mar

def compute_mar(lm):
    pts = lm[MOUTH]                # shape (8, 2)
    A   = dist.euclidean(pts[2], pts[6])
    B   = dist.euclidean(pts[3], pts[5])
    C   = dist.euclidean(pts[0], pts[1])
    if C == 0:
        return 0.0
    return (A + B) / (2.0 * C)


def get_jaw_blendshape(blendshapes):
    for b in blendshapes:
        if b.category_name == "jawOpen":
            return b.score
    return 0.0


# head angles

def compute_head_angles(transformation_matrix):
    R  = transformation_matrix[:3, :3]
    sy = np.sqrt(R[0, 0]**2 + R[1, 0]**2)
    if sy >= 1e-6:
        roll  = np.degrees(np.arctan2(R[2, 1],  R[2, 2]))
        pitch = np.degrees(np.arctan2(-R[2, 0], sy))
        yaw   = np.degrees(np.arctan2(R[1, 0],  R[0, 0]))
    else:
        roll  = np.degrees(np.arctan2(-R[1, 2], R[1, 1]))
        pitch = np.degrees(np.arctan2(-R[2, 0], sy))
        yaw   = 0.0
    return pitch, yaw, roll


#gaze

def compute_gaze_ratio(lm, iris_indices, corner_indices):
    iris_pts    = lm[iris_indices]          # shape (4, 2)
    iris_center = iris_pts.mean(axis=0)     # shape (2,)
    left_corner = lm[corner_indices[0]]     # shape (2,)
    right_corner= lm[corner_indices[1]]     # shape (2,)
    eye_width   = np.linalg.norm(right_corner - left_corner)
    if eye_width < 1e-6:
        return 0.5
    return float(np.linalg.norm(iris_center - left_corner) / eye_width)


def get_gaze_direction(lm):
    left_h  = compute_gaze_ratio(lm, LEFT_IRIS,  LEFT_EYE_CORNERS)
    right_h = compute_gaze_ratio(lm, RIGHT_IRIS, RIGHT_EYE_CORNERS)
    avg_h   = (left_h + right_h) / 2.0

    def vertical_ratio(iris_idx, top_idx, bottom_idx):
        # lm[i] = [x, y] → index [1] is y coordinate
        iris_y = float(np.mean(lm[iris_idx, 1]))  # was landmarks[i].y — FIXED
        top_y  = float(lm[top_idx,    1])          # was landmarks[top_idx].y
        bot_y  = float(lm[bottom_idx, 1])          # was landmarks[bottom_idx].y
        h      = bot_y - top_y
        if abs(h) < 1e-6:
            return 0.5
        return float((iris_y - top_y) / h)

    left_v  = vertical_ratio(LEFT_IRIS,  386, 374)
    right_v = vertical_ratio(RIGHT_IRIS, 159, 145)
    avg_v   = (left_v + right_v) / 2.0

    if avg_h < 0.38:
        direction = "LEFT"
    elif avg_h > 0.62:
        direction = "RIGHT"
    elif avg_v > 0.65:
        direction = "DOWN"
    elif avg_v < 0.35:
        direction = "UP"
    else:
        direction = "FORWARD"

    return {
        "gaze_h":     round(avg_h, 3),
        "gaze_v":     round(avg_v, 3),
        "direction":  direction,
        "distracted": direction != "FORWARD",
    }