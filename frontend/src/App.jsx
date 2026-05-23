import { useState, useEffect, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// ─── Utility Components ────────────────────────────────────────────────────

const SeverityBadge = ({ severity }) => {
  const colors = {
    P1: 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
    P2: 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-[0_0_8px_rgba(249,115,22,0.3)]',
    P3: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  }
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${colors[severity] || colors.P3}`}>
      {severity}
    </span>
  )
}

const PulseDot = ({ color = 'red' }) => {
  const colorMap = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    violet: 'bg-violet-500',
  }
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorMap[color]} opacity-60`}></span>
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[color]}`}></span>
    </span>
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────

const Header = ({ incidents }) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const criticalCount = incidents.filter(i => i.severity === 'P1').length

  return (
    <header className="terminal-header sticky top-0 z-50 px-6 py-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center glow-violet">
              <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight">SRE · AI Incident Analyzer</h1>
              <p className="text-xs text-slate-500 font-mono">v2.1.0 · Built by Human Coders</p>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10 hidden md:block" />
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <PulseDot color="green" />
            <span>All agents online</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-3 py-1.5">
              <PulseDot color="red" />
              <span className="text-xs font-semibold text-red-400">{criticalCount} CRITICAL ACTIVE</span>
            </div>
          )}
          <div className="text-xs font-mono text-slate-500">
            {time.toUTCString().slice(17, 25)} UTC
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Metrics Strip ───────────────────────────────────────────────────────────

const MetricsStrip = ({ incidents }) => {
  const totalRevenue = incidents.reduce((sum, i) => {
    const v = parseInt((i.revenue_impact || '$0').replace(/\D/g, ''))
    return sum + v
  }, 0)
  const totalAffected = incidents.reduce((sum, i) => sum + (i.affected_users || 0), 0)

  const metrics = [
    { label: 'Active Incidents', value: incidents.length, sub: `${incidents.filter(i => i.severity === 'P1').length} critical`, color: 'text-red-400', icon: '🚨' },
    { label: 'Affected Users', value: totalAffected.toLocaleString(), sub: 'across all services', color: 'text-orange-400', icon: '👥' },
    { label: 'Revenue at Risk', value: `$${(totalRevenue / 1000).toFixed(0)}K`, sub: 'est. current exposure', color: 'text-yellow-400', icon: '💰' },
    { label: 'MTTR Target', value: '< 15 min', sub: 'AI-assisted triage', color: 'text-green-400', icon: '⚡' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {metrics.map((m, i) => (
        <div key={i} className="glass-card rounded-xl p-4 hover-lift animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="flex items-start justify-between mb-2">
            <span className="text-lg">{m.icon}</span>
            <span className={`text-2xl font-bold font-mono ${m.color}`}>{m.value}</span>
          </div>
          <div className="text-xs font-semibold text-slate-300">{m.label}</div>
          <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── Incident Card ───────────────────────────────────────────────────────────

const IncidentCard = ({ incident, onAnalyze, isAnalyzing }) => {
  const sevColor = incident.severity === 'P1'
    ? 'border-red-500/25 bg-gradient-to-br from-red-950/30 via-slate-900/50 to-transparent'
    : 'border-orange-500/25 bg-gradient-to-br from-orange-950/20 via-slate-900/50 to-transparent'

  const durationText = `${incident.duration_minutes}m ago`

  return (
    <div className={`relative rounded-xl border ${sevColor} p-5 hover-lift animate-slide-up group overflow-hidden`}>
      {/* Scan line effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent top-0" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <span className="text-xs font-mono text-slate-500">{incident.id}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <PulseDot color={incident.severity === 'P1' ? 'red' : 'orange'} />
          <span>{durationText}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{incident.title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">{incident.description}</p>

      {/* Service tag */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          {incident.service}
        </span>
        {incident.error_rate && (
          <span className="inline-flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1 text-xs text-red-400 font-mono">
            {incident.error_rate}% err
          </span>
        )}
        {incident.cpu_peak && (
          <span className="inline-flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1 text-xs text-orange-400 font-mono">
            {incident.cpu_peak}% CPU
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="bg-slate-900/60 rounded-lg p-2.5">
          <div className="text-slate-500 mb-0.5">Affected Users</div>
          <div className="font-semibold font-mono text-slate-200">{(incident.affected_users || 0).toLocaleString()}</div>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-2.5">
          <div className="text-slate-500 mb-0.5">Revenue Impact</div>
          <div className="font-semibold font-mono text-yellow-400">{incident.revenue_impact}</div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        id={`analyze-btn-${incident.incident_key}`}
        onClick={() => onAnalyze(incident)}
        disabled={isAnalyzing}
        className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 
          ${isAnalyzing
            ? 'bg-violet-600/20 border border-violet-500/30 text-violet-400 cursor-not-allowed'
            : 'bg-violet-600 hover:bg-violet-500 border border-violet-500 text-white shadow-lg hover:shadow-violet-500/30 active:scale-95'
          }`}
      >
        {isAnalyzing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Analyze Incident
          </>
        )}
      </button>
    </div>
  )
}

// ─── Diagnostic Console (Streaming Steps) ────────────────────────────────────

const AgentIcon = ({ agent }) => {
  const icons = {
    DatadogIngestionAgent: '📊',
    LogParserAgent: '📜',
    GitBlameAgent: '🔍',
    DiffAnalyzerAgent: '⚡',
    CorrelationEngine: '🔗',
    RemediationAgent: '🛠️',
    MetricsAnalyzerAgent: '📈',
    QueryAnalyzerAgent: '🗄️',
  }
  return <span>{icons[agent] || '🤖'}</span>
}

const DiagnosticConsole = ({ incident, steps, isStreaming, isComplete }) => {
  const scrollRef = useRef(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [steps])

  if (!incident) return null

  return (
    <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400">
            sre-ai-agent — analyzing {incident.incident_key}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && <PulseDot color="violet" />}
          <span className={`text-xs font-mono ${isStreaming ? 'text-violet-400' : isComplete ? 'text-green-400' : 'text-slate-500'}`}>
            {isStreaming ? 'RUNNING' : isComplete ? 'COMPLETE' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Steps Feed */}
      <div ref={scrollRef} className="p-4 max-h-[380px] overflow-y-auto space-y-3">
        {steps.map((step, idx) => (
          <div key={idx} className="flex gap-3 step-enter" style={{ animationDelay: `${idx * 0.05}s` }}>
            {/* Step indicator */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                ${step.status === 'complete'
                  ? 'bg-violet-600/30 border-violet-500/60 text-violet-300'
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-400'}`}>
                {step.step}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-px flex-1 mt-1 bg-gradient-to-b from-violet-500/30 to-transparent min-h-[8px]" />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 mb-1">
                <AgentIcon agent={step.agent} />
                <span className="text-xs font-semibold text-violet-300">{step.agent}</span>
                <span className="text-xs text-slate-500 font-mono">{step.duration_ms}ms</span>
                {step.status === 'complete' && (
                  <span className="ml-auto text-green-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="text-xs font-medium text-slate-300 mb-0.5">{step.action}</div>
              <div className="text-xs text-slate-500 leading-relaxed font-mono bg-slate-900/50 rounded-lg px-3 py-2 border border-white/4">
                {step.detail}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isStreaming && steps.length < 6 && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-700/50 border border-slate-600/50 flex items-center justify-center flex-shrink-0">
              <span className="flex gap-0.5">
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 font-mono typing-cursor">Agent processing</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-600">SREAnalyzer v2.1.0 · Built by Human Coders</span>
        <span className="text-xs font-mono text-slate-600">{steps.length}/6 agents complete</span>
      </div>
    </div>
  )
}

// ─── Confidence Ring ─────────────────────────────────────────────────────────

const ConfidenceRing = ({ value }) => {
  const circumference = 2 * Math.PI * 36
  const strokeDash = (value / 100) * circumference
  const color = value >= 90 ? '#8b5cf6' : value >= 75 ? '#f97316' : '#eab308'

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold font-mono text-white">{value}%</span>
        <span className="text-[9px] text-slate-500 uppercase tracking-wider">conf.</span>
      </div>
    </div>
  )
}

// ─── Root Cause Card ─────────────────────────────────────────────────────────

const RootCauseCard = ({ result, onGenerateHotfix, hotfix, isLoadingHotfix }) => {
  const { root_cause, incident_title } = result
  const [showDiff, setShowDiff] = useState(false)
  const [hotfixCopied, setHotfixCopied] = useState(false)

  const copyHotfix = () => {
    const code = `# File: ${hotfix.file}\n\n# BEFORE (bad config):\n${hotfix.code_before}\n\n# AFTER (hotfix):\n${hotfix.code_after}\n\n# Deploy command:\n${hotfix.deploy_command}`
    navigator.clipboard.writeText(code).then(() => {
      setHotfixCopied(true)
      setTimeout(() => setHotfixCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Root Cause Header Card */}
      <div className="glass-card rounded-xl overflow-hidden border border-violet-500/20 glow-violet">
        <div className="px-5 py-4 bg-gradient-to-r from-violet-900/20 to-transparent border-b border-violet-500/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-violet-400">🎯</span>
            <h2 className="text-sm font-bold text-violet-300 uppercase tracking-wider">Root Cause Identified</h2>
          </div>
          <p className="text-xs text-slate-400">{incident_title}</p>
        </div>

        <div className="p-5">
          <div className="flex gap-5 items-start">
            <ConfidenceRing value={root_cause.confidence} />
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">THE CULPRIT</div>
                <div className="text-sm font-semibold text-white leading-snug font-mono bg-slate-900/60 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <span className="text-red-400">●</span> {root_cause.culprit}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                  <div className="text-slate-500 mb-1">Commit SHA</div>
                  <div className="font-mono text-cyan-400 font-semibold">{root_cause.commit_sha}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                  <div className="text-slate-500 mb-1">Author</div>
                  <div className="font-mono text-slate-300 truncate">{root_cause.author}</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                  <div className="text-slate-500 mb-1">Deployed At</div>
                  <div className="font-mono text-slate-300">{new Date(root_cause.deployed_at).toLocaleTimeString()} UTC</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
                  <div className="text-slate-500 mb-1">Impact</div>
                  <div className="font-mono text-orange-400 text-[10px] leading-tight">{root_cause.impact}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed explanation */}
          <div className="mt-4 bg-slate-900/60 rounded-xl p-4 border border-white/5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Analysis Summary</div>
            <p className="text-xs text-slate-400 leading-relaxed">{root_cause.culprit_detail}</p>
          </div>
        </div>
      </div>

      {/* Hotfix Generator */}
      <div className="glass-card rounded-xl overflow-hidden border border-green-500/20">
        <div className="px-5 py-4 bg-gradient-to-r from-green-900/15 to-transparent border-b border-green-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🛠️</span>
            <h3 className="text-sm font-bold text-green-300 uppercase tracking-wider">Deployment Hotfix</h3>
          </div>
          {hotfix && (
            <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 rounded-full px-2.5 py-0.5 font-semibold">
              ⚡ {hotfix.estimated_recovery_minutes} min recovery
            </span>
          )}
        </div>

        <div className="p-5">
          {!hotfix && !isLoadingHotfix && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400 mb-4">Generate the precise code fix required to resolve this outage instantly.</p>
              <button
                id="generate-hotfix-btn"
                onClick={onGenerateHotfix}
                className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-500 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/30 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Generate Deployment Hotfix
              </button>
            </div>
          )}

          {isLoadingHotfix && (
            <div className="flex items-center justify-center gap-3 py-6">
              <svg className="w-5 h-5 animate-spin text-green-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-green-400 font-mono">Generating hotfix patch...</span>
            </div>
          )}

          {hotfix && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    📁 {hotfix.file}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDiff(!showDiff)}
                      className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showDiff ? '▼ hide diff' : '▶ show diff'}
                    </button>
                  </div>
                </div>

                {showDiff && (
                  <div className="hotfix-code rounded-lg p-4 animate-fade-in">
                    <div className="code-diff space-y-1">
                      {hotfix.code_before.split('\n').map((line, i) => (
                        <div key={`b-${i}`} className="removed px-3 py-0.5 rounded-sm">
                          <span className="text-slate-500 mr-2 select-none">-</span>{line}
                        </div>
                      ))}
                      <div className="h-1" />
                      {hotfix.code_after.split('\n').map((line, i) => (
                        <div key={`a-${i}`} className="added px-3 py-0.5 rounded-sm">
                          <span className="text-slate-500 mr-2 select-none">+</span>{line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deploy command */}
              <div className="hotfix-code rounded-lg p-4">
                <div className="text-xs text-slate-500 mb-2 font-mono">$ Deploy Command</div>
                <code className="text-xs font-mono text-green-400 break-all leading-relaxed">{hotfix.deploy_command}</code>
              </div>

              <div className="flex gap-3">
                <button
                  id="copy-hotfix-btn"
                  onClick={copyHotfix}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50 text-slate-200 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 active:scale-95"
                >
                  {hotfixCopied ? (
                    <><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400">Copied!</span></>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>Copy Hotfix</>
                  )}
                </button>
                <button
                  id="deploy-hotfix-btn"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 border border-green-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-green-500/30 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  Deploy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

const EmptyConsole = () => (
  <div className="glass-card rounded-xl flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-5 animate-bounce-subtle">
      <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>
    <h3 className="text-base font-semibold text-slate-300 mb-2">AI Diagnostic Console</h3>
    <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
      Select an incident from the triage board and click <span className="text-violet-400 font-semibold">Analyze Incident</span> to begin real-time AI root cause analysis.
    </p>
    <div className="flex items-center gap-2 mt-6 text-xs text-slate-600">
      <span className="w-2 h-2 rounded-full bg-violet-500/50 animate-pulse" />
      6 AI agents standing by
    </div>
  </div>
)

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [analyzingKey, setAnalyzingKey] = useState(null)
  const [activeIncident, setActiveIncident] = useState(null)
  const [steps, setSteps] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [hotfix, setHotfix] = useState(null)
  const [isLoadingHotfix, setIsLoadingHotfix] = useState(false)

  const eventSourceRef = useRef(null)

  // Fetch incidents on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/incidents`)
      .then(r => r.json())
      .then(data => {
        setIncidents(data.incidents || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Backend offline — ensure FastAPI is running on port 8000')
        setLoading(false)
      })
  }, [])

  const handleAnalyze = (incident) => {
    // Reset state
    setActiveIncident(incident)
    setSteps([])
    setIsStreaming(true)
    setIsComplete(false)
    setAnalysisResult(null)
    setHotfix(null)
    setAnalyzingKey(incident.incident_key)

    // Close any existing SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const url = `${API_BASE}/api/analyze/stream/${incident.incident_key}`
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('step', (e) => {
      const data = JSON.parse(e.data)
      setSteps(prev => [...prev, data])
    })

    es.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data)
      setAnalysisResult({
        root_cause: data.root_cause,
        incident_title: incident.title,
        incident_key: incident.incident_key,
        data_sources_scanned: data.data_sources_scanned,
        analyzed_at: data.analyzed_at,
        agent_version: data.agent_version
      })
      setIsStreaming(false)
      setIsComplete(true)
      setAnalyzingKey(null)
      es.close()
    })

    es.addEventListener('done', () => {
      es.close()
    })

    es.addEventListener('error', (e) => {
      console.error('SSE error:', e)
      setIsStreaming(false)
      setAnalyzingKey(null)
      es.close()
    })
  }

  const handleGenerateHotfix = async () => {
    if (!analysisResult) return
    setIsLoadingHotfix(true)
    try {
      const res = await fetch(`${API_BASE}/api/hotfix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incident_key: analysisResult.incident_key })
      })
      const data = await res.json()
      setHotfix(data.hotfix)
    } catch (err) {
      console.error('Hotfix fetch error:', err)
    }
    setIsLoadingHotfix(false)
  }

  return (
    <div className="min-h-screen bg-[#080c14]">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/3 rounded-full blur-3xl" />
      </div>

      <Header incidents={incidents} />

      <main className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
        <MetricsStrip incidents={incidents} />

        {/* Backend error */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <div className="text-sm font-semibold text-red-400">Connection Error</div>
              <div className="text-xs text-slate-400 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          {/* Left: Triage Board */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Incident Triage Board</h2>
                <p className="text-xs text-slate-500 mt-0.5">Active alerts requiring immediate attention</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <PulseDot color="red" />
                Live monitoring
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="glass-card rounded-xl p-5 shimmer h-64" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                {incidents.map((incident) => (
                  <IncidentCard
                    key={incident.id}
                    incident={incident}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analyzingKey === incident.incident_key}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: AI Console + Root Cause */}
          <div className="space-y-5">
            {/* Console Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">AI Diagnostic Console</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time agent reasoning trace</p>
              </div>
              {isComplete && analysisResult && (
                <span className="flex items-center gap-1.5 text-xs bg-green-500/15 text-green-400 border border-green-500/30 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Analysis complete
                </span>
              )}
            </div>

            {/* Console or empty state */}
            {activeIncident ? (
              <DiagnosticConsole
                incident={activeIncident}
                steps={steps}
                isStreaming={isStreaming}
                isComplete={isComplete}
              />
            ) : (
              <EmptyConsole />
            )}

            {/* Root Cause Card */}
            {isComplete && analysisResult && (
              <RootCauseCard
                result={analysisResult}
                onGenerateHotfix={handleGenerateHotfix}
                hotfix={hotfix}
                isLoadingHotfix={isLoadingHotfix}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-12 border-t border-white/5 px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between text-xs text-slate-600">
          <span>SRE AI Incident Analyzer · Hackathon MVP · Built with FastAPI + React</span>
          <span className="font-mono">Built by Human Coders · 6 Specialized Agents</span>
        </div>
      </footer>
    </div>
  )
}
