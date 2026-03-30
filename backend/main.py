"""
AEGIS Vision — FastAPI Backend
Production-grade WebSocket streaming server for the Driver Monitoring System.

Swap monitor implementation by changing ONLY the import below:
  from mock_monitor import MockDriverMonitor as Monitor
  from driver_monitor import DriverMonitor as Monitor
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, WebSocketException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.websockets import WebSocketState

# ──────────────────────────────────────────────
#  MONITOR IMPORT — SWAP LINE
#  Change ONLY this line to switch implementations.
# ──────────────────────────────────────────────
from mock_monitor import MockDriverMonitor as Monitor
# from driver_monitor import DriverMonitor as Monitor

# ──────────────────────────────────────────────
#  Configuration
# ──────────────────────────────────────────────
FRAME_INTERVAL_S: float = 1 / 30          # ~33ms → 30 fps target
WS_SEND_TIMEOUT_S: float = 1.0           # drop frame if client can't keep up
MAX_CONSECUTIVE_ERRORS: int = 50          # failsafe: kill loop after N errors
FRONTEND_BUILD_DIR: str = os.getenv(
    "FRONTEND_BUILD_DIR",
    str(Path(__file__).resolve().parent.parent / "frontend" / "dist"),
)

# ──────────────────────────────────────────────
#  Logging
# ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("aegis.backend")

# ──────────────────────────────────────────────
#  Monitor singleton
# ──────────────────────────────────────────────
monitor: Monitor | None = None


# ──────────────────────────────────────────────
#  Lifecycle
# ──────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    global monitor
    logger.info("Initializing monitor …")
    monitor = Monitor()
    # MockDriverMonitor needs .start(); DriverMonitor may not — guard both
    if hasattr(monitor, "start"):
        monitor.start()
    logger.info("Monitor ready ✓")
    yield
    logger.info("Shutting down monitor …")
    if monitor is not None:
        if hasattr(monitor, "close"):
            monitor.close()
        elif hasattr(monitor, "stop"):
            monitor.stop()
    logger.info("Monitor closed ✓")


# ──────────────────────────────────────────────
#  App
# ──────────────────────────────────────────────
app = FastAPI(
    title="AEGIS Vision — DMS Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",   # vite preview
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
#  Key mapping: CV snake_case → frontend camelCase
#  Only applied when the CV pipeline (DriverMonitor) is
#  used.  MockDriverMonitor already speaks camelCase via
#  its own get_current_state().
# ──────────────────────────────────────────────
_SNAKE_TO_CAMEL: dict[str, str] = {
    "level":             "level",
    "fps":               "fps",
    "timestamp_ms":      "timestampMs",
    "drowsy_level":      "drowsyLevel",
    "drowsy_score":      "drowsyScore",
    "ear":               "ear",
    "perclos":           "perclos",
    "yawning":           "yawning",
    "yawn_count_60s":    "yawnCount",
    "mar":               "mar",
    "pitch":             "pitch",
    "yaw":               "yaw",
    "roll":              "roll",
    "nodding":           "nodding",
    "gaze_direction":    "gazeDir",
    "gaze_alert":        "gazeAlert",
    "gaze_off_duration": "gazeOff",
    "phone_detected":    "phoneDetected",
    "phone_alert":       "phoneAlert",
    "phone_duration":    "phoneDuration",
    "phone_violations":  "phoneViolations",
    "phone_box":         "phoneBox",
    "ear_history":       "earHistory",
}


def _needs_key_remap(data: dict[str, Any]) -> bool:
    """Detect if the dict came from the CV pipeline (snake_case keys)."""
    return "drowsy_score" in data or "gaze_direction" in data


def _remap_keys(data: dict[str, Any]) -> dict[str, Any]:
    """Convert CV pipeline snake_case dict to frontend camelCase dict."""
    return {_SNAKE_TO_CAMEL.get(k, k): v for k, v in data.items()}


def _no_face_payload() -> dict[str, Any]:
    """Fallback payload when webcam / detection fails."""
    return {"level": "NO_FACE"}


# ──────────────────────────────────────────────
#  REST endpoints
# ──────────────────────────────────────────────
@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "monitor": type(monitor).__name__ if monitor else "not_initialized",
        "uptime": "running",
    }

INCIDENTS_DB = [
    {"time": "14:45:12", "type": "DEVICE_OBSCURATION",    "sev": "LVL_02", "action": "AUDIO_PROMPT_L1",   "status": "[RESOLVED]"},
    {"time": "15:12:44", "type": "PROLONGED_PHONE_USE",   "sev": "LVL_04", "action": "FORCE_STATION_HALT", "status": "[IMMEDIATE]"},
    {"time": "16:05:30", "type": "MICROSLEEP_DETECTED",   "sev": "LVL_03", "action": "HAPTIC_PULSE_GEN",  "status": "[CAUTION]"},
    {"time": "17:40:01", "type": "PERSISTENT_YAWNING",    "sev": "LVL_01", "action": "VISUAL_REMINDER",   "status": "[RESOLVED]"},
    {"time": "17:55:22", "type": "GAZE_DEVIATION_EXTEND", "sev": "LVL_02", "action": "AUDIO_PROMPT_L2",   "status": "[RESOLVED]"},
]

@app.get("/api/export/csv")
async def export_csv():
    import csv
    import io
    from fastapi.responses import Response
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["time", "type", "sev", "action", "status"])
    writer.writeheader()
    for row in INCIDENTS_DB:
        writer.writerow(row)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=session_report_8842X.csv"}
    )

@app.get("/api/export/pdf")
async def export_pdf():
    from fpdf import FPDF
    from fastapi.responses import Response
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Courier", size=12)
    pdf.cell(190, 10, txt="AEGIS VISION CLINICAL - SESSION REPORT #8842-X", align="C")
    pdf.ln(15)
    
    pdf.set_font("Courier", style="B", size=10)
    pdf.cell(30, 10, "TIME", border=1, align="L")
    pdf.cell(60, 10, "EVENT TYPE", border=1, align="L")
    pdf.cell(25, 10, "SEVERITY", border=1, align="L")
    pdf.cell(45, 10, "ACTION", border=1, align="L")
    pdf.cell(30, 10, "STATUS", border=1, align="L")
    pdf.ln(10)
    
    pdf.set_font("Courier", size=9)
    for row in INCIDENTS_DB:
        pdf.cell(30, 8, row["time"], border=1, align="L")
        pdf.cell(60, 8, row["type"], border=1, align="L")
        pdf.cell(25, 8, row["sev"], border=1, align="L")
        pdf.cell(45, 8, row["action"], border=1, align="L")
        pdf.cell(30, 8, row["status"], border=1, align="L")
        pdf.ln(8)
        
    return Response(
        content=bytes(pdf.output()),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=session_report_8842X.pdf"}
    )


# ──────────────────────────────────────────────
#  WebSocket streaming endpoint
# ──────────────────────────────────────────────
@app.websocket("/ws")
async def ws_stream(ws: WebSocket) -> None:
    await ws.accept()
    client = ws.client
    logger.info("WS connected: %s", client)

    consecutive_errors: int = 0

    try:
        while True:
            loop_start = time.perf_counter()

            # ── 1. Acquire frame (off the event loop) ──
            try:
                if hasattr(monitor, "process_frame"):
                    data = await asyncio.to_thread(monitor.process_frame)
                elif hasattr(monitor, "get_current_state"):
                    data = await asyncio.to_thread(monitor.get_current_state)
                else:
                    data = _no_face_payload()

                if data is None:
                    data = _no_face_payload()

                # Remap if CV pipeline output
                if _needs_key_remap(data):
                    data = _remap_keys(data)

                consecutive_errors = 0  # reset on success

            except Exception as exc:
                consecutive_errors += 1
                logger.warning("Frame error #%d: %s", consecutive_errors, exc)
                data = _no_face_payload()
                if consecutive_errors >= MAX_CONSECUTIVE_ERRORS:
                    logger.error("Too many consecutive errors — closing WS")
                    break

            # ── 2. Send JSON ──
            try:
                await asyncio.wait_for(
                    ws.send_json({"event": "monitor_update", "data": data}),
                    timeout=WS_SEND_TIMEOUT_S,
                )
            except asyncio.TimeoutError:
                logger.debug("Frame dropped — client too slow")
                continue
            except (WebSocketDisconnect, WebSocketException, RuntimeError):
                break

            # ── 3. Pace to ~30 fps ──
            elapsed = time.perf_counter() - loop_start
            sleep_time = FRAME_INTERVAL_S - elapsed
            if sleep_time > 0:
                await asyncio.sleep(sleep_time)

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.error("Unexpected WS error: %s", exc)
    finally:
        if ws.application_state == WebSocketState.CONNECTED:
            try:
                await ws.close()
            except Exception:
                pass
        logger.info("WS disconnected: %s", client)


# ──────────────────────────────────────────────
#  Static frontend serving (production)
# ──────────────────────────────────────────────
_build = Path(FRONTEND_BUILD_DIR)
if _build.is_dir():
    # Serve static assets (JS, CSS, images)
    _assets = _build / "assets"
    if _assets.is_dir():
        app.mount("/assets", StaticFiles(directory=str(_assets)), name="assets")

    # Serve any other static files at root level
    app.mount("/static", StaticFiles(directory=str(_build)), name="static")

    # SPA fallback — serve index.html for all unmatched routes
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        index = _build / "index.html"
        if index.is_file():
            return FileResponse(str(index))
        return JSONResponse({"error": "index.html not found"}, status_code=404)

    logger.info("Serving production build from %s", _build)
else:
    logger.info("No frontend build found at %s — API-only mode", _build)


# ──────────────────────────────────────────────
#  Entrypoint
# ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,           # disable in prod: reload=False
        log_level="info",
        ws_ping_interval=20,   # keep WS alive behind proxies
        ws_ping_timeout=20,
    )
