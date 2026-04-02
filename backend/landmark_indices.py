import numpy as np   # ← was missing

LEFT_EYE = [
    362,   # p1 — outer corner of left eye
    385,   # p2 — top left
    387,   # p3 — top right
    263,   # p4 — inner corner of left eye
    373,   # p5 — bottom right
    380,   # p6 — bottom left
]

RIGHT_EYE = [
    33,    # p1 — inner corner of right eye
    160,   # p2 — top left
    158,   # p3 — top right
    133,   # p4 — outer corner of right eye
    153,   # p5 — bottom right
    144,   # p6 — bottom left
]

MOUTH = [
    61,    # p1 — left corner
    291,   # p2 — right corner
    39,    # p3 — upper lip left
    269,   # p4 — upper lip right
    0,     # p5 — lower lip center bottom
    17,    # p6 — lower lip right
    405,   # p7 — lower lip left
    181,   # p8 — lower lip left alt
]

LEFT_IRIS  = [474, 475, 476, 477]
RIGHT_IRIS = [469, 470, 471, 472]

LEFT_EYE_CORNERS  = [362, 263]
RIGHT_EYE_CORNERS = [33,  133]

POSE_POINTS = [1, 152, 33, 263, 61, 291]

POSE_3D_MODEL = np.array([          # was a plain list, must be np.array
    (0.0,    0.0,    0.0),
    (0.0,   -63.6,  -12.5),
    (-43.3,  32.7,  -26.0),
    (43.3,   32.7,  -26.0),
    (-28.9, -28.9,  -24.1),
    (28.9,  -28.9,  -24.1),
], dtype=np.float32)                # dtype required by cv2.solvePnP