import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shuffle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────────────────────
const ROULETTE_COLORS = [
  '#FF6384', '#FF9F40', '#FFCD56', '#4BC0C0',
  '#36A2EB', '#9966FF', '#C9CBCF', '#71B37C',
  '#517FA4', '#852b99', '#E74C3C', '#2ECC71',
];

type Phase = 'setup' | 'spinning' | 'result';

interface SpinParams {
  startAngle: number;
  totalRotation: number;
  startTime: number;
  duration: number;
  winIdx: number;
}

// ── Audio ─────────────────────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return _audioCtx;
  } catch { return null; }
}
function playTick(fast = false) {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle'; osc.frequency.value = fast ? 1200 : 800;
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.07);
  } catch { /* ignore */ }
}
function playFanfare() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.start(t); osc.stop(t + 0.4);
    });
  } catch { /* ignore */ }
}
/** 😜 야바위 결과 - 유저 놀리기 */
function playTeaseTune() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    // "엥~↗ 뚝" — 올라갔다 뚝 떨어지는 효과
    const notes = [
      { freq: 880,  t: 0,    dur: 0.12 },
      { freq: 1047, t: 0.14, dur: 0.12 },
      { freq: 330,  t: 0.30, dur: 0.4  },
    ];
    notes.forEach(({ freq, t, dur }) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square'; osc.frequency.value = freq;
      const s = ctx.currentTime + t;
      gain.gain.setValueAtTime(0.15, s);
      gain.gain.exponentialRampToValueAtTime(0.001, s + dur);
      osc.start(s); osc.stop(s + dur + 0.02);
    });
  } catch { /* ignore */ }
}

function playYabawiActivate() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.46);
  } catch { /* ignore */ }
}

// ── Yabaui target — invisible to the user ────────────────────────────────────
function calcYabawiTarget(items: string[], sliceAngle: number): { winIdx: number; targetAngle: number } {
  const n = items.length;
  const prizeIndices: number[] = [];
  items.forEach((item, i) => { if (item.includes('상')) prizeIndices.push(i); });
  const prizeSet = new Set(prizeIndices);
  const nonPrize = items.map((_, i) => i).filter(i => !prizeSet.has(i));
  if (nonPrize.length === 0) {
    const winIdx = Math.floor(Math.random() * n);
    return { winIdx, targetAngle: -(winIdx + 0.5) * sliceAngle };
  }
  type Cand = { winIdx: number; targetAngle: number };
  const candidates: Cand[] = [];
  for (const prizeIdx of prizeIndices) {
    const danger = (2 + Math.random() * 7) * (Math.PI / 180);
    const before = (prizeIdx - 1 + n) % n;
    if (!prizeSet.has(before)) candidates.push({ winIdx: before, targetAngle: -prizeIdx * sliceAngle + danger });
    const after = (prizeIdx + 1) % n;
    if (!prizeSet.has(after)) candidates.push({ winIdx: after, targetAngle: -(prizeIdx + 1) * sliceAngle - danger });
  }
  if (candidates.length === 0) {
    const winIdx = nonPrize[Math.floor(Math.random() * nonPrize.length)];
    return { winIdx, targetAngle: -(winIdx + 0.5) * sliceAngle };
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function RouletteGame() {
  const [items, setItems]             = useState<string[]>(['설거지', '청소', '꽝', '상금 5000원', '심부름']);
  const [phase, setPhase]             = useState<Phase>('setup');
  const [result, setResult]           = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [yabawiMode, setYabawiMode]   = useState(false);

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef       = useRef<HTMLDivElement>(null);

  const wheelAngleRef        = useRef(0);
  const animIdRef            = useRef<number | null>(null);
  const pinBounceRef         = useRef<{ startTime: number; direction: number; duration: number } | null>(null);
  const lastBoundaryCountRef = useRef(0);
  const yabawiModeRef        = useRef(false);
  const spinParamsRef        = useRef<SpinParams | null>(null);

  const addItem    = useCallback(() => setItems(prev => [...prev, '']), []);
  const removeItem = useCallback((i: number) => {
    setItems(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));
  }, []);

  // ── Draw (no visual difference in yabaui mode) ────────────────────────────
  const drawWheel = useCallback((angle: number, highlightIdx: number | null) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const size = canvas.width; if (size === 0) return;
    const cx = size / 2, cy = size / 2;
    const radius = size / 2 - 8;
    const n = items.length; if (n === 0) return;
    const sliceAngle = (Math.PI * 2) / n;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fill();

    for (let i = 0; i < n; i++) {
      const startA    = angle + i * sliceAngle - Math.PI / 2;
      const endA      = startA + sliceAngle;
      const midA      = startA + sliceAngle / 2;
      const baseColor = ROULETTE_COLORS[i % ROULETTE_COLORS.length];
      const isWinner  = highlightIdx === i;
      const dimmed    = highlightIdx !== null && !isWinner;

      const gx   = cx + Math.cos(midA) * radius * 0.35;
      const gy   = cy + Math.sin(midA) * radius * 0.35;
      const grad = ctx.createRadialGradient(gx, gy, 0, cx, cy, radius);
      if (isWinner) {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, baseColor + 'ee');
        grad.addColorStop(1, baseColor + 'bb');
      } else {
        grad.addColorStop(0, 'rgba(255,255,255,0.18)');
        grad.addColorStop(0.5, baseColor + (dimmed ? '88' : 'dd'));
        grad.addColorStop(1, baseColor + (dimmed ? '55' : 'aa'));
      }

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startA, endA);
      ctx.closePath();
      if (isWinner) { ctx.shadowColor = baseColor; ctx.shadowBlur = 22; }
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isWinner ? '#ffffff' : 'rgba(255,255,255,0.85)';
      ctx.lineWidth   = isWinner ? 3.5 : 1.5;
      ctx.stroke();

      // Text
      const label    = items[i] || '?';
      const textR    = radius * 0.63;
      const fontSize = Math.max(9, Math.min(14, radius * 0.17));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midA + Math.PI / 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 4;
      ctx.fillText(label, 0, -textR, radius * 0.52);
      ctx.restore();
    }

    // Metallic rim
    const rimGrad = ctx.createLinearGradient(0, 0, size, size);
    rimGrad.addColorStop(0,    'rgba(255,255,255,0.75)');
    rimGrad.addColorStop(0.35, 'rgba(220,220,220,0.45)');
    rimGrad.addColorStop(0.7,  'rgba(140,140,140,0.5)');
    rimGrad.addColorStop(1,    'rgba(80,80,80,0.6)');
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = rimGrad; ctx.lineWidth = 9; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.22)'; ctx.lineWidth = 2; ctx.stroke();

    // Center hub
    const hubGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 22);
    hubGrad.addColorStop(0, '#ffffff'); hubGrad.addColorStop(0.5, '#e0e0e0'); hubGrad.addColorStop(1, '#aaaaaa');
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad; ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 10;
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#777'; ctx.fill();
  }, [items]);

  useEffect(() => {
    const container = containerRef.current; const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const size = Math.min(container.clientWidth, 400);
      canvas.width = canvas.height = size;
      drawWheel(wheelAngleRef.current, winnerIndex);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawWheel, winnerIndex]);

  useEffect(() => { drawWheel(wheelAngleRef.current, winnerIndex); }, [items, winnerIndex, drawWheel, yabawiMode]);
  useEffect(() => { return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); }; }, []);

  // ── Spin / Yabaui ─────────────────────────────────────────────────────────
  const handleSpin = useCallback(() => {
    // Second click while spinning → yabaui mode (silent, invisible)
    if (phase === 'spinning') {
      if (yabawiModeRef.current) return;
      const prizeItems = items.filter(it => it.includes('상'));
      if (prizeItems.length === 0) return;
      yabawiModeRef.current = true;
      setYabawiMode(true);
      playYabawiActivate();
      const n = items.length;
      const sliceAngle = (Math.PI * 2) / n;
      const curAngle = wheelAngleRef.current;
      const { winIdx, targetAngle } = calcYabawiTarget(items, sliceAngle);
      let newTotal = targetAngle - curAngle;
      while (newTotal < 2 * 2 * Math.PI) newTotal += 2 * Math.PI;
      lastBoundaryCountRef.current = Math.floor((curAngle + Math.PI / 2) / sliceAngle);
      spinParamsRef.current = { startAngle: curAngle, totalRotation: newTotal, startTime: performance.now(), duration: 3200 + Math.random() * 900, winIdx };
      return;
    }

    // Normal spin
    const validItems = items.filter(i => i.trim());
    if (validItems.length < 2) { toast.error('항목을 2개 이상 입력해주세요!'); return; }
    if (items.some(i => !i.trim())) { toast.error('모든 항목을 입력해주세요!'); return; }

    const n = items.length;
    const sliceAngle = (Math.PI * 2) / n;
    const winIdx = Math.floor(Math.random() * n);
    const exactTarget = -(winIdx + 0.5) * sliceAngle;
    const marginRad = (5 + Math.random() * 10) * (Math.PI / 180);
    const maxOffset = sliceAngle / 2 - marginRad;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const targetAngle = exactTarget + direction * maxOffset * (0.6 + Math.random() * 0.4);

    const startAngle = wheelAngleRef.current;
    let totalRotation = targetAngle - startAngle;
    while (totalRotation < 5 * 2 * Math.PI) totalRotation += 2 * Math.PI;
    const duration = 5000 + Math.random() * 2000;

    lastBoundaryCountRef.current = Math.floor((startAngle + Math.PI / 2) / sliceAngle);
    spinParamsRef.current = { startAngle, totalRotation, startTime: performance.now(), duration, winIdx };
    setPhase('spinning'); setResult(null); setWinnerIndex(null);

    const draw = drawWheel;
    const animate = (now: number) => {
      const params = spinParamsRef.current!;
      const elapsed = now - params.startTime;
      const progress = Math.min(elapsed / params.duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const angle = params.startAngle + params.totalRotation * easeOut;
      wheelAngleRef.current = angle;

      const sl = (Math.PI * 2) / n;
      const bCount = Math.floor((angle + Math.PI / 2) / sl);
      if (bCount !== lastBoundaryCountRef.current) {
        lastBoundaryCountRef.current = bCount;
        const angVel = (params.totalRotation * 3 * Math.pow(1 - progress, 2)) / (params.duration / 1000);
        pinBounceRef.current = { startTime: now, direction: Math.random() < 0.5 ? 1 : -1, duration: Math.max(80, Math.min(450, 600 / (1 + angVel * 4))) };
        playTick(angVel > 5);
      }
      if (pinRef.current) {
        if (pinBounceRef.current) {
          const { startTime: bs, direction: dir, duration: bd } = pinBounceRef.current;
          const t = (now - bs) / bd;
          if (t < 1) {
            pinRef.current.style.transform = `rotate(${dir * 16 * Math.sin(t * Math.PI) * (1 - t * 0.35)}deg)`;
          } else { pinBounceRef.current = null; pinRef.current.style.transform = 'rotate(0deg)'; }
        } else { pinRef.current.style.transform = 'rotate(0deg)'; }
      }
      draw(angle, null);

      if (progress < 1) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        const finalAngle = params.startAngle + params.totalRotation;
        wheelAngleRef.current = finalAngle;
        draw(finalAngle, params.winIdx);
        if (pinRef.current) pinRef.current.style.transform = 'rotate(0deg)';
        setWinnerIndex(params.winIdx);
        setResult(items[params.winIdx]);
        setPhase('result');
        animIdRef.current = null;
        yabawiModeRef.current ? playTeaseTune() : playFanfare();
      }
    };
    animIdRef.current = requestAnimationFrame(animate);
  }, [items, phase, drawWheel]);

  const handleReset = useCallback(() => {
    if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }
    yabawiModeRef.current = false;
    setYabawiMode(false);
    setResult(null); setWinnerIndex(null); setPhase('setup');
    spinParamsRef.current = null;
    drawWheel(wheelAngleRef.current, null);
  }, [drawWheel]);

  const winColor = winnerIndex !== null ? ROULETTE_COLORS[winnerIndex % ROULETTE_COLORS.length] : '#FF6384';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {phase !== 'spinning' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">룰렛 항목</h3>
            {phase === 'setup' && <Button size="sm" variant="outline" onClick={addItem}>+ 항목 추가</Button>}
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: ROULETTE_COLORS[idx % ROULETTE_COLORS.length] }} />
                {phase === 'result' ? (
                  <div className="flex-1 h-8 text-sm flex items-center px-3 rounded border"
                    style={{ borderColor: winnerIndex === idx ? winColor : 'transparent', fontWeight: winnerIndex === idx ? 700 : 400, color: winnerIndex === idx ? winColor : undefined }}>
                    {item}
                  </div>
                ) : (
                  <Input value={item}
                    onChange={e => { const next = [...items]; next[idx] = e.target.value; setItems(next); }}
                    placeholder={`항목 ${idx + 1}`} className="h-8 text-sm" />
                )}
                {items.length > 2 && phase === 'setup' && (
                  <Button size="sm" variant="destructive" onClick={() => removeItem(idx)}>삭제</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={containerRef} className="relative flex justify-center" style={{ paddingTop: '34px' }}>
        <div className="absolute left-1/2 z-10" style={{ top: 0, transform: 'translateX(-50%)' }}>
          <div ref={pinRef} style={{ transformOrigin: '50% 8%', willChange: 'transform' }}>
            <svg width="26" height="34" viewBox="0 0 26 34" fill="none" style={{ display: 'block' }}>
              <polygon points="13,32 1,4 25,4" fill="rgba(0,0,0,0.25)" transform="translate(1,2)" />
              <polygon points="13,32 1,4 25,4" fill="#E53935" stroke="white" strokeWidth="2" strokeLinejoin="round" />
              <polygon points="13,16 7,6 13,8" fill="rgba(255,255,255,0.35)" />
            </svg>
          </div>
        </div>
        <canvas ref={canvasRef} style={{ borderRadius: '50%', display: 'block', boxShadow: '0 6px 28px rgba(0,0,0,0.3)' }} />
      </div>

      {phase === 'result' && result && (
        <div key={result} className="text-center py-5 rounded-xl border-2"
          style={{ backgroundColor: winColor + '18', borderColor: winColor, animation: 'rouletteResultIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
          <div className="text-3xl mb-1" style={{ display: 'inline-block', animation: 'resultBounce 0.6s ease infinite alternate' }}>🎉</div>
          <div className="text-xl font-bold" style={{ color: winColor }}>{result}</div>
          <div className="text-xs text-muted-foreground mt-1">당첨!</div>
        </div>
      )}

      {phase === 'setup' && (
        <Button className="w-full" size="lg" onClick={handleSpin}
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white' }}>
          <Shuffle className="w-5 h-5 mr-2" />룰렛 돌리기!
        </Button>
      )}
      {phase === 'spinning' && (
        <Button className="w-full" size="lg" onClick={handleSpin}
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', opacity: 0.78, cursor: 'default' }}>
          <span className="inline-block w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
          돌아가는 중...
        </Button>
      )}
      {phase === 'result' && (
        <Button className="w-full" size="lg" variant="outline" onClick={handleReset}>
          <RotateCcw className="w-5 h-5 mr-2" />다시 돌리기
        </Button>
      )}

      <style>{`
        @keyframes rouletteResultIn { from{opacity:0;transform:scale(0.82) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes resultBounce { from{transform:translateY(0) scale(1)} to{transform:translateY(-5px) scale(1.08)} }
      `}</style>
    </div>
  );
}
