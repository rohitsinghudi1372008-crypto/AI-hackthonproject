"""
AI Incident Root Cause Analyzer - Mock AI Engine
Simulates AI responses using rule-based heuristics and pre-configured SRE reasoning data.
"""

import json
import os
import time
from datetime import datetime
from typing import Generator

MOCK_DATA_DIR = os.path.join(os.path.dirname(__file__), "mock_data")

# --- Incident Knowledge Base ---
INCIDENT_KNOWLEDGE_BASE = {
    "payment-gateway-502": {
        "id": "INC-2026-001",
        "title": "PaymentGateway 502 Bad Gateway - P1",
        "service": "payment-gateway",
        "severity": "P1",
        "error_rate": 84.8,
        "log_file": "502_gateway_logs.json",
        "git_file": "git_commit_log.json",
        "analysis_steps": [
            {
                "step": 1,
                "agent": "DatadogIngestionAgent",
                "action": "Ingesting Datadog alert stream",
                "detail": "Found P1 alert: PaymentGateway SLO breach — error rate 84.8% (threshold: 1%). 71,480 failed requests in 30-minute window.",
                "duration_ms": 320,
                "status": "complete"
            },
            {
                "step": 2,
                "agent": "LogParserAgent",
                "action": "Parsing application server logs",
                "detail": "Identified critical pattern: 'Database connection pool exhausted. Pool size: 5, waiting queue: 847'. Connection acquisition timeout set to 30,000ms — causing cascading 502 responses.",
                "duration_ms": 580,
                "status": "complete"
            },
            {
                "step": 3,
                "agent": "GitBlameAgent",
                "action": "Scanning recent Git commits (last 24h)",
                "detail": "Found suspicious commit a31f2c8 deployed at 06:30 UTC (15 min before incident onset). Commit message: 'perf: reduce connection pool overhead for cost optimization'",
                "duration_ms": 410,
                "status": "complete"
            },
            {
                "step": 4,
                "agent": "DiffAnalyzerAgent",
                "action": "Analyzing commit diff for configuration changes",
                "detail": "CRITICAL CHANGE DETECTED in database.properties: db.pool.maxSize changed from 50 → 5 (90% reduction). db.pool.connectionTimeout changed from 5000ms → 30000ms. Commit had NO peer review and was pushed directly to main.",
                "duration_ms": 290,
                "status": "complete"
            },
            {
                "step": 5,
                "agent": "CorrelationEngine",
                "action": "Correlating timeline: deployment vs incident onset",
                "detail": "Timeline correlation: Commit a31f2c8 deployed 06:30 UTC → Error rate spike at 06:45 UTC (15-min propagation lag for traffic ramp). Confidence: 94%. No other config changes in blast radius.",
                "duration_ms": 150,
                "status": "complete"
            },
            {
                "step": 6,
                "agent": "RemediationAgent",
                "action": "Generating remediation playbook",
                "detail": "Hotfix identified: revert db.pool.maxSize to 50, db.pool.connectionTimeout to 5000ms. Estimated recovery: 2-3 minutes after deployment.",
                "duration_ms": 200,
                "status": "complete"
            }
        ],
        "root_cause": {
            "culprit": "Commit #a31f2c8 reduced db.pool.maxSize from 50 to 5 in database.properties",
            "culprit_detail": "A cost-optimization commit deployed at 06:30 UTC reduced the database connection pool size by 90% (50 → 5 connections). Under production traffic of ~850 concurrent requests, the pool exhausted within seconds. With connectionTimeout increased to 30s, each failed request held a thread for 30 seconds causing a cascading thread-pool exhaustion, resulting in 84.8% error rate.",
            "commit_sha": "a31f2c8",
            "author": "dev-autobot@company.com",
            "deployed_at": "2026-05-23T06:30:00Z",
            "file_changed": "src/config/database.properties",
            "confidence": 94,
            "impact": "84.8% error rate, ~$852K/min revenue impact, 3 dependent services degraded",
            "hotfix": {
                "description": "Revert connection pool configuration to pre-incident values",
                "file": "src/config/database.properties",
                "code_before": "db.pool.maxSize=5\ndb.pool.minIdle=1\ndb.pool.connectionTimeout=30000",
                "code_after": "db.pool.maxSize=50\ndb.pool.minIdle=10\ndb.pool.connectionTimeout=5000",
                "deploy_command": "kubectl rollout undo deployment/payment-gateway -n production",
                "estimated_recovery_minutes": 2
            }
        }
    },
    "inference-cpu-spike": {
        "id": "INC-2026-002",
        "title": "InferenceService CPU Spike - P2",
        "service": "inference-service",
        "severity": "P2",
        "cpu_peak": 98.7,
        "log_file": "cpu_spike_metrics.json",
        "git_file": "git_commit_log.json",
        "analysis_steps": [
            {
                "step": 1,
                "agent": "DatadogIngestionAgent",
                "action": "Ingesting CPU utilization metrics",
                "detail": "Found P2 alert: InferenceService sustained 98.7% CPU for 78 minutes. 8 pods at capacity, HPA not triggering scale-out.",
                "duration_ms": 280,
                "status": "complete"
            },
            {
                "step": 2,
                "agent": "MetricsAnalyzerAgent",
                "action": "Analyzing CPU timeline and correlating events",
                "detail": "CPU spike began at 05:40 UTC. Inflection point at 05:30 UTC correlates with traffic increase from 120 → 850 rps. HPA config shows maxReplicas=8 (same as minReplicas) — scaling completely disabled.",
                "duration_ms": 490,
                "status": "complete"
            },
            {
                "step": 3,
                "agent": "GitBlameAgent",
                "action": "Scanning recent Git commits (last 24h)",
                "detail": "Found two suspicious commits: b72e9f1 (05:28 UTC) — removed MAX_BATCH_SIZE cap. c89d4f2 (04:15 UTC) — set HPA maxReplicas=minReplicas=8.",
                "duration_ms": 430,
                "status": "complete"
            },
            {
                "step": 4,
                "agent": "DiffAnalyzerAgent",
                "action": "Analyzing worker_config.py and HPA manifest changes",
                "detail": "CRITICAL: MAX_CONCURRENT_REQUESTS removed (set to None). Combined with HPA maxReplicas=8 cap, the service cannot scale horizontally. All concurrency absorbed by 8 fixed pods → CPU saturation.",
                "duration_ms": 310,
                "status": "complete"
            },
            {
                "step": 5,
                "agent": "CorrelationEngine",
                "action": "Multi-signal correlation analysis",
                "detail": "Root cause chain: HPA capped (c89d4f2, 04:15) → concurrency limits removed (b72e9f1, 05:28) → traffic surge (05:30) → CPU saturation (05:40). Combined failure of two independent changes. Confidence: 91%.",
                "duration_ms": 220,
                "status": "complete"
            },
            {
                "step": 6,
                "agent": "RemediationAgent",
                "action": "Generating remediation playbook",
                "detail": "Hotfix: restore MAX_CONCURRENT_REQUESTS=10, update HPA maxReplicas to 50. Immediate relief: kubectl scale deployment inference-service --replicas=20.",
                "duration_ms": 180,
                "status": "complete"
            }
        ],
        "root_cause": {
            "culprit": "Commits #b72e9f1 + #c89d4f2 removed concurrency limits and disabled HPA auto-scaling",
            "culprit_detail": "A compound failure caused by two independent commits: (1) Commit c89d4f2 set HPA maxReplicas=8 (equal to minReplicas), disabling horizontal auto-scaling. (2) Commit b72e9f1 removed MAX_CONCURRENT_REQUESTS cap (set to None). When traffic surged from 120 to 850 rps, the service could not scale out AND had no per-pod request throttle, causing all 8 pods to saturate at ~99% CPU for 78 minutes.",
            "commit_sha": "b72e9f1 + c89d4f2",
            "author": "ml-eng@company.com + platform-eng@company.com",
            "deployed_at": "2026-05-23T05:28:00Z",
            "file_changed": "src/inference/worker_config.py + k8s/inference-service-hpa.yaml",
            "confidence": 91,
            "impact": "98.7% CPU for 78 minutes, model inference latency P99 > 45s, SLO breach",
            "hotfix": {
                "description": "Restore concurrency limits and re-enable HPA auto-scaling",
                "file": "src/inference/worker_config.py",
                "code_before": "MAX_BATCH_SIZE = None  # removed cap\nMAX_CONCURRENT_REQUESTS = None  # auto-scale",
                "code_after": "MAX_BATCH_SIZE = 32\nMAX_CONCURRENT_REQUESTS = 10",
                "deploy_command": "kubectl patch hpa inference-service-hpa -p '{\"spec\":{\"maxReplicas\":50}}' -n production && kubectl rollout restart deployment/inference-service -n production",
                "estimated_recovery_minutes": 5
            }
        }
    },
    "db-connection-exhausted": {
        "id": "INC-2026-003",
        "title": "Database Connection Pool Exhausted - P1",
        "service": "order-service",
        "severity": "P1",
        "error_rate": 67.3,
        "log_file": "502_gateway_logs.json",
        "git_file": "git_commit_log.json",
        "analysis_steps": [
            {
                "step": 1,
                "agent": "DatadogIngestionAgent",
                "action": "Ingesting database metrics and alerts",
                "detail": "P1 alert: OrderService DB connections at 100% capacity. Active connections: 500/500. New connection requests queuing with 45s avg wait time.",
                "duration_ms": 300,
                "status": "complete"
            },
            {
                "step": 2,
                "agent": "LogParserAgent",
                "action": "Parsing order-service application logs",
                "detail": "Found N+1 query pattern: Each order list request triggering 47 individual item queries. With 200 concurrent users, generating 9,400 DB connections/second.",
                "duration_ms": 620,
                "status": "complete"
            },
            {
                "step": 3,
                "agent": "GitBlameAgent",
                "action": "Scanning ORM query changes in recent commits",
                "detail": "Commit d04a1e3 (18:45 UTC yesterday): Redis async migration removed query result caching. Cache miss rate jumped from 2% to 98%, exposing N+1 query pattern previously masked by cache hits.",
                "duration_ms": 450,
                "status": "complete"
            },
            {
                "step": 4,
                "agent": "QueryAnalyzerAgent",
                "action": "Analyzing slow query log from PostgreSQL",
                "detail": "Top offending query: SELECT * FROM order_items WHERE order_id = $1 (called 47x per order list). Missing composite index on (order_id, status). Full table scan on 2.3M row table.",
                "duration_ms": 380,
                "status": "complete"
            },
            {
                "step": 5,
                "agent": "CorrelationEngine",
                "action": "Tracing cache invalidation to connection exhaustion",
                "detail": "Causal chain confirmed: Redis client migration → cache miss rate 98% → N+1 queries exposed → DB connection pool saturation → OrderService 503s. Confidence: 89%.",
                "duration_ms": 190,
                "status": "complete"
            },
            {
                "step": 6,
                "agent": "RemediationAgent",
                "action": "Generating remediation playbook",
                "detail": "Immediate: Add eager loading (JOIN FETCH) to order items query. Short-term: Re-enable Redis query cache. Long-term: Add composite index on order_items(order_id, status).",
                "duration_ms": 240,
                "status": "complete"
            }
        ],
        "root_cause": {
            "culprit": "Redis async migration (commit #d04a1e3) disabled query caching, exposing N+1 query pattern",
            "culprit_detail": "The Redis client migration to async connection pool inadvertently disabled the query result cache (cache decorator incompatible with async context). This caused cache miss rate to jump from 2% to 98%, exposing a pre-existing N+1 query pattern in the order listing endpoint. Each request now triggers 47 individual SELECT queries instead of 1 cached response, saturating the 500-connection PostgreSQL pool under normal traffic.",
            "commit_sha": "d04a1e3",
            "author": "backend-eng@company.com",
            "deployed_at": "2026-05-22T18:45:00Z",
            "file_changed": "src/cache/redis_client.py + src/orders/repository.py",
            "confidence": 89,
            "impact": "67.3% error rate on order endpoints, 500 DB connections saturated, 2.3M row table full-scanned",
            "hotfix": {
                "description": "Add eager loading to order items query to eliminate N+1 pattern",
                "file": "src/orders/repository.py",
                "code_before": "orders = db.query(Order).filter(Order.user_id == user_id).all()\nfor order in orders:\n    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()",
                "code_after": "orders = db.query(Order).options(\n    joinedload(Order.items)\n).filter(Order.user_id == user_id).all()",
                "deploy_command": "kubectl rollout restart deployment/order-service -n production",
                "estimated_recovery_minutes": 3
            }
        }
    }
}


def load_mock_data(filename: str) -> dict:
    """Load mock data JSON file."""
    filepath = os.path.join(MOCK_DATA_DIR, filename)
    try:
        with open(filepath, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def get_all_incidents() -> list:
    """Return list of all mock incidents for the triage board."""
    return [
        {
            "id": "INC-2026-001",
            "title": "PaymentGateway 502 Bad Gateway",
            "description": "84.8% of payment requests failing with upstream connect errors. P1 SLO breach.",
            "service": "payment-gateway",
            "severity": "P1",
            "status": "active",
            "error_rate": 84.8,
            "started_at": "2026-05-23T06:45:00Z",
            "duration_minutes": 30,
            "affected_users": 71480,
            "revenue_impact": "$426K",
            "incident_key": "payment-gateway-502"
        },
        {
            "id": "INC-2026-002",
            "title": "InferenceService CPU Saturation",
            "description": "8 inference pods at 98.7% CPU for 78 minutes. HPA not scaling. Model latency P99 > 45s.",
            "service": "inference-service",
            "severity": "P2",
            "status": "active",
            "cpu_peak": 98.7,
            "started_at": "2026-05-23T05:42:00Z",
            "duration_minutes": 78,
            "affected_users": 12400,
            "revenue_impact": "$89K",
            "incident_key": "inference-cpu-spike"
        },
        {
            "id": "INC-2026-003",
            "title": "Database Connection Pool Exhausted",
            "description": "OrderService DB connections at 100% capacity. N+1 query storm detected. 67.3% error rate.",
            "service": "order-service",
            "severity": "P1",
            "status": "investigating",
            "error_rate": 67.3,
            "started_at": "2026-05-23T07:00:00Z",
            "duration_minutes": 15,
            "affected_users": 34200,
            "revenue_impact": "$213K",
            "incident_key": "db-connection-exhausted"
        }
    ]


def analyze_incident(incident_key: str) -> dict:
    """
    Main analysis function — rule-based AI engine built by human coders.
    Returns full diagnostic result with root cause and hotfix.
    """
    if incident_key not in INCIDENT_KNOWLEDGE_BASE:
        return {
            "error": f"Incident '{incident_key}' not found in knowledge base",
            "available_incidents": list(INCIDENT_KNOWLEDGE_BASE.keys())
        }

    kb_entry = INCIDENT_KNOWLEDGE_BASE[incident_key]

    # Load relevant mock data files
    log_data = load_mock_data(kb_entry["log_file"])
    git_data = load_mock_data(kb_entry["git_file"])

    return {
        "incident_id": kb_entry["id"],
        "incident_title": kb_entry["title"],
        "service": kb_entry["service"],
        "severity": kb_entry["severity"],
        "analysis_steps": kb_entry["analysis_steps"],
        "root_cause": kb_entry["root_cause"],
        "data_sources_scanned": {
            "log_entries": len(log_data.get("log_entries", log_data.get("timeseries", []))),
            "commits_analyzed": len(git_data.get("commits", [])),
            "alerts_processed": 1,
            "metrics_datapoints": 13 if "timeseries" in log_data else 0
        },
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "agent_version": "SREAnalyzer v2.1.0 (Built by Human Coders)"
    }


def stream_analysis_steps(incident_key: str) -> Generator[dict, None, None]:
    """
    Generator that yields analysis steps one by one (for streaming simulation).
    """
    result = analyze_incident(incident_key)
    if "error" in result:
        yield {"type": "error", "data": result}
        return

    yield {"type": "start", "data": {"incident_id": result["incident_id"], "title": result["incident_title"]}}

    for step in result["analysis_steps"]:
        yield {"type": "step", "data": step}

    yield {"type": "complete", "data": {
        "root_cause": result["root_cause"],
        "data_sources_scanned": result["data_sources_scanned"],
        "analyzed_at": result["analyzed_at"],
        "agent_version": result["agent_version"]
    }}
