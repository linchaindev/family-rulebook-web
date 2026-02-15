import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, RotateCw, Eye } from 'lucide-react';
import { FAMILY_MEMBERS } from '@/types/family';

// ── Constants ─────────────────────────────────────────────────────────────────
const ROW_COUNT      = 16;   // was 8 — taller, more crossings
const ANIM_DURATION  = 2400; // ms
const PLAYER_COLORS  = [
  '#E53935', '#1E88E5', '#43A047', '#FF8F00',
  '#8E24AA', '#00ACC1', '#E91E63', '#558B2F',
];

// ── Types ─────────────────────────────────────────────────────────────────────
type StepDirection = 'down' | 'left' | 'right' | 'end';
interface LadderStep { col: number; row: number; direction: StepDirection; }
type GamePhase = 'setup' | 'playing';

// ── Audio ─────────────────────────────────────────────────────────────────────
let _audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!_audioCtx)
      _audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return _audioCtx;
  } catch { return null; }
}

/** Short tick on each row step */
function playLadderTick(isHorizontal: boolean) {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = isHorizontal ? 1050 : 650;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.06);
  } catch { /* ignore */ }
}

/** 🎉 축하 팡파레 — "상"이 포함된 결과 */
function playWinFanfare() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5~E6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.11;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.start(t); osc.stop(t + 0.42);
    });
  } catch { /* ignore */ }
}

/** 😜 놀리는 사운드 — "벌"이 포함된 결과 */
function playTeaseTune() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    // 낮은 음에서 위로 올라가다가 뚝 떨어지는 "엥~↗뚝" 느낌
    const notes = [
      { freq: 880, t: 0,    dur: 0.12 },
      { freq: 1047, t: 0.14, dur: 0.12 },
      { freq: 330, t: 0.30, dur: 0.35 }, // 뚝
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

/** 보통 완료음 */
function playNormalEnd() {
  try {
    const ctx = getAudioCtx(); if (!ctx) return;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.32);
  } catch { /* ignore */ }
}

function playResultSound(resultText: string) {
  if (resultText.includes('상')) { playWinFanfare(); }
  else if (resultText.includes('벌')) { playTeaseTune(); }
  else { playNormalEnd(); }
}

// ── Ladder Logic ──────────────────────────────────────────────────────────────
function generateRungs(n: number): boolean[][] {
  const rungs = Array.from({ length: n - 1 }, () => Array<boolean>(ROW_COUNT).fill(false));
  for (let row = 0; row < ROW_COUNT; row++) {
    let col = 0;
    while (col < n - 1) {
      if (Math.random() < 0.52) { rungs[col][row] = true; col += 2; }
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
      steps.push({ col: pos, row, direction: 'right' }); pos++;
      steps.push({ col: pos, row, direction: 'down' });
    } else if (pos > 0 && rungs[pos - 1][row]) {
      steps.push({ col: pos, row, direction: 'left' }); pos--;
      steps.push({ col: pos, row, direction: 'down' });
    } else {
      steps.push({ col: pos, row, direction: 'down' });
    }
  }
  steps.push({ col: pos, row: ROW_COUNT, direction: 'end' });
  return steps;
}

/**
 * 야바위 모드: 이름 뒤 공백 수만큼 걸리게
 * 공백 수 = 0 → 일반 모드
 * 공백 수 = k → 결과 슬롯 (k-1) (0-indexed) 에 강제 배정
 *
 * 조건을 충족하는 rungs를 찾을 때까지 최대 300회 재생성.
 */
/** rigged: array of [playerIdx, targetSlot] pairs */
function generateRiggedRungs(n: number, rigged: Array<[number, number]>): boolean[][] {
  for (let attempt = 0; attempt < 300; attempt++) {
    const r = generateRungs(n);
    const p = calcPaths(r, n);
    let ok = true;
    for (let ri = 0; ri < rigged.length; ri++) {
      const [playerIdx, targetSlot] = rigged[ri];
      if (p[playerIdx] !== targetSlot) { ok = false; break; }
    }
    if (ok) return r;
  }
  return generateRungs(n); // fallback
}

function parseTrailingSpaces(name: string): number {
  const trimmed = name.trimEnd();
  return name.length - trimmed.length;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function LadderGame() {
  const [phase, setPhase]             = useState<GamePhase>('setup');
  const [playerCount, setPlayerCount] = useState(5);
  const [playerNames, setPlayerNames] = useState<string[]>(FAMILY_MEMBERS.map(m => m.name));
  const [resultItems, setResultItems] = useState<string[]>(Array(5).fill(''));
  const [uiRevealedPlayers, setUiRevealedPlayers] = useState<Set<number>>(new Set());
  const [uiSelectedPlayer, setUiSelectedPlayer]   = useState<number | null>(null);
  const [resultModal, setResultModal] = useState<{ playerIdx: number; resultIdx: number } | null>(null);

  const rungs              = useRef<boolean[][]>([]);
  const paths              = useRef<number[]>([]);
  const revealedPlayers    = useRef<Set<number>>(new Set());
  const selectedPlayer     = useRef<number | null>(null);
  const animProgress       = useRef(0);
  const playerCountRef     = useRef(5);
  const lastStepRef        = useRef<{ seg: number; horiz: boolean }>({ seg: -1, horiz: false });

  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animIdRef    = useRef<number | null>(null);
  const animStartRef = useRef<number | null>(null);

  useEffect(() => { playerCountRef.current = playerCount; }, [playerCount]);

  useEffect(() => {
    setPlayerNames(prev => {
      const next = prev.slice(0, playerCount);
      while (next.length < playerCount)
        next.push(FAMILY_MEMBERS[next.length]?.name ?? `플레이어${next.length + 1}`);
      return [...next];
    });
    setResultItems(prev => {
      const next = prev.slice(0, playerCount);
      while (next.length < playerCount) next.push('');
      return [...next];
    });
  }, [playerCount]);

  // ── Draw ─────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || rungs.current.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = playerCountRef.current;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const padTop = 24, padBot = 24;
    const ladderH    = H - padTop - padBot;
    const colSpacing = W / n;
    const rowSpacing = ladderH / ROW_COUNT;

    const xAt = (col: number) => colSpacing * col + colSpacing / 2;
    const yAt = (row: number) => {
      if (row < 0) return padTop;
      if (row >= ROW_COUNT) return padTop + ladderH;
      return padTop + row * rowSpacing;
    };
    const toPoint = (step: LadderStep) => ({
      x: xAt(step.col),
      y: step.row < 0 ? padTop
        : step.row >= ROW_COUNT ? padTop + ladderH
        : yAt(step.row) + rowSpacing / 2,
    });

    // Vertical lines
    ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let col = 0; col < n; col++) {
      ctx.beginPath();
      ctx.moveTo(xAt(col), padTop);
      ctx.lineTo(xAt(col), padTop + ladderH);
      ctx.stroke();
    }

    // Rungs
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    for (let col = 0; col < n - 1; col++) {
      for (let row = 0; row < ROW_COUNT; row++) {
        if (rungs.current[col]?.[row]) {
          const y = yAt(row) + rowSpacing / 2;
          ctx.beginPath();
          ctx.moveTo(xAt(col), y); ctx.lineTo(xAt(col + 1), y);
          ctx.stroke();
        }
      }
    }

    // Revealed paths
    Array.from(revealedPlayers.current).forEach(pIdx => {
      if (pIdx === selectedPlayer.current && animProgress.current < 1) return;
      const steps = getPath(pIdx, rungs.current, n);
      ctx.strokeStyle = PLAYER_COLORS[pIdx % PLAYER_COLORS.length] + 'B3';
      ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath();
      steps.forEach((s, i) => {
        const pt = toPoint(s);
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
    });

    // Animating path
    const sp = selectedPlayer.current;
    if (sp !== null && !revealedPlayers.current.has(sp)) {
      const steps = getPath(sp, rungs.current, n);
      const totalSeg = steps.length - 1;
      const pf  = animProgress.current * totalSeg;
      const cur = Math.min(Math.floor(pf), totalSeg - 1);
      const segProg = pf - cur;

      // Tick sound on new segment
      if (cur !== lastStepRef.current.seg) {
        const horiz = steps[cur]?.direction === 'left' || steps[cur]?.direction === 'right';
        lastStepRef.current = { seg: cur, horiz };
        playLadderTick(horiz);
      }

      ctx.strokeStyle = PLAYER_COLORS[sp % PLAYER_COLORS.length];
      ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); let started = false;
      for (let i = 0; i < steps.length - 1; i++) {
        const fp = toPoint(steps[i]); const tp = toPoint(steps[i + 1]);
        if (i < cur) {
          if (!started) { ctx.moveTo(fp.x, fp.y); started = true; }
          ctx.lineTo(tp.x, tp.y);
        } else if (i === cur) {
          if (!started) { ctx.moveTo(fp.x, fp.y); started = true; }
          ctx.lineTo(fp.x + (tp.x - fp.x) * segProg, fp.y + (tp.y - fp.y) * segProg);
          break;
        }
      }
      ctx.stroke();

      // Moving dot
      if (steps.length > 1) {
        const fp = toPoint(steps[cur]);
        const tp = toPoint(steps[Math.min(cur + 1, steps.length - 1)]);
        const dx = fp.x + (tp.x - fp.x) * segProg;
        const dy = fp.y + (tp.y - fp.y) * segProg;
        // Glow
        ctx.beginPath(); ctx.arc(dx, dy, 14, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLORS[sp % PLAYER_COLORS.length] + '44';
        ctx.fill();
        ctx.beginPath(); ctx.arc(dx, dy, 9, 0, Math.PI * 2);
        ctx.fillStyle = PLAYER_COLORS[sp % PLAYER_COLORS.length]; ctx.fill();
        ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI * 2);
        ctx.fillStyle = 'white'; ctx.fill();
      }
    }
  }, []);

  useEffect(() => { if (phase === 'playing') draw(); }, [phase, draw, uiRevealedPlayers, uiSelectedPlayer]);

  useEffect(() => {
    const container = containerRef.current; const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const w = container.clientWidth;
      canvas.width  = w;
      // Taller canvas: aspect ratio ~1.7 for more vertical ladder
      canvas.height = Math.max(480, Math.min(Math.round(w * 1.7), 680));
      draw();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [phase, draw]);

  useEffect(() => {
    return () => { if (animIdRef.current) cancelAnimationFrame(animIdRef.current); };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    const n = playerCount;

    // Parse yabaui: trailing spaces on name → forced result slot (1-indexed → 0-indexed)
    // riggedMap not needed — using riggedEntries below
    const riggedEntries: Array<[number, number]> = [];
    playerNames.slice(0, n).forEach((name, i) => {
      const spaces = parseTrailingSpaces(name);
      if (spaces > 0) {
        const targetSlot = Math.min(spaces - 1, n - 1);
        riggedEntries.push([i, targetSlot]);
      }
    });

    const r = riggedEntries.length > 0
      ? generateRiggedRungs(n, riggedEntries)
      : generateRungs(n);
    const p = calcPaths(r, n);

    rungs.current            = r;
    paths.current            = p;
    revealedPlayers.current  = new Set();
    selectedPlayer.current   = null;
    animProgress.current     = 0;
    playerCountRef.current   = n;
    lastStepRef.current      = { seg: -1, horiz: false };

    setUiRevealedPlayers(new Set());
    setUiSelectedPlayer(null);
    setResultModal(null);
    setPhase('playing');
  };

  const handleSelectPlayer = useCallback((idx: number) => {
    if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }

    if (revealedPlayers.current.has(idx)) {
      setResultModal({ playerIdx: idx, resultIdx: paths.current[idx] });
      return;
    }

    selectedPlayer.current = idx;
    animProgress.current   = 0;
    animStartRef.current   = null;
    lastStepRef.current    = { seg: -1, horiz: false };
    setUiSelectedPlayer(idx);

    const animate = (ts: number) => {
      if (animStartRef.current === null) animStartRef.current = ts;
      const prog = Math.min((ts - animStartRef.current) / ANIM_DURATION, 1);
      animProgress.current = prog;
      draw();

      if (prog < 1) {
        animIdRef.current = requestAnimationFrame(animate);
      } else {
        revealedPlayers.current.add(idx);
        setUiRevealedPlayers(new Set(revealedPlayers.current));
        const resultIdx = paths.current[idx];
        setResultModal({ playerIdx: idx, resultIdx });
        animIdRef.current = null;
        // Play result sound
        const resultText = resultItems[resultIdx] ?? '';
        playResultSound(resultText);
      }
    };
    animIdRef.current = requestAnimationFrame(animate);
  }, [draw, resultItems]);

  const handleRevealAll = () => {
    if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }
    const all = new Set(Array.from({ length: playerCount }, (_, i) => i));
    revealedPlayers.current = all;
    selectedPlayer.current  = null;
    animProgress.current    = 1;
    setUiRevealedPlayers(new Set(all));
    setUiSelectedPlayer(null);
    draw();
  };

  const handleReset = () => {
    if (animIdRef.current) { cancelAnimationFrame(animIdRef.current); animIdRef.current = null; }
    rungs.current           = [];
    paths.current           = [];
    revealedPlayers.current = new Set();
    selectedPlayer.current  = null;
    animProgress.current    = 0;
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
        <div>
          <Label className="text-sm font-semibold text-muted-foreground">플레이어 수</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {[2, 3, 4, 5, 6, 7, 8].map(n => (
              <Button key={n} variant={playerCount === n ? 'default' : 'outline'} size="sm"
                onClick={() => setPlayerCount(n)} className="w-10 h-10">{n}</Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-muted-foreground">플레이어 이름</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
            {playerNames.slice(0, playerCount).map((name, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PLAYER_COLORS[i % PLAYER_COLORS.length] }} />
                  <span className="text-xs text-muted-foreground">플레이어 {i + 1}</span>
                </div>
                <Input value={name}
                  onChange={e => { const next = [...playerNames]; next[i] = e.target.value; setPlayerNames(next); }}
                  className="h-8 text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-muted-foreground">결과 / 벌칙</Label>
          <div className="space-y-2 mt-2">
            {resultItems.slice(0, playerCount).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-5 text-right">{i + 1}.</span>
                <Input value={item}
                  onChange={e => { const next = [...resultItems]; next[i] = e.target.value; setResultItems(next); }}
                  placeholder={['설거지', '청소', '꽝', '간식 사기', '빨래', '심부름', '요리', '상금!'][i] ?? `결과 ${i + 1}`}
                  className="h-9" />
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleStart} disabled={!allFilled}>
          <Play className="w-5 h-5 mr-2" />게임 시작!
        </Button>
      </div>
    );
  }

  // ── Playing Phase ─────────────────────────────────────────────────────────
  const allRevealed = uiRevealedPlayers.size === playerCount;
  const names = playerNames.slice(0, playerCount);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {names.map((name, i) => {
          const isRevealed  = uiRevealedPlayers.has(i);
          const isAnimating = uiSelectedPlayer === i && !isRevealed;
          // Display trimmed name (hide trailing spaces from user)
          const displayName = name.trimEnd();
          return (
            <button key={i} onClick={() => handleSelectPlayer(i)} disabled={isAnimating}
              className="px-3 py-1.5 text-sm font-semibold rounded-full border-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                borderColor: PLAYER_COLORS[i % PLAYER_COLORS.length],
                backgroundColor: (isRevealed || uiSelectedPlayer === i) ? PLAYER_COLORS[i % PLAYER_COLORS.length] : 'transparent',
                color: (isRevealed || uiSelectedPlayer === i) ? 'white' : PLAYER_COLORS[i % PLAYER_COLORS.length],
              }}>
              {displayName}{isRevealed ? ' ✓' : ''}
            </button>
          );
        })}
      </div>

      <div ref={containerRef} className="w-full rounded-xl overflow-hidden border bg-muted/20">
        <canvas ref={canvasRef} className="w-full block" style={{ touchAction: 'none' }} />
      </div>

      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${playerCount}, 1fr)` }}>
        {Array.from({ length: playerCount }, (_, resultSlot) => {
          const pIdx = paths.current.findIndex(p => p === resultSlot);
          const isRevealed = uiRevealedPlayers.has(pIdx) && pIdx !== -1;
          return (
            <div key={resultSlot} className="text-center py-2 px-1 rounded-md text-xs font-semibold transition-all duration-300"
              style={isRevealed ? {
                backgroundColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length] + '22',
                borderWidth: 1, borderStyle: 'solid',
                borderColor: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
                color: PLAYER_COLORS[pIdx % PLAYER_COLORS.length],
              } : {
                backgroundColor: '#f1f5f9', borderWidth: 1, borderStyle: 'solid',
                borderColor: '#e2e8f0', color: '#94a3b8',
              }}>
              {isRevealed ? <span className="break-words leading-tight">{resultItems[resultSlot]}</span> : '?'}
            </div>
          );
        })}
      </div>

      {!allRevealed && uiRevealedPlayers.size === 0 && (
        <p className="text-center text-sm text-muted-foreground">위의 이름 버튼을 클릭해서 사다리를 타세요!</p>
      )}

      <div className="flex gap-3">
        {!allRevealed && (
          <Button variant="outline" className="flex-1" onClick={handleRevealAll}>
            <Eye className="w-4 h-4 mr-2" />전체 공개
          </Button>
        )}
        <Button variant="outline" className={allRevealed ? 'w-full' : 'flex-1'} onClick={handleReset}>
          <RotateCw className="w-4 h-4 mr-2" />다시 하기
        </Button>
      </div>

      <Dialog open={!!resultModal} onOpenChange={() => setResultModal(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {resultModal !== null && names[resultModal.playerIdx].trimEnd()}의 결과
            </DialogTitle>
          </DialogHeader>
          {resultModal !== null && (
            <>
              <div className="py-8 px-4 rounded-xl mt-2 text-3xl font-bold"
                style={{
                  backgroundColor: PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length] + '1A',
                  color: PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length],
                  border: `2px solid ${PLAYER_COLORS[resultModal.playerIdx % PLAYER_COLORS.length]}`,
                  animation: 'ladderResultIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both',
                }}>
                {resultItems[resultModal.resultIdx]}
              </div>
              <Button className="mt-4 w-full" onClick={() => setResultModal(null)}>확인</Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes ladderResultIn {
          from { opacity:0; transform:scale(0.75) translateY(12px); }
          to   { opacity:1; transform:scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
