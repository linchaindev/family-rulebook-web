import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, Users, Trophy, Star, Sparkles, Calendar, Clock, BarChart3, Award } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FAMILY_MEMBERS } from "@/types/family";

// 이전달 계산 헬퍼
function getPrevMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const prevDate = new Date(year, monthNum - 2, 1);
  return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
}

function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const nextDate = new Date(year, monthNum, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
}

// 현재 달
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// 폭죽 파티클 컴포넌트
function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff', '#ff9f43', '#48dbfb'];
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; angle: number; spin: number; life: number;
    }> = [];

    for (let i = 0; i < 200; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
        life: 1,
      });
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.angle += p.spin;
        p.life -= 0.005;
        if (p.life > 0 && p.y < canvas!.height + 20) {
          alive = true;
          ctx!.save();
          ctx!.globalAlpha = p.life;
          ctx!.translate(p.x, p.y);
          ctx!.rotate(p.angle);
          ctx!.fillStyle = p.color;
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx!.restore();
        }
      });
      if (alive) {
        animRef.current = requestAnimationFrame(animate);
      }
    }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

// 욕봤다 축하 페이지
function CelebrationPage({
  month,
  managerId,
  goodVotes,
  badVotes,
  ddcData,
  activityLogs,
  onClose,
}: {
  month: string;
  managerId: string;
  goodVotes: number;
  badVotes: number;
  ddcData: Array<{ memberId: string; screenTime: number }>;
  activityLogs: Array<{ activityType: string; comment: string; date: string }>;
  onClose: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const manager = FAMILY_MEMBERS.find(m => m.id === managerId);
  const totalVotes = goodVotes + badVotes;
  const successRate = totalVotes > 0 ? Math.round((goodVotes / totalVotes) * 100) : 0;
  const isSuccess = goodVotes > badVotes;

  // 매니저의 DDC 총 스크린타임
  const managerDDC = ddcData.filter(r => r.memberId === managerId);
  const managerTotalScreenTime = managerDDC.reduce((sum, r) => sum + r.screenTime, 0);

  // DDC 순위 계산
  const memberTotals = FAMILY_MEMBERS.filter(m => m.role === 'student').map(m => ({
    member: m,
    total: ddcData.filter(r => r.memberId === m.id).reduce((sum, r) => sum + r.screenTime, 0),
  })).sort((a, b) => a.total - b.total);
  const managerRank = memberTotals.findIndex(m => m.member.id === managerId) + 1;

  // 활동 기록 통계
  const totalLogs = activityLogs.length;

  // Web Audio 팡파레 사운드
  useEffect(() => {
    if (soundPlayed) return;
    setSoundPlayed(true);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = isSuccess
        ? [523, 659, 784, 1047, 784, 1047, 1319] // 성공 팡파레
        : [392, 349, 330, 294]; // 아쉬운 멜로디

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.35);
        osc.start(ctx.currentTime + i * 0.18);
        osc.stop(ctx.currentTime + i * 0.18 + 0.35);
      });
    } catch (e) {
      // 사운드 실패 무시
    }
  }, []);

  // 5초 후 폭죽 종료
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{
        background: isSuccess
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)'
          : 'linear-gradient(135deg, #2d1b69 0%, #11998e 100%)',
      }}
    >
      <Confetti active={showConfetti} />

      {/* 배경 별 효과 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 4 + 1 + 'px',
              height: Math.random() * 4 + 1 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container max-w-2xl py-8 px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 animate-bounce">{manager?.avatar}</div>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold text-lg">{month} 매니저</span>
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-2">
            {manager?.name}
          </h1>
          <p className="text-2xl font-bold" style={{ color: isSuccess ? '#ffd93d' : '#ff6b9d' }}>
            {isSuccess ? '🎉 욕봤다! 수고했어~' : '😅 고생 많았어!'}
          </p>
          <p className="text-white/70 mt-2">
            {isSuccess
              ? '한 달 동안 가족을 위해 열심히 일해줘서 고마워!'
              : '쉽지 않은 한 달이었지만, 그래도 고생했어!'}
          </p>
        </div>

        {/* 평가 결과 카드 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white font-bold text-xl">가족 평가 결과</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-4xl font-black text-green-400">{goodVotes}</div>
              <div className="text-white/70 text-sm mt-1">👍 잘했음</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white">{successRate}%</div>
              <div className="text-white/70 text-sm mt-1">⭐ 지지율</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-red-400">{badVotes}</div>
              <div className="text-white/70 text-sm mt-1">👎 못했음</div>
            </div>
          </div>
          <Progress
            value={successRate}
            className="h-3 bg-white/20"
          />
          <div className="mt-3 text-center">
            <Badge
              className="text-base px-4 py-1"
              style={{
                background: isSuccess ? '#6bcb77' : '#ff6b6b',
                color: 'white',
              }}
            >
              {isSuccess ? '✅ 매니저 보상 +1만원 획득!' : '❌ 이번엔 아쉽게 탈락'}
            </Badge>
          </div>
        </div>

        {/* DDC 지표 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-white font-semibold">DDC 스크린타임</span>
            </div>
            <div className="text-3xl font-black text-blue-300">
              {formatTime(managerTotalScreenTime)}
            </div>
            <div className="text-white/60 text-sm mt-1">{month} 총 사용 시간</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">DDC 순위</span>
            </div>
            <div className="text-3xl font-black text-purple-300">
              {managerRank > 0 ? `${managerRank}위` : '-'}
            </div>
            <div className="text-white/60 text-sm mt-1">
              {managerRank === 1 ? '🥇 스크린타임 최소!' : `전체 ${memberTotals.length}명 중`}
            </div>
          </div>
        </div>

        {/* DDC 순위표 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h2 className="text-white font-bold">이번 달 DDC 순위</h2>
          </div>
          <div className="space-y-2">
            {memberTotals.map((item, idx) => (
              <div
                key={item.member.id}
                className={`flex items-center justify-between rounded-xl px-4 py-2 ${
                  item.member.id === managerId
                    ? 'bg-yellow-400/20 border border-yellow-400/40'
                    : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white/60 w-6">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                  </span>
                  <span className="text-xl">{item.member.avatar}</span>
                  <span className="text-white font-medium">
                    {item.member.name}
                    {item.member.id === managerId && (
                      <span className="ml-2 text-yellow-400 text-xs">★ 매니저</span>
                    )}
                  </span>
                </div>
                <span className="text-white/80 font-mono text-sm">
                  {formatTime(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 활동 기록 요약 */}
        {totalLogs > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-4 border border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-bold">매니저 활동 기록</h2>
              <Badge className="bg-orange-400/30 text-orange-300 border-0">{totalLogs}건</Badge>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {activityLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                  <span className="text-white/50 mr-2">{log.date}</span>
                  <span className="text-white/80">{log.comment}</span>
                </div>
              ))}
              {totalLogs > 5 && (
                <p className="text-white/50 text-sm text-center">+{totalLogs - 5}건 더...</p>
              )}
            </div>
          </div>
        )}

        {/* 닫기 버튼 */}
        <Button
          size="lg"
          className="w-full text-lg font-bold py-6 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
          }}
          onClick={onClose}
        >
          <Star className="w-5 h-5 mr-2" />
          다음 달 매니저 평가로 이동
        </Button>
      </div>
    </div>
  );
}

export default function ManagerEvaluation() {
  const [, navigate] = useLocation();
  const currentMonth = getCurrentMonth();
  const prevMonth = getPrevMonth(currentMonth);

  // 이전달 평가가 완료되었는지 확인 후 selectedMonth 결정
  const { data: prevMonthEvaluations, isLoading: prevLoading } = trpc.managerEvaluation.getByMonth.useQuery(
    { month: prevMonth }
  );

  // 이전달 평가 미완료 시 이전달, 완료 시 현재달
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  useEffect(() => {
    if (prevLoading) return;
    if (prevMonthEvaluations && prevMonthEvaluations.length === 0) {
      // 이전달 평가 미완료 → 이전달 표시
      setSelectedMonth(prevMonth);
    } else {
      // 이전달 평가 완료 → 현재달 표시
      setSelectedMonth(currentMonth);
    }
  }, [prevMonthEvaluations, prevLoading]);

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, 'good' | 'bad'>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    managerId: string;
    goodVotes: number;
    badVotes: number;
  } | null>(null);

  const { data: monthlyManager } = trpc.monthlyManager.get.useQuery(
    { month: selectedMonth! },
    { enabled: !!selectedMonth }
  );
  const { data: existingEvaluations = [], refetch: refetchEvaluations } = trpc.managerEvaluation.getByMonth.useQuery(
    { month: selectedMonth! },
    { enabled: !!selectedMonth }
  );
  const { data: allEvaluations = [] } = trpc.managerEvaluation.getAll.useQuery();

  // DDC 데이터 (욕봤다 페이지용)
  const { data: ddcData = [] } = trpc.ddc.getByMonth.useQuery(
    { month: selectedMonth! },
    { enabled: !!selectedMonth }
  );
  // 활동 기록 (욕봤다 페이지용)
  const { data: activityLogs = [] } = trpc.managerActivityLog.getByMonth.useQuery(
    { month: selectedMonth! },
    { enabled: !!selectedMonth }
  );

  const submitVoteMutation = trpc.managerEvaluation.submitVote.useMutation({
    onSuccess: () => refetchEvaluations(),
  });
  const completeAndNotifyMutation = trpc.managerEvaluation.completeAndSettle.useMutation();

  // 전체 가족 5인 중 매니저 본인 제외한 4인이 투표
  const voters = FAMILY_MEMBERS.filter(m => m.id !== monthlyManager?.managerId);

  const currentVoter = voters[currentVoterIndex];
  const hasVoted = currentVoter && votes[currentVoter.id] !== undefined;
  const allVoted = voters.every(v => votes[v.id] !== undefined);

  const handleVote = (vote: 'good' | 'bad') => {
    if (!currentVoter) return;
    setVotes(prev => ({ ...prev, [currentVoter.id]: vote }));
  };

  const handleNext = () => {
    if (currentVoterIndex < voters.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
    } else if (allVoted) {
      handleSubmitAll();
    }
  };

  const handleSubmitAll = async () => {
    if (!monthlyManager || !selectedMonth) {
      toast.error('이번 달 매니저가 지정되지 않았습니다.');
      return;
    }

    try {
      for (const voter of voters) {
        const vote = votes[voter.id];
        if (vote) {
          await submitVoteMutation.mutateAsync({
            month: selectedMonth,
            managerId: monthlyManager.managerId,
            voterId: voter.id,
            vote,
          });
        }
      }

      // 다음달 비밀번호 생성 및 알림 전송
      try {
        await completeAndNotifyMutation.mutateAsync({ month: selectedMonth });
        toast.success('평가 완료! 다음달 비밀번호가 생성되어 알림이 전송되었습니다.');
      } catch (e) {
        toast.success('모든 투표가 완료되었습니다!');
      }

      const goodVotes = Object.values(votes).filter(v => v === 'good').length;
      const badVotes = Object.values(votes).filter(v => v === 'bad').length;

      setCelebrationData({
        managerId: monthlyManager.managerId,
        goodVotes,
        badVotes,
      });
      setIsComplete(true);
      setShowCelebration(true);
    } catch (error) {
      toast.error('투표 제출에 실패했습니다.');
    }
  };

  // 욕봤다 페이지 닫기 → 다음달로 이동
  const handleCloseCelebration = () => {
    setShowCelebration(false);
    if (selectedMonth) {
      setSelectedMonth(getNextMonth(selectedMonth));
    }
    setCurrentVoterIndex(0);
    setVotes({});
    setIsComplete(false);
    setCelebrationData(null);
  };

  // 월별 평가 결과 집계
  const monthlyResults = allEvaluations.reduce((acc, evaluation) => {
    const key = `${evaluation.month}-${evaluation.managerId}`;
    if (!acc[key]) {
      acc[key] = { month: evaluation.month, managerId: evaluation.managerId, goodVotes: 0, badVotes: 0, totalVotes: 0 };
    }
    acc[key].totalVotes++;
    if (evaluation.vote === 'good') acc[key].goodVotes++;
    else acc[key].badVotes++;
    return acc;
  }, {} as Record<string, { month: string; managerId: string; goodVotes: number; badVotes: number; totalVotes: number }>);

  const cumulativeStats = FAMILY_MEMBERS.filter(m => m.role === 'student').map(member => {
    const memberEvaluations = allEvaluations.filter(e => e.managerId === member.id);
    const goodVotes = memberEvaluations.filter(e => e.vote === 'good').length;
    const badVotes = memberEvaluations.filter(e => e.vote === 'bad').length;
    return {
      member,
      goodVotes,
      badVotes,
      totalVotes: goodVotes + badVotes,
      successRate: goodVotes + badVotes > 0 ? (goodVotes / (goodVotes + badVotes) * 100).toFixed(1) : '0',
    };
  });

  // 로딩 중
  if (prevLoading || selectedMonth === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">평가 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 욕봤다 축하 페이지
  if (showCelebration && celebrationData) {
    return (
      <CelebrationPage
        month={selectedMonth}
        managerId={celebrationData.managerId}
        goodVotes={celebrationData.goodVotes}
        badVotes={celebrationData.badVotes}
        ddcData={ddcData}
        activityLogs={activityLogs}
        onClose={handleCloseCelebration}
      />
    );
  }

  // 이미 투표 완료된 경우
  if (existingEvaluations.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container py-8 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              룰북으로 돌아가기
            </Button>
          </Link>

          {/* 월 선택 */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(getPrevMonth(selectedMonth))}
            >
              ← 이전달
            </Button>
            <Badge variant="outline" className="text-base px-4 py-1">{selectedMonth}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMonth(getNextMonth(selectedMonth))}
            >
              다음달 →
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                {selectedMonth} 평가 완료
              </CardTitle>
              <CardDescription>
                {selectedMonth} 매니저 평가가 이미 완료되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">이번 달 평가 결과</h3>
                  {Object.values(monthlyResults)
                    .filter(r => r.month === selectedMonth)
                    .map((result) => {
                      const manager = FAMILY_MEMBERS.find(m => m.id === result.managerId);
                      return (
                        <div key={result.month} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{manager?.avatar}</span>
                              <span className="font-medium">{manager?.name}</span>
                              <Badge>{result.month}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-green-600">👍 {result.goodVotes}표</span>
                            <span className="text-red-600">👎 {result.badVotes}표</span>
                            <span className="text-muted-foreground">총 {result.totalVotes}표</span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">역대 누적 통계</h3>
                  <div className="space-y-2">
                    {cumulativeStats.map((stat) => (
                      <div key={stat.member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{stat.member.avatar}</span>
                          <span className="font-medium">{stat.member.name}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">👍 {stat.goodVotes}</span>
                          <span className="text-red-600">👎 {stat.badVotes}</span>
                          <Badge variant="outline">{stat.successRate}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!monthlyManager) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container py-8 max-w-md">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              룰북으로 돌아가기
            </Button>
          </Link>
          <Card>
            <CardHeader>
              <CardTitle>매니저가 지정되지 않았습니다</CardTitle>
              <CardDescription>
                {selectedMonth} 매니저를 먼저 지정해주세요.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const manager = FAMILY_MEMBERS.find(m => m.id === monthlyManager.managerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8 px-4 max-w-2xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        {/* 이전달 평가 안내 배너 */}
        {selectedMonth === prevMonth && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              <strong>{prevMonth} 매니저 평가</strong>가 아직 완료되지 않았습니다. 먼저 이전달 평가를 진행해주세요.
            </span>
          </div>
        )}

        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>월말 매니저 평가</CardTitle>
                <CardDescription>
                  {selectedMonth} 매니저: {manager?.avatar} {manager?.name}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 진행 상황 */}
            <div className="flex justify-center gap-2">
              {voters.map((voter, index) => (
                <div
                  key={voter.id}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${
                    index === currentVoterIndex
                      ? 'border-primary bg-primary/10 scale-110'
                      : votes[voter.id]
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-muted'
                  } transition-all`}
                >
                  {votes[voter.id]
                    ? (votes[voter.id] === 'good' ? '👍' : '👎')
                    : voter.avatar}
                </div>
              ))}
            </div>

            {/* 현재 투표자 */}
            <div className="text-center space-y-4">
              <div className="text-6xl">{currentVoter?.avatar}</div>
              <div>
                <h3 className="text-2xl font-bold">{currentVoter?.name}</h3>
                <p className="text-muted-foreground">
                  {manager?.name} 매니저의 활동을 평가해주세요
                </p>
              </div>
            </div>

            {/* 투표 버튼 */}
            {!hasVoted ? (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-32 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                  onClick={() => handleVote('good')}
                >
                  <ThumbsUp className="w-12 h-12 text-green-600" />
                  <span className="text-lg font-semibold">잘했음</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-32 flex-col gap-2 border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleVote('bad')}
                >
                  <ThumbsDown className="w-12 h-12 text-red-600" />
                  <span className="text-lg font-semibold">못했음</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-6 bg-muted rounded-lg">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">
                    {votes[currentVoter.id] === 'good' ? '👍 잘했음' : '👎 못했음'} 투표 완료!
                  </p>
                </div>
                <Button className="w-full" size="lg" onClick={handleNext}>
                  {currentVoterIndex < voters.length - 1 ? '다음 사람' : '🎉 투표 제출 및 평가 완료'}
                </Button>
              </div>
            )}

            {/* 투표 현황 */}
            <div className="text-center text-sm text-muted-foreground">
              {Object.keys(votes).length} / {voters.length} 명 투표 완료
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
