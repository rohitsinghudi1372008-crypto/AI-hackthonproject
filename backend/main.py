"""
AI Incident Root Cause Analyzer - FastAPI Backend
Production-ready FastAPI server with SSE streaming for real-time agent thinking display.
"""

import json
import os
import asyncio
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from analyzer import get_all_incidents, analyze_incident, stream_analysis_steps

app = FastAPI(
    title="AI Incident Root Cause Analyzer",
    description="SRE-grade AI-powered incident analysis engine with mock Gemini reasoning",
    version="2.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS — Relaxed for hackathon deployment to prevent demo failures
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    incident_key: str


class HotfixRequest(BaseModel):
    incident_key: str


# --- Health Check ---
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-incident-analyzer",
        "version": "2.1.0"
    }


# --- Get All Incidents ---
@app.get("/api/incidents")
async def get_incidents():
    """Returns list of active incidents for the triage board."""
    incidents = get_all_incidents()
    return {
        "incidents": incidents,
        "total": len(incidents),
        "critical_count": sum(1 for i in incidents if i["severity"] == "P1"),
        "last_updated": "2026-05-23T07:15:00Z"
    }


# --- Full Analysis (non-streaming) ---
@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """
    Runs full AI analysis on an incident and returns complete root cause diagnostic.
    """
    result = analyze_incident(request.incident_key)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


# --- Streaming Analysis (Server-Sent Events) ---
async def sse_generator(incident_key: str) -> AsyncGenerator[str, None]:
    """Yields SSE-formatted events simulating real-time agent reasoning."""
    steps = list(stream_analysis_steps(incident_key))

    for event in steps:
        event_type = event.get("type", "message")
        data = json.dumps(event["data"])
        yield f"event: {event_type}\ndata: {data}\n\n"
        # Simulate agent "thinking" delay between steps
        if event_type == "step":
            step_data = event["data"]
            delay = step_data.get("duration_ms", 400) / 1000.0
            # Cap delay to 0.8s max for good UX
            await asyncio.sleep(min(delay, 0.8))
        else:
            await asyncio.sleep(0.2)

    yield "event: done\ndata: {}\n\n"


@app.get("/api/analyze/stream/{incident_key}")
async def analyze_stream(incident_key: str):
    """
    SSE streaming endpoint — yields agent reasoning steps in real-time.
    """
    return StreamingResponse(
        sse_generator(incident_key),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        }
    )


# --- Get Incident Details ---
@app.get("/api/incidents/{incident_key}")
async def get_incident(incident_key: str):
    """Returns details for a specific incident."""
    from analyzer import INCIDENT_KNOWLEDGE_BASE, get_all_incidents
    incidents = get_all_incidents()
    incident = next((i for i in incidents if i["incident_key"] == incident_key), None)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident '{incident_key}' not found")
    return incident


# --- Generate Hotfix ---
@app.post("/api/hotfix")
async def generate_hotfix(request: HotfixRequest):
    """Returns the deployment hotfix for a given incident."""
    result = analyze_incident(request.incident_key)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    hotfix = result["root_cause"]["hotfix"]
    return {
        "incident_key": request.incident_key,
        "hotfix": hotfix,
        "generated_at": result["analyzed_at"],
        "deploy_immediately": True,
        "estimated_recovery_minutes": hotfix["estimated_recovery_minutes"]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True, log_level="info")
