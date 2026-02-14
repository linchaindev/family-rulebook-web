import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, RotateCw, Eye } from 'lucide-react';
import { FAMILY_MEMBERS } from '@/types/family';

// ── Constants ────────────────────────────────────────────────────────────────
const ROW_COUNT = 8;
const ANIM_DURATION = 1400; // ms
const PLAYER_COLORS = [
  '#E53935', '#1E88E5', '#43A047', '#FF8F00',
  '#8E24AA', '#00ACC1', '#E91E63', '#558B2F',
];

// ── Types ─────────────────────────────────────────────────────────────────────
type StepDirection = 'down' | 'left' | 'right' | 'end';
interface LadderStep { col: number; row: number; direction: StepDirection; }
type GamePhase = 'setup' | 'playing';

// ── Ladder Logic ──────────────────────────────────────────────────────────────
function generateRungs(n: number): boolean[][] {
  const rungs = Array.from({ length: n - 1 }, () =>
    Array<boolean>(ROW_COUNT).fill(false)
  );
  for (let row = 0; row < ROW_COUNT; row++) {
    let col = 0;
    while (col < n - 1) {
      if (Math.random() < 0.45) { rungs[col][row] = true; col += 2; }
      else col++;
    }
  }
  return rungs;
}

function calcPaths(rungs: boolean[][], n: number): number[] {
  return Array.from({ length: n }, (_, i) => {
    let pos = i;
    for (let row = 0; row < ROW_COUNT; row++) {
      if (pos < n - 1 && rungs[pos][row]) pos++;
      else if (pos > 0 && rungs[pos - 1][row]) pos--;
    }
    return pos;
  });
}

function getPath(idx: number, rungs: boolean[][], n: number): LadderStep[] {
  const steps: LadderStep[] = [];
  let pos = idx;
  steps.push({ col: pos, row: -1, direction: 'down' });
  for (let row = 0; row < ROW_COUNT; row++) {
    if (pos < n - 1 && rungs[pos][row]) {
      steps.push({ col: pos, row, direction: 'right' });
      pos++;
      steps.push({ col: pos, row, direction: 'down' });
    } else if (pos > 0 && rungs[pos - 1][row]) {
      steps.push({ col: pos, row, direction: 'left' });
      pos--;
      steps.push({ col: pos, row, direction: 'down' });
    } else {
      steps.push({ col: pos, row, direction: 'down' });
    }
  }
  steps.push({ col: pos, row: ROW_COUNT, direction: 'end' });
  return steps;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function LadderGame() {
  // ── UI State ──
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [playerCount, setPlayerCount] = useState(5);
  const [playerNames, setPlayerNames] = useState<string[]>(
    FAMILY_MEMBERS.map(m => m.name)
  );
  const [resultItems, setResultItems] = useState<string[]>(Array(5).fill(''));
  // mirrors of ref-state for rendering player buttons / result list
  const [uiRevealedPlayers, setUiRevealedPlayers] = useState<Set<number>>(new Set());
  const [uiSelectedPlayer, setUiSelectedPlayer] = useState<number | null>(null);
  const [resultModal, setResultModal] = useState<{ playerIdx: number; resultIdx: number } | null>(null);

  // ── Ref State (animation-loop access) ──
  const rungs = useRef<boolean[][]>([]);
  const paths = useRef<number[]>([]);
  const revealedPlayers = useRef<Set<number>>(new Set());
  const selectedPlayer = useRef<number | null>(null);
  const animProgress = useRef(0);
  const playerCountRef = useRef(5);

  // ── Canvas + Animation Refs ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animIdRef = useRef<number | null>(null);
  const animStartRef = useRef<number | null>(null);

  // Keep playerCountRef in sync
  useEffect(() => { playerCountRef.current = playerCount; }, [playerCount]);

  // Sync playerNames / resultItems when playerCount changes
  useEffect(() => {
    setPlayerNames(prev => {
      const next = prev.slice(0, playerCount);
      while (next.length < playerCount) {
        next.push(FAMILY_MEMBERS[next.length]?.name ?? `플레이어${next.length + 1}`);
      }
      return [...next];
    });
    setResultItems(prev => {
      const next = prev.slice(0, playerCount);
      while (next.length < playerCount) next.push('');
      return [...next];
    });
  }, [playerCount]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rungs.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = playerCountRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const paddingTop = 20;
    const paddingBottom = 20;
    const ladderH = H - paddingTop - paddingBottom;
    const colSpacing = W / n;
    const rowSpacing = ladderH / ROW_COUNT;

    const xAt = (col: number) => colSpacing * col + colSpacing / 2;
    const yAt = (row: number) => {
      if (row < 0) return paddingTop;
      if (row >= ROW_COUNT) return paddingTop + ladderH;
      return paddingTop + row * rowSpacing;
    };
    const toPoint = (step: LadderStep) => ({
      x: xAt(step.col),
      y: step.row < 0
        ? paddingTop
        : step.row >= ROW_COUNT
          ? paddingTop + ladderH
          : yAt(step.row) + rowSpacing / 2,
    });

    // ── Vertical lines ──
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    for (let col = 0; col < n; col++) {
      ctx.beginPath();
      ctx.moveTo(xAt(col), paddingTop);
      ctx.lineTo(xAt(col), paddingTop + ladderH);
      ctx.stroke();
    }

    // ── Rungs ──
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2.5;
    for (let col = 0; col < n - 1; col++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        if (rungs.current[col]?.[row]) {
          const y = yAt(row) + rowSpacing / 2;
          ctx.beginPath();
          ctx.moveTo(xAt(col), y);
          ctx.lineTo(xAt(col + 1), y);
          ctx.stroke();
        }
      }
    }

    // ── Revealed (completed) paths ──
    Array.from(revealedPlayers.current).forEach(pIdx => {
      // Skip currently-animating player until animation completes
      if (pIdx === selectedPlayer.current && animProgress.current < 1) return;
      const steps = getPath(pIdx, rungs.current, n);
      ctx.strokeStyle = PLAYER_COLORS[pIdx % PLAYER_COLORS.length] + 'B3'; // 70%
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      steps.forEach((s, i) => {
        const pt = toPoint(s);
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });

    // ── Animating path ──
    const sp = selectedPlayer.current;
    if (sp !== null && !revealedPlayers.current.has(sp)) {
      const steps = getPath(sp, rungs.current, n);
      const totalSeg = steps.length - 1;
      const pf = animProgress.current * totalSeg;
      const curSeg = Math.min(Math.floor(pf), totalSeg - 1);
      const segProg = pf - curSeg;

      ctx.strokeStyle = PLAYER_COLORS[sp % PLAYER_COLORS.length];
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < steps.length - 1; i++) {
        const fp = toPoint(steps[i]);
        const tp = toPoint(steps[i + 1]);
        if (i < curSeg) {
          if (!started) { ctx.moveTo(fp.x, fp.y); started = true; }
          ctx.lineTo(tp.x, tp.y);
        } else if (i === curSeg) {
          if (!started) { ctx.moveTo(fp.x, fp.y); started = true; }
          ctx.lineTo(fp.x + (tp.x - fp.x) * segProg, fp.y + (tp.y - fp.y) * segProg);
          break;
        }
      }
      ctx.stroke();

      // Dot at current position
      if (steps.length > 1) {
        const fp = toPoint(steps[curSeg]);
        const tp = toPoint(steps[Math.min(curSeg + 1, steps.length - 1)]);
        const dx = fp.x + (tp.x - fp.x) * segProg;
        const dy = fp.y + (tp.y - fp.y) * segProg;

        ctx.beginPath();
        ctx.arc(dx, dy, 9, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLORS[sp % PLAYER_COLORS.length];
        ctx.fill();

        ctx.beginPath();
        ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    }
  }, []); // reads only from refs – stable

  // Redraw when non-animation state changes (phase, reveals, selection)
  useEffect(() => {
    if (phase === 'playing') draw();
  }, [phase, draw, uiRevealedPlayers, uiSelectedPlayer]);

  // Resize observer: keep canvas width = container width
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const w = container.clientWidth;
      canvas.width = w;
      canvas.height = Math.max(260, Math.min(Math.round(w * 1.05), 400));
      draw();
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [phase, draw]);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStart = () => {
    const r = generateRungs(playerCount);
    const p = calcPaths(r, playerCount);
    rungs.current = r;
    paths.current = p;
    revealedPlayers.current = new Set();
    selectedPlayer.current = null;
    animProgress.current = 0;
    playerCountRef.current = playerCount;
    setUiRevealedPlayers(new Set());
    setUiSelectedPlayer(null);
    setResultModal(null);
    setPhase('playing');
  };

  const handleSelectPlayer = useCallback((idx: number) => {
    // Cancel any running animation
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }

    // Already revealed → show result again
    if (revealedPlayers.current.has(idx)) {
      setResultModal({ playerIdx: idx, resultIdx: paths.current[idx] });
      return;
    }

    selectedPlayer.current = idx;
    animProgress.current = 0;
    animStartRef.current = null;
    setUiSelectedPlayer(idx);

    const animate = (ts: number) => {
      if (animStartRef.current === null) animStartRef.current = ts;
      const prog = Math.min((ts - animStartRef.current) / ANIM_DURATION, 1);
      animProgress.current = prog;
      draw();

      if (prog < 1) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        revealedPlayers.current.add(idx);
        setUiRevealedPlayers(new Set(revealedPlayers.current));
        setResultModal({ playerIdx: idx, resultIdx: paths.current[idx] });
        animIdRef.current = null;
      }
    };

    animIdRef.current = requestAnimationFrame(animate);
  }, [draw]);

  const handleRevealAll = () => {
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }
    const all = new Set(Array.from({ length: playerCount }, (_, i) => i));
    revealedPlayers.current = all;
    selectedPlayer.current = null;
    animProgress.current = 1;
    setUiRevealedPlayers(new Set(all));
    setUiSelectedPlayer(null);
    draw();
  };

  const handleReset = () => {
    if (animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }
    rungs.current = [];
    paths.current = [];
    revealedPlayers.current = new Set();
    selectedPlayer.current = null;
    animProgress.current = 0;
    setUiRevealedPlayers(new Set());
    setUiSelectedPlayer(null);
    setResultModal(null);
    setPhase('setup');
  };

  // ── Setup Phase ───────────────────────────────────────────────────────────
  if (phase === 'setup') {
    const allFilled = resultItems.slice(0, playerCount).every(r => r.trim());
    return (
      <div className="space-y-6">
        {/* Player count selector */}
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">플레이어 수</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <Button
                key={n}
                variant={playerCount === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlayerCount(n)}
                className="w-10 h-10"
              >
                {n}
              </Button>
            ))}
          </div>
        </div>

        {/* Player names */}
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">플레이어 이름</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {playerNames.slice(0, playerCount).map((name, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground">플레이어 {i + 1}</span>
                </div>
                <Input
                  value={name}
                  onChange={e => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                  className="h-8 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Results / penalties */}
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">결과 / 벌칙</Label>
          <div className="space-y-2 mt-2">
            {resultItems.slice(0, playerCount).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-5 text-right">{i + 1}.</span>
                <Input
                  value={item}
                  onChange={e => {
                    const next = [...resultItems];
                    next[i] = e.target.value;
                    setResultItems(next);
                  }}
                  placeholder={['설거지', '청소', '꽝', '간식 사기', '빨래', '심부름', '요리', '상금!'][i] ?? `결과 ${i + 1}`}
                  className="h-9"
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleStart}
          disabled={!allFilled}
        >
          <Play className="w-5 h-5 mr-2" />
          게임 시작!
        </Button>
      </div>
    );
  }

  // ── Playing Phase ─────────────────────────────────────────────────────────
  const allRevealed = uiRevealedPlayers.size === playerCount;
  const names = playerNames.slice(0, playerCount);

  return (
    <div className="space-y-4">
      {/* Player buttons (top) */}
      <div className="flex flex-wrap gap-2 justify-center">
        {names.map((name, i) => {
          const isRevealed = uiRevealedPlayers.has(i);
          const isAnimating = uiSelectedPlayer === i && !isRevealed;
          return (
            <button
              key={i}
              onClick={() => handleSelectPlayer(i)}
              disabled={isAnimating}
              className="px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: PLAYER_COLORS[i % PLAYER_COLORS.length],
                backgroundColor: (isRevealed || uiSelectedPlayer === i)
                  ? PLAYER_COLORS[i % PLAYER_COLORS.length]
                  : 'transparent',
                color: (isRevealed || uiSelectedPlayer === i)
                  ? 'white'
                  : PLAYER_COLORS[i % PLAYER_COLORS.length],
              }}
            >
              {name}{isRevealed ? ' ✓' : ''}
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden border bg-muted/20">
        <canvas
          ref={canvasRef}
          className="w-full block"
          style={{ touchAction: 'none' }}
        />
      </div>

      {/* Result slots (bottom of ladder) */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}
      >
        {Array.from({ length: playerCount }, (_, resultSlot) => {
          // Which player lands here?
          const pIdx = paths.current.findIndex(p => p === resultSlot);
          const isRevealed = uiRevealedPlayers.has(pIdx) && pIdx !== -1;
          return (
            <div
              key={resultSlot}
              className="text-center py-2 px-1 rounded-md text-xs font-semibold transition-all duration-300"
              style={isRevealed ? {
                backgroundColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length] + '22',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
                color: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
              } : {
                backgroundColor: '#f1f5f9',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#e2e8f0',
                color: '#94a3b8',
              }}
            >
              {isRevealed
                ? <span className="break-words leading-tight">{resultItems[resultSlot]}</span>
                : '?'}
            </div>
          );
        })}
      </div>

      {/* Hint text */}
      {!allRevealed && uiRevealedPlayers.size === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          위의 이름 버튼을 클릭해서 사다리를 타세요!
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        {!allRevealed && (
          <Button variant="outline" className="flex-1" onClick={handleRevealAll}>
            <Eye className="w-4 h-4 mr-2" />
            전체 공개
          </Button>
        )}
        <Button
          variant="outline"
          className={allRevealed ? 'w-full' : 'flex-1'}
          onClick={handleReset}
        >
          <RotateCw className="w-4 h-4 mr-2" />
          다시 하기
        </Button>
      </div>

      {/* Result Modal */}
      <Dialog open={!!resultModal} onOpenChange={() => setResultModal(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {resultModal !== null && names[resultModal.playerIdx]}의 결과
            </DialogTitle>
          </DialogHeader>
          {resultModal !== null && (
            <>
              <div
                className="py-8 px-4 rounded-xl mt-2 text-3xl font-bold"
                style={{
                  backgroundColor: PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length] + '1A',
                  color: PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length],
                  border: `2px solid ${PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length]}`,
                }}
              >
                {resultItems[resultModal.resultIdx]}
              </div>
              <Button className="mt-4 w-full" onClick={() => setResultModal(null)}>
                확인
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
