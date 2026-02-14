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

// ── Component ─────────────────────────────────────────────────────────────────
export default function RouletteGame() {
  const [items, setItems] = useState<string[]>(['설거지', '청소', '꽝', '상금 5000원', '심부름']);
  const [phase, setPhase] = useState<Phase>('setup');
  const [result, setResult] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);

  // Canvas / animation refs
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef       = useRef<HTMLDivElement>(null);

  const wheelAngleRef         = useRef(0);
  const animIdRef             = useRef<number | null>(null);
  const pinBounceRef          = useRef<{
    startTime: number;
    direction: number;
    duration: number;
  } | null>(null);
  const lastBoundaryCountRef  = useRef(0);

  // ── Item helpers ──────────────────────────────────────────────────────────
  const addItem = useCallback(() => setItems(prev => [...prev, '']), []);

  const removeItem = useCallback((i: number) => {
    setItems(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const drawWheel = useCallback(
    (angle: number, highlightIdx: number | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = canvas.width;
      if (size === 0) return;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 6;
      const n = items.length;
      if (n === 0) return;

      const sliceAngle = (Math.PI * 2) / n;
      ctx.clearRect(0, 0, size, size);

      // ── Sectors ──
      for (let i = 0; i < n; i++) {
        const startA = angle + i * sliceAngle - Math.PI / 2;
        const endA   = startA + sliceAngle;
        const color  = ROULETTE_COLORS[i % ROULETTE_COLORS.length];
        const isWinner = highlightIdx === i;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startA, endA);
        ctx.closePath();

        if (isWinner) {
          ctx.fillStyle   = color;
          ctx.shadowColor = color;
          ctx.shadowBlur  = 24;
          ctx.fill();
          ctx.shadowBlur  = 0;
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth   = 4;
          ctx.stroke();
        } else {
          // Dim non-winners when result is shown
          ctx.fillStyle   = highlightIdx !== null ? color + '99' : color;
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.85)';
          ctx.lineWidth   = 2;
          ctx.stroke();
        }

        // ── Text ──
        const midA  = startA + sliceAngle / 2;
        const textR = radius * 0.64;

        ctx.save();
        ctx.translate(cx, cy);
        // Rotate so text is perpendicular to radius (tangential), pointing "up" relative to sector center
        ctx.rotate(midA + Math.PI / 2);
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        const fontSize = Math.max(9, Math.min(14, radius * 0.17));
        ctx.font        = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle   = 'white';
        ctx.shadowColor = 'rgba(0,0,0,0.75)';
        ctx.shadowBlur  = 3;
        const label = items[i] || '?';
        ctx.fillText(label, 0, -textR, radius * 0.52);
        ctx.restore();
      }

      // ── Outer ring ──
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth   = 5;
      ctx.stroke();

      // ── Center circle ──
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle   = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth   = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#777';
      ctx.fill();
    },
    [items],
  );

  // ── Canvas resize observer ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const size    = Math.min(container.clientWidth, 400);
      canvas.width  = size;
      canvas.height = size;
      drawWheel(wheelAngleRef.current, winnerIndex);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, [drawWheel, winnerIndex]);

  // Redraw when items or winner changes
  useEffect(() => {
    drawWheel(wheelAngleRef.current, winnerIndex);
  }, [items, winnerIndex, drawWheel]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, []);

  // ── Spin ──────────────────────────────────────────────────────────────────
  const handleSpin = useCallback(() => {
    const validItems = items.filter(i => i.trim());
    if (validItems.length < 2) {
      toast.error('항목을 2개 이상 입력해주세요!');
      return;
    }
    if (items.some(i => !i.trim())) {
      toast.error('모든 항목을 입력해주세요!');
      return;
    }

    const n          = items.length;
    const sliceAngle = (Math.PI * 2) / n;
    const winIdx     = Math.floor(Math.random() * n);
    const winnerItem = items[winIdx];

    // ── Target angle calculation ──
    // Pointer is at the top (−π/2 in canvas coords).
    // Sector i spans: [angle + i*slice − π/2 , angle + (i+1)*slice − π/2]
    // For sector winIdx center to sit at the pointer:
    //   angle + (winIdx + 0.5) * slice − π/2  ≡ −π/2  (mod 2π)
    //   ⟹  angle = −(winIdx + 0.5) * slice  (mod 2π)
    const exactTarget = -(winIdx + 0.5) * sliceAngle;

    // Close-call effect: offset within (60–100)% of max, so it lands near a boundary
    const marginRad   = (5 + Math.random() * 10) * (Math.PI / 180); // 5–15° from edge
    const maxOffset   = sliceAngle / 2 - marginRad;
    const direction   = Math.random() < 0.5 ? 1 : -1;
    const offset      = direction * maxOffset * (0.6 + Math.random() * 0.4);
    const targetAngle = exactTarget + offset;

    const startAngle    = wheelAngleRef.current;
    const minRevolutions = 5 * 2 * Math.PI; // at least 5 full spins

    let totalRotation = targetAngle - startAngle;
    while (totalRotation < minRevolutions) totalRotation += 2 * Math.PI;

    const duration  = 5000 + Math.random() * 2000; // 5–7 s
    const startTime = performance.now();

    lastBoundaryCountRef.current = Math.floor(
      (startAngle + Math.PI / 2) / sliceAngle,
    );

    setPhase('spinning');
    setResult(null);
    setWinnerIndex(null);

    // Snapshot draw function (stable for this spin)
    const draw = drawWheel;

    const animate = (now: number) => {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const easeOut  = 1 - Math.pow(1 - progress, 3);
      const angle    = startAngle + totalRotation * easeOut;

      wheelAngleRef.current = angle;

      // ── Boundary detection (pin tick) ──
      const boundaryCount = Math.floor((angle + Math.PI / 2) / sliceAngle);
      if (boundaryCount !== lastBoundaryCountRef.current) {
        lastBoundaryCountRef.current = boundaryCount;

        // Approx angular velocity: derivative of easeOut * totalRotation / duration
        const angVel = (totalRotation * 3 * Math.pow(1 - progress, 2)) / (duration / 1000);
        // Fast spin → short bounce; slow spin → longer bounce
        const bounceDur = Math.max(80, Math.min(450, 600 / (1 + angVel * 4)));

        pinBounceRef.current = {
          startTime : now,
          direction : Math.random() < 0.5 ? 1 : -1,
          duration  : bounceDur,
        };
      }

      // ── Update pin rotation ──
      if (pinRef.current) {
        if (pinBounceRef.current) {
          const { startTime: bs, direction, duration: bd } = pinBounceRef.current;
          const t = (now - bs) / bd;
          if (t < 1) {
            // Damped oscillation: goes to one side then back
            const a = direction * 16 * Math.sin(t * Math.PI) * (1 - t * 0.35);
            pinRef.current.style.transform = `rotate(${a}deg)`;
          } else {
            pinBounceRef.current = null;
            pinRef.current.style.transform = 'rotate(0deg)';
          }
        } else {
          pinRef.current.style.transform = 'rotate(0deg)';
        }
      }

      draw(angle, null);

      if (progress < 1) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        // ── Spin complete ──
        const finalAngle = startAngle + totalRotation;
        wheelAngleRef.current = finalAngle;
        draw(finalAngle, winIdx);
        if (pinRef.current) pinRef.current.style.transform = 'rotate(0deg)';
        setWinnerIndex(winIdx);
        setResult(winnerItem);
        setPhase('result');
        animIdRef.current = null;
      }
    };

    animIdRef.current = requestAnimationFrame(animate);
  }, [items, drawWheel]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }
    setResult(null);
    setWinnerIndex(null);
    setPhase('setup');
    drawWheel(wheelAngleRef.current, null);
  }, [drawWheel]);

  const winColor =
    winnerIndex !== null
      ? ROULETTE_COLORS[winnerIndex % ROULETTE_COLORS.length]
      : '#FF6384';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Item list – visible in setup & result phases */}
      {phase !== 'spinning' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">룰렛 항목</h3>
            <Button size="sm" variant="outline" onClick={addItem}>
              + 항목 추가
            </Button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor:
                      ROULETTE_COLORS[idx % ROULETTE_COLORS.length],
                  }}
                />
                <Input
                  value={item}
                  onChange={e => {
                    const next = [...items];
                    next[idx] = e.target.value;
                    setItems(next);
                  }}
                  placeholder={`항목 ${idx + 1}`}
                  className="h-8 text-sm"
                />
                {items.length > 2 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeItem(idx)}
                  >
                    삭제
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roulette wheel area */}
      {/*
        paddingTop creates space for the pin that sits above the canvas.
        The pin SVG is 32px tall; its tip (bottom vertex) aligns with the
        canvas top edge (wheel rim).
      */}
      <div
        ref={containerRef}
        className="relative flex justify-center"
        style={{ paddingTop: '34px' }}
      >
        {/* ── Pointer / Ticker pin ── */}
        <div
          className="absolute left-1/2 z-10"
          style={{ top: 0, transform: 'translateX(-50%)' }}
        >
          <div
            ref={pinRef}
            style={{
              transformOrigin: '50% 8%',
              willChange: 'transform',
              // no CSS transition – JS updates every rAF frame
            }}
          >
            {/* Downward-pointing triangle: tip at bottom center */}
            <svg
              width="26"
              height="34"
              viewBox="0 0 26 34"
              fill="none"
              style={{ display: 'block' }}
            >
              {/* Shadow */}
              <polygon
                points="13,32 1,4 25,4"
                fill="rgba(0,0,0,0.25)"
                transform="translate(1,2)"
              />
              {/* Pin body */}
              <polygon
                points="13,32 1,4 25,4"
                fill="#E53935"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Highlight */}
              <polygon
                points="13,16 7,6 13,8"
                fill="rgba(255,255,255,0.35)"
              />
            </svg>
          </div>
        </div>

        {/* ── Canvas ── */}
        <canvas
          ref={canvasRef}
          style={{
            borderRadius: '50%',
            boxShadow: '0 6px 28px rgba(0,0,0,0.28)',
            display: 'block',
          }}
        />
      </div>

      {/* Result banner */}
      {phase === 'result' && result && (
        <div
          key={result}
          className="text-center py-5 rounded-xl border-2"
          style={{
            backgroundColor: winColor + '18',
            borderColor: winColor,
            animation: 'rouletteResultIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) both',
          }}
        >
          <div className="text-3xl mb-1">🎉</div>
          <div className="text-xl font-bold" style={{ color: winColor }}>
            {result}
          </div>
          <div className="text-xs text-muted-foreground mt-1">당첨!</div>
        </div>
      )}

      {/* Action buttons */}
      {phase === 'setup' && (
        <Button className="w-full" size="lg" onClick={handleSpin}>
          <Shuffle className="w-5 h-5 mr-2" />
          룰렛 돌리기!
        </Button>
      )}
      {phase === 'spinning' && (
        <Button className="w-full" size="lg" disabled>
          <span className="inline-block w-4 h-4 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
          돌아가는 중...
        </Button>
      )}
      {phase === 'result' && (
        <Button
          className="w-full"
          size="lg"
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          다시 돌리기
        </Button>
      )}

      {/* Keyframe for result banner entrance */}
      <style>{`
        @keyframes rouletteResultIn {
          from { opacity: 0; transform: scale(0.85) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}
