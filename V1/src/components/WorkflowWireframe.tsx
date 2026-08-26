import { useRef, useState, useMemo } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import useReducedMotion from '../hooks/useReducedMotion';
import SectionReveal from './SectionReveal';

// ─── Vexlio-style Interactive Architecture Diagram ────────────────────
// Whole-system overview on canvas, detail pushed into popup panels.
// Click any node to open its detail panel (Vexlio pattern).
// Hover to highlight traceable paths.

interface WNode {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  phase: number;
  kind: 'proc' | 'decision' | 'term' | 'data' | 'io';
  popup: {
    title: string;
    items: { label: string; value: string }[];
    note: string;
  };
}

interface WEdge {
  from: string;
  to: string;
  label?: string;
  curved?: boolean;
  curveOff?: number;
}

// ─── Phases ───────────────────────────────────────────────────────────

const PHASES = [
  { id: 'disc', label: 'Discovery', x: 7 },
  { id: 'arch', label: 'Architecture', x: 24 },
  { id: 'impl', label: 'Implementation', x: 44 },
  { id: 'qa', label: 'Verification', x: 64 },
  { id: 'ship', label: 'Delivery', x: 84 },
] as const;

// ─── Nodes with Vexlio-style popup content ────────────────────────────

const N: WNode[] = [
  { id:'brief', label:'Brief', sub:'Requirements', x:7, y:18, phase:0, kind:'term',
    popup:{ title:'Requirements Brief', items:[
      { label:'Input', value:'Stakeholder interviews, domain documents' },
      { label:'Output', value:'Problem statement, success criteria, scope' },
      { label:'Owner', value:'Engineer + Domain Expert' },
      { label:'Duration', value:'1–3 days' },
    ], note:'Define the real problem. Separate symptoms from root causes. Establish what success looks like before writing code.' }},

  { id:'stake', label:'Stakeholders', sub:'Map & Align', x:7, y:38, phase:0, kind:'proc',
    popup:{ title:'Stakeholder Mapping', items:[
      { label:'Who', value:'End users, maintainers, decision makers' },
      { label:'Method', value:'Interviews, workflow observation' },
      { label:'Output', value:'Priority matrix, communication plan' },
    ], note:'Map every stakeholder. Understand who the system serves, who maintains it, and who decides.' }},

  { id:'domain', label:'Domain', sub:'Deep Study', x:7, y:58, phase:0, kind:'proc',
    popup:{ title:'Domain Research', items:[
      { label:'Areas', value:'Healthcare, civic tech, education' },
      { label:'Method', value:'Workflow analysis, regulatory review' },
      { label:'Output', value:'Domain model, glossary, constraints' },
    ], note:'Study the domain deeply. The system serves the domain, not the other way around.' }},

  { id:'constraints', label:'Constraints', sub:'Hard Limits', x:7, y:78, phase:0, kind:'data',
    popup:{ title:'Constraint Analysis', items:[
      { label:'Privacy', value:'Data classification, PII handling' },
      { label:'Latency', value:'Response time budgets per endpoint' },
      { label:'Offline', value:'Connectivity requirements' },
      { label:'Deploy', value:'Target infrastructure, budget' },
    ], note:'Hard constraints define the solution space. Constraints sharpen design.' }},

  { id:'feasible', label:'Feasible?', sub:'Go / No-Go', x:7, y:96, phase:0, kind:'decision',
    popup:{ title:'Feasibility Gate', items:[
      { label:'Criteria', value:'Technical, economic, temporal' },
      { label:'Risk', value:'Unknowns, dependencies, team capacity' },
      { label:'Decision', value:'Proceed, pivot, or stop' },
    ], note:'Is this worth solving with software? Can it be solved within constraints? Honest no-go saves months.' }},

  { id:'sysarch', label:'System', sub:'Architecture', x:24, y:14, phase:1, kind:'decision',
    popup:{ title:'System Architecture', items:[
      { label:'Pattern', value:'Monolith-first, split at seams' },
      { label:'Stack', value:'Python/Flask, SQLite, HTML5/CSS3' },
      { label:'Comms', value:'WebSocket for real-time' },
      { label:'Principle', value:'Self-contained, minimal deps' },
    ], note:'Choose the simplest architecture. Flask over Django for control. SQLite over Postgres when it suffices.' }},

  { id:'datamodel', label:'Data Model', sub:'Schema First', x:24, y:34, phase:1, kind:'data',
    popup:{ title:'Data Model Design', items:[
      { label:'Storage', value:'SQLite (self-contained)' },
      { label:'Ingestion', value:'Excel-to-SQLITE pipeline' },
      { label:'Schema', value:'Domain-driven, normalized' },
      { label:'Migrations', value:'Version-controlled schema files' },
    ], note:'Design the data model first. Schema drives API, API drives UI. Get the nouns right before the verbs.' }},

  { id:'apicon', label:'API', sub:'Contract', x:24, y:52, phase:1, kind:'proc',
    popup:{ title:'API Contract', items:[
      { label:'Style', value:'REST over Flask' },
      { label:'Auth', value:'Session-based, role-scoped' },
      { label:'Errors', value:'Structured error responses' },
      { label:'Docs', value:'OpenAPI spec, auto-generated' },
    ], note:'Define the API contract upfront. Request shapes, response shapes, error modes — all before implementation.' }},

  { id:'designsys', label:'Design Sys', sub:'Tokens & Components', x:24, y:70, phase:1, kind:'proc',
    popup:{ title:'Design System', items:[
      { label:'Foundation', value:'Public Sans, ivory/charcoal palette' },
      { label:'Spacing', value:'4px base scale' },
      { label:'Components', value:'Cards, buttons, forms, modals' },
      { label:'States', value:'Loading, empty, error, success' },
    ], note:'Establish the design system: spacing scale, type scale, color tokens, component patterns. Consistency compounds.' }},

  { id:'secpol', label:'Security', sub:'Policy', x:24, y:88, phase:1, kind:'io',
    popup:{ title:'Security Policy', items:[
      { label:'Auth', value:'Session + role-based access' },
      { label:'Data', value:'Classification, encryption at rest' },
      { label:'Audit', value:'Action logging, tamper detection' },
      { label:'OCR', value:'Identity/OCR utility integration' },
    ], note:'Define security policy early: authentication, authorization, data classification, audit trails.' }},

  { id:'review', label:'Review', sub:'Architecture', x:24, y:104, phase:1, kind:'decision',
    popup:{ title:'Architecture Review', items:[
      { label:'Check', value:'Solves the problem? Deps justified?' },
      { label:'Maintainable', value:'Team can support this?' },
      { label:'Simpler?', value:'Can anything be removed?' },
    ], note:'Architecture review: does the design solve the problem? Simpler is almost always better.' }},

  { id:'backend', label:'Backend', sub:'API & Logic', x:44, y:12, phase:2, kind:'proc',
    popup:{ title:'Backend Implementation', items:[
      { label:'Language', value:'Python 3' },
      { label:'Framework', value:'Flask (lightweight, explicit)' },
      { label:'Routes', value:'REST endpoints, WebSocket handlers' },
      { label:'Logic', value:'Business rules, validation, transforms' },
    ], note:'Build the backend: routes, business logic, data access. Keep layers thin. Push complexity down, not across.' }},

  { id:'frontend', label:'Frontend', sub:'UI & UX', x:44, y:30, phase:2, kind:'proc',
    popup:{ title:'Frontend Implementation', items:[
      { label:'Markup', value:'HTML5, semantic structure' },
      { label:'Style', value:'CSS3, Bootstrap utility classes' },
      { label:'Script', value:'JavaScript (minimal)' },
      { label:'Access', value:'ARIA labels, keyboard nav, focus' },
    ], note:'Build the frontend against the API contract. Accessible by default. Component composition over inheritance.' }},

  { id:'datapipe', label:'Data Pipe', sub:'Ingest & Transform', x:44, y:48, phase:2, kind:'data',
    popup:{ title:'Data Pipeline', items:[
      { label:'Ingest', value:'Excel-to-SQLITE, CSV import' },
      { label:'Transform', value:'Validation, normalization' },
      { label:'Store', value:'SQLite with versioned schema' },
      { label:'Idempotent', value:'Safe re-runs on failure' },
    ], note:'Wire the data pipeline: ingestion, transformation, storage. Handle failure at every step.' }},

  { id:'realtime', label:'Real-Time', sub:'WebSocket', x:44, y:66, phase:2, kind:'proc',
    popup:{ title:'Real-Time Communication', items:[
      { label:'Protocol', value:'WebSocket over Flask-SocketIO' },
      { label:'Features', value:'LAN messaging, presence, typing' },
      { label:'Resilience', value:'Reconnection, backpressure' },
    ], note:'WebSocket for real-time: messaging, presence, event broadcasting. Handle reconnection gracefully.' }},

  { id:'auth', label:'Auth', sub:'Identity', x:44, y:84, phase:2, kind:'io',
    popup:{ title:'Identity & Access', items:[
      { label:'Method', value:'Session-based authentication' },
      { label:'Roles', value:'Admin, editor, viewer' },
      { label:'OCR', value:'Document identity verification' },
      { label:'Audit', value:'Login/logout, access events' },
    ], note:'Implement identity: authentication flows, session management, role-based access control.' }},

  { id:'integ', label:'Integration', sub:'Wire & Stitch', x:44, y:100, phase:2, kind:'decision',
    popup:{ title:'Integration Wiring', items:[
      { label:'Seams', value:'Backend↔Frontend, Pipe↔Storage' },
      { label:'Design', value:'Design system ↔ components' },
      { label:'Auth', value:'Every endpoint gated' },
    ], note:'Integrate all layers. Wire backend to frontend, pipeline to storage, design system to components.' }},

  { id:'unit', label:'Unit', sub:'Pure Logic', x:64, y:12, phase:3, kind:'proc',
    popup:{ title:'Unit Testing', items:[
      { label:'Scope', value:'Parsers, validators, transformers' },
      { label:'Speed', value:'Fast, deterministic, no I/O' },
      { label:'Principle', value:'Test behavior, not implementation' },
    ], note:'Unit tests for pure logic. Fast, deterministic, no I/O. Test behavior, not implementation.' }},

  { id:'inttest', label:'Integration', sub:'Seam Tests', x:64, y:30, phase:3, kind:'proc',
    popup:{ title:'Integration Testing', items:[
      { label:'Scope', value:'API endpoints, DB queries, WebSocket' },
      { label:'Data', value:'Controlled fixtures, real dependencies' },
      { label:'Tool', value:'Flask test client, Selenium' },
    ], note:'Integration tests for seams: API endpoints, database queries, WebSocket handlers.' }},

  { id:'e2e', label:'End-to-End', sub:'User Flows', x:64, y:48, phase:3, kind:'proc',
    popup:{ title:'End-to-End Testing', items:[
      { label:'Tool', value:'Selenium (browser automation)' },
      { label:'Flows', value:'Registration, submission, messaging' },
      { label:'CV', value:'Face detection verification' },
    ], note:'End-to-end tests for critical user flows using Selenium browser automation suite.' }},

  { id:'edge', label:'Edge Cases', sub:'Boundaries', x:64, y:66, phase:3, kind:'decision',
    popup:{ title:'Edge Case Testing', items:[
      { label:'Input', value:'Empty, oversized, malformed' },
      { label:'Concurrency', value:'Simultaneous writes, race conditions' },
      { label:'Network', value:'Failures, timeouts, partial responses' },
    ], note:'Edge case testing: empty inputs, concurrent writes, network failures, malformed data.' }},

  { id:'perf', label:'Perf', sub:'Load & Latency', x:64, y:84, phase:3, kind:'data',
    popup:{ title:'Performance Testing', items:[
      { label:'Load', value:'Beyond expected capacity' },
      { label:'Metrics', value:'P50/P95/P99 latency, throughput' },
      { label:'Resources', value:'Memory, connection pool, CPU' },
    ], note:'Performance testing: load beyond expected capacity. Measure latency percentiles and throughput.' }},

  { id:'accept', label:'Accept', sub:'Criteria Met?', x:64, y:100, phase:3, kind:'decision',
    popup:{ title:'Acceptance Criteria', items:[
      { label:'Verify', value:'Against problem definition' },
      { label:'Not', value:'Against implementation spec' },
      { label:'Gate', value:'All critical flows passing' },
    ], note:'Does the system solve the original problem? Verify against the problem definition, not the spec.' }},

  { id:'stage', label:'Staging', sub:'Pre-Production', x:84, y:22, phase:4, kind:'term',
    popup:{ title:'Staging Deployment', items:[
      { label:'Env', value:'Production-mirror staging' },
      { label:'Checks', value:'Smoke tests, migration validation' },
      { label:'Config', value:'Environment parity verified' },
    ], note:'Deploy to staging. Smoke tests, data migrations, configuration validation.' }},

  { id:'deploy', label:'Deploy', sub:'Pipeline', x:84, y:42, phase:4, kind:'term',
    popup:{ title:'Production Deployment', items:[
      { label:'Pipeline', value:'Build → Test → Stage → Promote' },
      { label:'Manual', value:'Zero manual steps in critical path' },
      { label:'Rollback', value:'Verified rollback strategy' },
    ], note:'Deploy via automated pipeline. No manual steps. Rollback strategy verified before promote.' }},

  { id:'monitor', label:'Monitor', sub:'Observe & Alert', x:84, y:60, phase:4, kind:'data',
    popup:{ title:'Production Monitoring', items:[
      { label:'Errors', value:'Rate, type, stack traces' },
      { label:'Latency', value:'P50, P95, P99 percentiles' },
      { label:'Business', value:'Active users, submissions, messages' },
    ], note:'Monitor in production: error rates, latency percentiles, business metrics. Observe real experience.' }},

  { id:'incident', label:'Incident', sub:'Response', x:84, y:78, phase:4, kind:'io',
    popup:{ title:'Incident Response', items:[
      { label:'Process', value:'Detect → Triage → Mitigate → Resolve' },
      { label:'Post-mortem', value:'Blameless, system-focused' },
      { label:'Outcome', value:'Every incident improves the system' },
    ], note:'Incident response: detect, triage, mitigate, resolve, post-mortem. Blameless process.' }},

  { id:'iterate', label:'Iterate', sub:'Next Cycle', x:84, y:96, phase:4, kind:'proc',
    popup:{ title:'Iteration Cycle', items:[
      { label:'Evidence', value:'Real usage data, not assumptions' },
      { label:'Refactor', value:'When the need is real' },
      { label:'Ship', value:'Next smallest useful thing' },
    ], note:'Iterate on evidence. Real usage data drives the next cycle. Ship the next smallest useful thing.' }},
];

// ─── Edges ────────────────────────────────────────────────────────────

const E: WEdge[] = [
  { from:'brief', to:'stake' },
  { from:'stake', to:'domain' },
  { from:'domain', to:'constraints' },
  { from:'constraints', to:'feasible' },
  { from:'feasible', to:'sysarch' },
  { from:'domain', to:'datamodel', curved:true, curveOff:-6 },
  { from:'constraints', to:'secpol', curved:true, curveOff:6 },
  { from:'sysarch', to:'datamodel' },
  { from:'datamodel', to:'apicon' },
  { from:'apicon', to:'designsys' },
  { from:'secpol', to:'review' },
  { from:'designsys', to:'review' },
  { from:'sysarch', to:'secpol', curved:true, curveOff:-8 },
  { from:'review', to:'backend' },
  { from:'apicon', to:'frontend', curved:true, curveOff:-5 },
  { from:'datamodel', to:'datapipe', curved:true, curveOff:-5 },
  { from:'designsys', to:'frontend', curved:true, curveOff:6 },
  { from:'secpol', to:'auth', curved:true, curveOff:5 },
  { from:'backend', to:'frontend' },
  { from:'datapipe', to:'realtime' },
  { from:'realtime', to:'auth' },
  { from:'frontend', to:'integ' },
  { from:'auth', to:'integ' },
  { from:'backend', to:'integ', curved:true, curveOff:-6 },
  { from:'datapipe', to:'integ', curved:true, curveOff:6 },
  { from:'backend', to:'unit' },
  { from:'frontend', to:'inttest' },
  { from:'integ', to:'e2e' },
  { from:'realtime', to:'edge', curved:true, curveOff:-5 },
  { from:'auth', to:'edge', curved:true, curveOff:5 },
  { from:'unit', to:'inttest' },
  { from:'inttest', to:'e2e' },
  { from:'e2e', to:'edge' },
  { from:'edge', to:'perf' },
  { from:'perf', to:'accept' },
  { from:'unit', to:'perf', curved:true, curveOff:-7 },
  { from:'accept', to:'stage' },
  { from:'perf', to:'monitor', curved:true, curveOff:-5 },
  { from:'stage', to:'deploy' },
  { from:'deploy', to:'monitor' },
  { from:'monitor', to:'incident' },
  { from:'incident', to:'iterate' },
  { from:'iterate', to:'brief', label:'feedback', curved:true, curveOff:14 },
  { from:'edge', to:'backend', label:'fix-loop', curved:true, curveOff:-12 },
  { from:'incident', to:'deploy', label:'rollback', curved:true, curveOff:6 },
];

// ─── Helpers ──────────────────────────────────────────────────────────

const nMap = new Map(N.map((n) => [n.id, n]));

function connectedTo(nodeId: string): Set<string> {
  const s = new Set<string>();
  for (const e of E) { if (e.from === nodeId) s.add(e.to); if (e.to === nodeId) s.add(e.from); }
  return s;
}

function edgeTouches(edge: WEdge, nodeId: string): boolean {
  return edge.from === nodeId || edge.to === nodeId;
}

function ePath(e: WEdge): string {
  const a = nMap.get(e.from)!;
  const b = nMap.get(e.to)!;
  if (e.label === 'feedback') return `M ${a.x} ${a.y} C ${a.x} ${a.y+22}, ${b.x} ${b.y+22}, ${b.x} ${b.y}`;
  if (e.label === 'fix-loop') return `M ${a.x} ${a.y} C ${a.x} ${a.y-16}, ${b.x} ${b.y-16}, ${b.x} ${b.y}`;
  if (e.label === 'rollback') return `M ${a.x} ${a.y} C ${a.x+6} ${a.y+8}, ${b.x+6} ${b.y-4}, ${b.x} ${b.y}`;
  if (e.curved) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, off = e.curveOff ?? 6;
    return `M ${a.x} ${a.y} Q ${mx} ${my + off}, ${b.x} ${b.y}`;
  }
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}

const NW = 13, NH = 9, DR = 7, CYR = 1.3;

// ─── Component ────────────────────────────────────────────────────────

export default function WorkflowWireframe() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-40px' });
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const connIds = useMemo(() => hovered ? connectedTo(hovered) : new Set<string>(), [hovered]);

  const shapeOf = (k: WNode['kind']) => {
    switch (k) { case 'term': return 'stadium'; case 'decision': return 'diamond'; case 'data': return 'cylinder'; case 'io': return 'parallelogram'; default: return 'rect'; }
  };

  const selectedNode = selected ? N.find((n) => n.id === selected) : null;

  return (
    <section id="workflow" ref={sectionRef} className="py-20 md:py-28 border-t border-hairline" aria-label="Engineering workflow">
      <div className="max-w-6xl mx-auto px-6">
        <SectionReveal>
          <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-charcoal tracking-tight mb-4">Engineering Workflow</h2>
          <p className="text-sm text-stone max-w-xl mb-4">
            Interactive architecture diagram — hover to trace paths, click any node to explore its detail panel.
          </p>
          <div className="flex flex-wrap gap-3 mb-10 text-[10px] text-taupe uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm border border-taupe/40" />Process</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full border border-taupe/40" />Terminal</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rotate-45 border border-taupe/40" />Decision</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm border border-taupe/40 border-b-0" />Data</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-2 border border-taupe/40 skew-x-6" />I/O</span>
            <span className="flex items-center gap-1.5 ml-2"><Icon icon="solar:cursor-linear" width={12} className="text-taupe/60" />Click node for detail</span>
          </div>
        </SectionReveal>

        <SectionReveal delay={0.1}>
          <div className="relative overflow-x-auto">
            <svg viewBox="-3 -8 100 120" className="w-full h-auto min-w-[700px]" style={{ minHeight: 480 }} aria-hidden="true">
              {/* Grid */}
              {Array.from({ length: 21 }, (_, i) => (
                <line key={`vg${i}`} x1={i*5-3} y1={-8} x2={i*5-3} y2={112} stroke="#e8e4df" strokeWidth={0.06} />
              ))}
              {Array.from({ length: 25 }, (_, i) => (
                <line key={`hg${i}`} x1={-3} y1={i*5-8} x2={97} y2={i*5-8} stroke="#e8e4df" strokeWidth={0.06} />
              ))}

              {/* Phase columns */}
              {PHASES.map((p) => (
                <g key={p.id}>
                  <rect x={p.x - 8} y={-7} width={16} height={118} rx={1} fill="#2c2c2c" fillOpacity={0.012} />
                  <line x1={p.x} y1={-5} x2={p.x} y2={110} stroke="#e8e4df" strokeWidth={0.15} strokeDasharray="1.2 0.8" />
                  <text x={p.x} y={-5.5} textAnchor="middle" fill="#8a8580" fontSize={2} fontFamily="Public Sans, system-ui, sans-serif" fontWeight={600} letterSpacing="0.1">
                    {p.label.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* Edges */}
              {E.map((edge, i) => {
                const active = hovered ? edgeTouches(edge, hovered) : false;
                const dim = hovered && !active;
                const path = ePath(edge);
                const isFeedback = edge.label === 'feedback' || edge.label === 'fix-loop' || edge.label === 'rollback';

                return (
                  <g key={`e${i}`}>
                    <motion.path
                      d={path} fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={isInView ? { pathLength: 1, opacity: dim ? 0.06 : active ? 0.75 : 0.15 } : {}}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.02, ease: [0.25, 0.1, 0.25, 1] }}
                      stroke={active ? '#3d3d3d' : '#c9c3bc'}
                      strokeWidth={active ? 0.6 : 0.22}
                      strokeDasharray={isFeedback ? '1.5 0.8' : dim ? '0.4 0.4' : undefined}
                    />
                    {active && (
                      <motion.circle r={0.45} fill="#3d3d3d" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ duration: 0.15 }}>
                        <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
                      </motion.circle>
                    )}
                    {isFeedback && edge.label && (
                      <text
                        x={(nMap.get(edge.from)!.x + nMap.get(edge.to)!.x) / 2 + (edge.curveOff ?? 0) * 0.3}
                        y={(nMap.get(edge.from)!.y + nMap.get(edge.to)!.y) / 2 + (edge.curveOff ?? 0) * 0.6}
                        textAnchor="middle" fill="#8a8580" fillOpacity={active ? 0.6 : 0.2}
                        fontSize={1.4} fontFamily="Public Sans, system-ui, sans-serif" fontStyle="italic" letterSpacing="0.03"
                      >{edge.label}</text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {N.map((node, i) => {
                const isH = hovered === node.id;
                const isSel = selected === node.id;
                const isC = connIds.has(node.id);
                const dim = hovered && !isH && !isC;
                const shape = shapeOf(node.kind);
                const stroke = isH ? '#2c2c2c' : isSel ? '#3d3d3d' : isC ? '#6b6b6b' : dim ? '#e8e4df' : '#c9c3bc';
                const sw = isH ? 0.8 : isSel ? 0.7 : isC ? 0.45 : 0.22;
                const fill = isH ? '#f3f1ed' : isSel ? '#eee9e3' : '#faf9f6';

                return (
                  <g key={node.id}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(selected === node.id ? null : node.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <motion.g
                      initial={{ opacity: 0, scale: 0.75 }}
                      animate={isInView ? { opacity: dim ? 0.18 : 1, scale: 1 } : {}}
                      transition={{ duration: 0.35, delay: 0.05 + i * 0.02, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      {shape === 'rect' && <rect x={node.x-NW/2} y={node.y-NH/2} width={NW} height={NH} rx={1.2} ry={1.2} fill={fill} stroke={stroke} strokeWidth={sw} />}
                      {shape === 'stadium' && <rect x={node.x-NW/2} y={node.y-NH/2} width={NW} height={NH} rx={NH/2} ry={NH/2} fill={fill} stroke={stroke} strokeWidth={sw} />}
                      {shape === 'diamond' && <polygon points={`${node.x},${node.y-DR} ${node.x+DR},${node.y} ${node.x},${node.y+DR} ${node.x-DR},${node.y}`} fill={fill} stroke={stroke} strokeWidth={sw} />}
                      {shape === 'cylinder' && (
                        <>
                          <ellipse cx={node.x} cy={node.y-NH/2+CYR} rx={NW/2} ry={CYR} fill={isH ? '#eee9e3' : '#f3f1ed'} stroke={stroke} strokeWidth={sw} />
                          <rect x={node.x-NW/2} y={node.y-NH/2+CYR} width={NW} height={NH-2*CYR} fill={fill} stroke="none" />
                          <line x1={node.x-NW/2} y1={node.y-NH/2+CYR} x2={node.x-NW/2} y2={node.y+NH/2-CYR} stroke={stroke} strokeWidth={sw} />
                          <line x1={node.x+NW/2} y1={node.y-NH/2+CYR} x2={node.x+NW/2} y2={node.y+NH/2-CYR} stroke={stroke} strokeWidth={sw} />
                          <ellipse cx={node.x} cy={node.y+NH/2-CYR} rx={NW/2} ry={CYR} fill={fill} stroke={stroke} strokeWidth={sw} />
                        </>
                      )}
                      {shape === 'parallelogram' && (
                        <polygon points={`${node.x-NW/2+1.5},${node.y-NH/2} ${node.x+NW/2+1.5},${node.y-NH/2} ${node.x+NW/2-1.5},${node.y+NH/2} ${node.x-NW/2-1.5},${node.y+NH/2}`} fill={fill} stroke={stroke} strokeWidth={sw} />
                      )}

                      {/* Hover glow */}
                      {(isH || isSel) && <rect x={node.x-NW/2-1} y={node.y-NH/2-1} width={NW+2} height={NH+2} rx={2} fill="none" stroke="#2c2c2c" strokeWidth={0.15} strokeOpacity={0.15} />}

                      {/* "..." popup indicator (Vexlio style) */}
                      <text x={node.x + NW/2 - 1.5} y={node.y - NH/2 + 2.2} fill={isH || isSel ? '#2c2c2c' : '#8a8580'} fillOpacity={isH || isSel ? 0.6 : 0.3} fontSize={2} fontFamily="Public Sans, system-ui, sans-serif" fontWeight={700}>...</text>

                      {/* Label */}
                      <text x={node.x} y={node.y - 0.5} textAnchor="middle" dominantBaseline="central"
                        fill={isH ? '#2c2c2c' : dim ? '#e8e4df' : '#6b6b6b'}
                        fontSize={isH ? 2.5 : 2.2} fontFamily="Public Sans, system-ui, sans-serif"
                        fontWeight={isH ? 700 : 500} letterSpacing="0.03"
                      >{node.label}</text>
                      <text x={node.x} y={node.y + 2.2} textAnchor="middle" dominantBaseline="central"
                        fill={isH ? '#8a8580' : dim ? '#e8e4df' : '#b0aba5'}
                        fontSize={1.5} fontFamily="Public Sans, system-ui, sans-serif" fontWeight={400} letterSpacing="0.02"
                      >{node.sub}</text>
                    </motion.g>
                  </g>
                );
              })}
            </svg>

            {/* Hover trace info */}
            <AnimatePresence>
              {hovered && !selected && (
                <motion.div key={`h-${hovered}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.2 }} className="mt-4">
                  <p className="text-xs text-taupe">
                    <span className="font-medium text-charcoal">{N.find((n) => n.id === hovered)?.label}</span>
                    {' · '}{connIds.size} connection{connIds.size !== 1 ? 's' : ''}
                    {' · Click to open detail panel'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Vexlio-style popup detail panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, y: 16, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 16, height: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-8 border border-hairline rounded-xl bg-ivory-deep overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[10px] text-taupe uppercase tracking-[0.2em] mb-1">
                        {PHASES[selectedNode.phase].label} · {selectedNode.kind === 'proc' ? 'Process' : selectedNode.kind === 'decision' ? 'Decision' : selectedNode.kind === 'term' ? 'Terminal' : selectedNode.kind === 'data' ? 'Data Store' : 'I/O'}
                      </p>
                      <h3 className="text-xl font-semibold text-charcoal tracking-tight">
                        {selectedNode.popup.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="p-2 text-taupe hover:text-charcoal transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Close detail panel"
                    >
                      <Icon icon="solar:close-circle-linear" width={20} />
                    </button>
                  </div>

                  {/* Detail items grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {selectedNode.popup.items.map((item) => (
                      <div key={item.label} className="p-3 rounded-lg border border-hairline bg-ivory">
                        <p className="text-[10px] text-taupe uppercase tracking-wider mb-0.5">{item.label}</p>
                        <p className="text-sm text-charcoal font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Note */}
                  <div className="flex items-start gap-3 pt-4 border-t border-hairline">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-charcoal flex-shrink-0" />
                    <p className="text-sm text-stone leading-relaxed">{selectedNode.popup.note}</p>
                  </div>

                  {/* Connections */}
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <p className="text-[10px] text-taupe uppercase tracking-wider mb-2">
                      Connected to {connectedTo(selectedNode.id).size} node{connectedTo(selectedNode.id).size !== 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...connectedTo(selectedNode.id)].map((id) => {
                        const cn = N.find((n) => n.id === id);
                        return cn ? (
                          <button
                            key={id}
                            onClick={() => setSelected(id)}
                            className="px-2.5 py-1 text-xs font-medium text-charcoal bg-ivory border border-hairline rounded-md hover:border-taupe transition-colors"
                          >
                            {cn.label}
                          </button>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SectionReveal>
      </div>
    </section>
  );
}
