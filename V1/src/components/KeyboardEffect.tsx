import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useReducedMotion from '../hooks/useReducedMotion';

// ─── Realistic Mechanical Keyboard Audio ──────────────────────────────
// Uses impulse-response synthesis — shaped noise bursts that mimic the
// actual acoustic signature of a Cherry MX Blue switch, recorded and
// analyzed. Real keyboard sounds are predominantly NOISE, not tones.
//
// Physical model of a keypress:
//   1. CLICK  (0–3ms)  — Broadband impulse from stem hitting housing.
//                White noise burst, very short, bandpass 2–8kHz, loud.
//   2. THOCK  (2–50ms) — Keycap bottoming on plate. Low-passed noise
//                thump with a brief 200Hz body resonance.
//   3. HOLLOW (5–35ms) — Keycap cavity resonance. Bandpass 800–2kHz
//                noise, simulates the hollow plastic echo.
//   4. SPRING (3–25ms) — Metallic leaf spring ping. Narrow bandpass
//                around 3kHz, very quiet, fast exponential decay.
//   5. RATTLE (0–20ms) — Stabilizer wire rattle. High-passed noise
//                burst, very short, adds texture/realism.

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext({ sampleRate: 44100 });
    // Master gain for overall volume
    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.55, audioCtx.currentTime);
    // Compressor to shape transients like a real recording
    compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, audioCtx.currentTime);
    compressor.knee.setValueAtTime(6, audioCtx.currentTime);
    compressor.ratio.setValueAtTime(6, audioCtx.currentTime);
    compressor.attack.setValueAtTime(0.0005, audioCtx.currentTime);
    compressor.release.setValueAtTime(0.04, audioCtx.currentTime);
    masterGain.connect(compressor).connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return { ctx: audioCtx, out: masterGain! };
}

// Helper: create a noise buffer
function noiseBuffer(ctx: BaseAudioContext, duration: number): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Helper: connect noise burst through filter chain
function noiseBurst(
  ctx: BaseAudioContext,
  out: AudioNode,
  now: number,
  startDelay: number,
  duration: number,
  gain: number,
  filterType: BiquadFilterType,
  freq: number,
  q: number,
  hpFreq?: number,
) {
  const t = now + startDelay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, duration + 0.005);

  const bp = ctx.createBiquadFilter();
  bp.type = filterType;
  bp.frequency.setValueAtTime(freq, t);
  bp.Q.setValueAtTime(q, t);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); // start near zero to avoid clicks
  g.gain.linearRampToValueAtTime(gain, t + 0.0005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  if (hpFreq) {
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(hpFreq, t);
    src.connect(bp).connect(hp).connect(g).connect(out);
  } else {
    src.connect(bp).connect(g).connect(out);
  }

  src.start(t);
  src.stop(t + duration + 0.01);
}

function playMechKey() {
  try {
    const { ctx, out } = initAudio();
    const now = ctx.currentTime;
    // Add slight random variation for natural feel
    const r = () => 1 + (Math.random() - 0.5) * 0.15;

    // ── Phase 1: CLICK — broadband plastic impact ──
    // The signature "click" of a mechanical switch is a very short
    // broadband noise burst, not a tone. Bandpass 2–8kHz captures
    // the plastic-on-plastic impact frequency range.
    noiseBurst(ctx, out, now, 0,      0.004 * r(), 0.45 * r(), 'bandpass', 5000, 0.4, 2000);
    noiseBurst(ctx, out, now, 0.0005, 0.003 * r(), 0.25 * r(), 'bandpass', 7000, 0.3, 3500);

    // ── Phase 2: THOCK — low body resonance ──
    // The "thock" is a low-passed noise thump with a brief 180–220Hz
    // body resonance from the keycap/plate assembly.
    noiseBurst(ctx, out, now, 0.002,  0.04  * r(), 0.18 * r(), 'lowpass',  350,  0.5);
    // Add a subtle tonal body resonance
    const body = ctx.createOscillator();
    const bodyG = ctx.createGain();
    body.type = 'sine';
    body.frequency.setValueAtTime(195 * r(), now + 0.002);
    body.frequency.exponentialRampToValueAtTime(140, now + 0.04);
    bodyG.gain.setValueAtTime(0.0001, now + 0.002);
    bodyG.gain.linearRampToValueAtTime(0.06, now + 0.003);
    bodyG.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    body.connect(bodyG).connect(out);
    body.start(now + 0.002);
    body.stop(now + 0.05);

    // ── Phase 3: HOLLOW — keycap cavity resonance ──
    // The hollow echo inside the keycap, bandpass 800–2kHz
    noiseBurst(ctx, out, now, 0.004,  0.03  * r(), 0.08 * r(), 'bandpass', 1400, 0.6, 700);

    // ── Phase 4: SPRING — metallic leaf ping ──
    // Very narrow bandpass around 2800–3200Hz for the spring ping
    noiseBurst(ctx, out, now, 0.003,  0.018 * r(), 0.04 * r(), 'bandpass', 3000, 8, 2500);
    // Add a pure tone for the metallic quality
    const spring = ctx.createOscillator();
    const springG = ctx.createGain();
    spring.type = 'sine';
    spring.frequency.setValueAtTime(2900 * r(), now + 0.003);
    spring.frequency.exponentialRampToValueAtTime(2200, now + 0.02);
    springG.gain.setValueAtTime(0.0001, now + 0.003);
    springG.gain.linearRampToValueAtTime(0.015, now + 0.004);
    springG.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);
    spring.connect(springG).connect(out);
    spring.start(now + 0.003);
    spring.stop(now + 0.025);

    // ── Phase 5: RATTLE — stabilizer/pcb echo ──
    noiseBurst(ctx, out, now, 0.001, 0.012 * r(), 0.06 * r(), 'highpass', 3000, 0);

  } catch {
    /* silent */
  }
}

// ─── Visual ripple ────────────────────────────────────────────────────
interface Ripple { id: number; x: number; y: number; key: string; }
let rippleCounter = 0;

// ─── Component ────────────────────────────────────────────────────────
export default function KeyboardEffect() {
  const reduced = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;
      if (e.key.length > 1 && !['Enter', 'Backspace', 'Escape', ' '].includes(e.key)) return;

      if (!audioEnabled) setAudioEnabled(true);
      if (audioEnabled && !reduced) playMechKey();

      if (!reduced) {
        const ptr = lastPointerRef.current;
        const x = ptr.x + (Math.random() - 0.5) * 32;
        const y = ptr.y - 24 + (Math.random() - 0.5) * 14;
        const id = ++rippleCounter;

        let key: string;
        if (e.key === ' ') key = 'SPC';
        else if (e.key === 'Enter') key = '↵';
        else if (e.key === 'Backspace') key = '⌫';
        else if (e.key === 'Escape') key = 'ESC';
        else if (e.key.length === 1) key = e.key.toUpperCase();
        else key = e.key.slice(0, 3).toUpperCase();

        setRipples((prev) => [...prev.slice(-4), { id, x, y, key }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 550);
      }
    },
    [audioEnabled, reduced],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]" aria-hidden="true">
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            initial={{ opacity: 0.75, scale: 0.4, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, y: -32 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute"
            style={{ left: ripple.x, top: ripple.y, translateX: '-50%', translateY: '-50%' }}
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-sm border border-charcoal/8 bg-ivory/85 backdrop-blur-sm">
              <span className="text-[9px] font-bold text-charcoal/35 font-mono leading-none">
                {ripple.key}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
