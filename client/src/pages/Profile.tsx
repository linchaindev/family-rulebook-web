import { useMemo } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Calendar, Target, Award, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { FAMILY_MEMBERS } from "@/types/family";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const memberId = params?.id || '';

  const member = FAMILY_MEMBERS.find(m => m.id === memberId);

  // 현재 날짜 기준으로 이번달과 지난달 계산
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const prevMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
  const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear;
  const prevMonth = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;

  // 데이터베이스에서 모든 데이터 불러오기
  const { data: ddcRecords = [] } = trpc.ddc.getAll.useQuery();
  const { data: rcrRecords = [] } = trpc.rcr.getAll.useQuery();
  const { data: activityLogs = [] } = trpc.managerActivityLog.getAll.useQuery();
  const { data: managerActivities = [] } = trpc.managerActivity.getAll.useQuery();

  // 이번달 용돈
  const { data: currentAllowance } = trpc.allowance.getByMonth.useQuery(
    { month: currentMonth, memberId },
    { enabled: !!memberId }
  );
  // 지난달 용돈
  const { data: prevAllowance } = trpc.allowance.getByMonth.useQuery(
    { month: prevMonth, memberId },
    { enabled: !!memberId }
  );
  // 용돈 히스토리
  const { data: allowanceHistory = [] } = trpc.allowance.getHistory.useQuery({ memberId });
  // 버프/너프 메시지 (이번달)
  const { data: currentAdjustments = [] } = trpc.allowanceAdjustment.getByMemberAndMonth.useQuery(
    { month: currentMonth, memberId },
    { enabled: !!memberId }
  );
  // 버프/너프 메시지 (지난달)
  const { data: prevAdjustments = [] } = trpc.allowanceAdjustment.getByMemberAndMonth.useQuery(
    { month: prevMonth, memberId },
    { enabled: !!memberId }
  );

  // 멤버별 월간 DDC 집계 (중복 제거)
  const calcMonthlyTimes = (month: string) => {
    return FAMILY_MEMBERS.map(m => {
      const memberRecords = ddcRecords.filter(d => d.memberId === m.id && d.date.startsWith(month));
      const uniqueRecords = new Map<string, typeof ddcRecords[0]>();
      memberRecords.forEach(record => {
        const existing = uniqueRecords.get(record.date);
        if (!existing || new Date(record.updatedAt) > new Date(existing.updatedAt)) {
          uniqueRecords.set(record.date, record);
        }
      });
      const totalTime = Array.from(uniqueRecords.values()).reduce((sum, d) => sum + d.screenTime, 0);
      return { memberId: m.id, total: totalTime };
    }).sort((a, b) => a.total - b.total);
  };

  const currentMonthTimes = useMemo(() => calcMonthlyTimes(currentMonth), [ddcRecords, currentMonth]);
  const prevMonthTimes = useMemo(() => calcMonthlyTimes(prevMonth), [ddcRecords, prevMonth]);

  const currentRanking = currentMonthTimes.findIndex(r => r.memberId === memberId) + 1;
  const prevRanking = prevMonthTimes.findIndex(r => r.memberId === memberId) + 1;
  const currentScreenTime = currentMonthTimes.find(r => r.memberId === memberId)?.total || 0;
  const prevScreenTime = prevMonthTimes.find(r => r.memberId === memberId)?.total || 0;

  // 참여 일수 계산
  const currentParticipationDays = useMemo(() => {
    const uniqueDates = new Set(
      ddcRecords.filter(d => d.memberId === memberId && d.date.startsWith(currentMonth)).map(d => d.date)
    );
    return uniqueDates.size;
  }, [ddcRecords, memberId, currentMonth]);

  const prevParticipationDays = useMemo(() => {
    const uniqueDates = new Set(
      ddcRecords.filter(d => d.memberId === memberId && d.date.startsWith(prevMonth)).map(d => d.date)
    );
    return uniqueDates.size;
  }, [ddcRecords, memberId, prevMonth]);

  // 1등 횟수 계산
  const firstPlaceCount = useMemo(() => {
    const months = new Set(ddcRecords.map(d => d.date.substring(0, 7)));
    let count = 0;
    months.forEach(month => {
      const monthlyTimes = calcMonthlyTimes(month);
      if (monthlyTimes[0]?.memberId === memberId && monthlyTimes[0].total > 0) count++;
    });
    return count;
  }, [ddcRecords, memberId]);

  // 누적 보상 계산
  const totalReward = useMemo(() => {
    return managerActivities
      .filter(a => a.managerId === memberId)
      .reduce((sum, a) => sum + (a.reward || 0), 0);
  }, [managerActivities, memberId]);

  // 최신 매니저 활동
  const latestActivity = useMemo(() => {
    return managerActivities
      .filter(a => a.managerId === memberId)
      .sort((a, b) => b.month.localeCompare(a.month))[0];
  }, [managerActivities, memberId]);

  // RCR 기록
  const memberRcrRecords = useMemo(() => {
    return rcrRecords.filter(r => r.memberId === memberId).sort((a, b) => b.date.localeCompare(a.date));
  }, [rcrRecords, memberId]);

  // 활동 일지
  const memberActivityLogs = useMemo(() => {
    return activityLogs.filter(l => l.memberId === memberId).sort((a, b) => b.date.localeCompare(a.date));
  }, [activityLogs, memberId]);

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader><CardTitle>프로필을 찾을 수 없습니다</CardTitle></CardHeader>
          <CardContent><Link href="/"><Button>홈으로 돌아가기</Button></Link></CardContent>
        </Card>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}시간 ${m}분` : `${m}분`;
  };

  const rankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  };

  const renderAllowanceCard = (
    month: string,
    allowance: typeof currentAllowance,
    adjustments: typeof currentAdjustments,
    label: string
  ) => {
    const isSettled = !!allowance;
    return (
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-600" />
              <CardTitle className="text-base">{label} 용돈</CardTitle>
            </div>
            <Badge variant={isSettled ? "default" : "outline"}>{isSettled ? "정산완료" : "TBD"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isSettled ? (
            <>
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {allowance!.finalAllowance}만원
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {allowance!.breakdownFormula || `기본 ${allowance!.baseAllowance}만원 + 상금 ${allowance!.bonus}만원 - 벌금 ${allowance!.penalty}만원`}
                </p>
                {allowance!.customMessage && (
                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-900 dark:text-amber-100 whitespace-pre-wrap">
                      {allowance!.customMessage}
                    </p>
                  </div>
                )}
              </div>
              {/* 버프/너프 메시지 */}
              {adjustments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {adjustments.map((adj: any) => (
                    <div
                      key={adj.id}
                      className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                        adj.amount > 0
                          ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                          : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                      }`}
                    >
                      {adj.amount > 0 ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
                      <span>{adj.message} ({adj.amount > 0 ? '+' : ''}{adj.amount}만원)</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-muted-foreground mb-1">TBD</div>
              <p className="text-xs text-muted-foreground">월말 평가 후 확정</p>
              {/* 버프/너프 메시지 (정산 전에도 표시) */}
              {adjustments.length > 0 && (
                <div className="mt-3 space-y-2 text-left">
                  {adjustments.map((adj: any) => (
                    <div
                      key={adj.id}
                      className={`flex items-center gap-2 text-sm p-2 rounded-lg ${
                        adj.amount > 0
                          ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                          : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-300'
                      }`}
                    >
                      {adj.amount > 0 ? <TrendingUp className="w-4 h-4 flex-shrink-0" /> : <TrendingDown className="w-4 h-4 flex-shrink-0" />}
                      <span>{adj.message} ({adj.amount > 0 ? '+' : ''}{adj.amount}만원)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl relative"
            style={{ backgroundColor: `${member.color}20`, border: `3px solid ${member.color}` }}
          >
            {member.avatar}
            {currentRanking === 1 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-900" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{member.nickname}</h1>
              {currentRanking === 1 && <span className="text-3xl">🥇</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={member.role === 'parent' ? 'default' : 'secondary'} className="text-base">
                {member.role === 'parent' ? '부모' : '자녀'}
              </Badge>
              {firstPlaceCount > 0 && (
                <span className="text-sm text-muted-foreground">🏆 1등 {firstPlaceCount}회</span>
              )}
            </div>
          </div>
        </div>

        {/* DDC 순위 - 이번달 + 지난달 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 이번달 DDC */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-primary" />
                <CardTitle>{currentMonth} DDC 순위</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2" style={{ color: member.color }}>
                {rankEmoji(currentRanking)}
              </div>
              <p className="text-muted-foreground">총 스크린타임: {formatTime(currentScreenTime)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">참여 {currentParticipationDays}일</span>
              </div>
            </CardContent>
          </Card>

          {/* 지난달 DDC */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-muted-foreground" />
                <CardTitle>{prevMonth} DDC 순위</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2 text-muted-foreground">
                {rankEmoji(prevRanking)}
              </div>
              <p className="text-muted-foreground">총 스크린타임: {formatTime(prevScreenTime)}</p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">참여 {prevParticipationDays}일</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 용돈 - 이번달 + 지난달 (자녀만) */}
        {member.role === 'student' && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {renderAllowanceCard(currentMonth, currentAllowance, currentAdjustments, currentMonth)}
            {renderAllowanceCard(prevMonth, prevAllowance, prevAdjustments, prevMonth)}
          </div>
        )}

        {/* 매니저 활동 기록 (자녀만) */}
        {member.role === 'student' && latestActivity && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <CardTitle>매니저 활동 기록 ({latestActivity.month})</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{latestActivity.month} 매니저 활동</span>
                  <Badge className="text-lg px-4 py-2" variant="default">
                    보상: {latestActivity.reward}만원
                  </Badge>
                </div>
                <div className="space-y-4">
                  {[
                    { label: '기상 관리', count: latestActivity.wakeupCount },
                    { label: '학원 출석', count: latestActivity.academyCount },
                    { label: '숙제 독려', count: latestActivity.homeworkCount },
                    { label: '수면 관리', count: latestActivity.sleepCount },
                    { label: '월말 결산', count: latestActivity.settlementCount, max: 1 },
                    { label: '활동 평가', count: latestActivity.evaluationCount, max: 1 },
                  ].map(({ label, count, max = 31 }) => (
                    <div key={label}>
                      <div className="flex justify-between mb-2">
                        <span>{label}</span>
                        <span className="font-semibold">{count}/{max}일</span>
                      </div>
                      <Progress value={(count / max) * 100} />
                    </div>
                  ))}
                </div>
                <div className="bg-accent/10 p-4 rounded-lg border-2 border-accent">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">가족 평가</p>
                    <p className="text-3xl font-bold">
                      O표 {latestActivity.oVotes}개 → {latestActivity.reward}만원
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 용돈 변동 내역 (자녀만) */}
        {member.role === 'student' && allowanceHistory.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-600" />
                <CardTitle>용돈 변동 내역</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allowanceHistory.map((record) => (
                  <div key={record.id} className="p-4 border-2 rounded-lg hover:bg-accent/5 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold">{record.month}</span>
                      <span className="text-2xl font-bold text-amber-600">{record.finalAllowance}만원</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">기본 용돈</p>
                        <p className="font-semibold">{record.baseAllowance}만원</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">상금</p>
                        <p className="font-semibold text-green-600">+{record.bonus}만원</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">벌금</p>
                        <p className="font-semibold text-red-600">-{record.penalty}만원</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* RCR Records */}
        {memberRcrRecords.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <CardTitle>RCR 기록</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memberRcrRecords.slice(0, 5).map((rcr) => {
                  const cardLabels: Record<string, string> = {
                    yellow: '🟨 옐로우카드', red: '🟥 레드카드',
                    double_red: '🟥🟥 더블레드', triple_red: '🟥🟥🟥 트리플레드',
                    quadro_red: '🟥🟥🟥🟥 쿼드로레드', green: '🟩 그린카드',
                    double_green: '🟩🟩 더블그린', triple_green: '🟩🟩🟩 트리플그린',
                    quadro_green: '🟩🟩🟩🟩 쿼드로그린', golden: '🏆 골든카드'
                  };
                  const isPenalty = ['yellow', 'red', 'double_red', 'triple_red', 'quadro_red'].includes(rcr.cardType);
                  return (
                    <div key={rcr.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{rcr.date}</span>
                        <Badge variant={isPenalty ? "destructive" : "default"}>
                          {cardLabels[rcr.cardType] || rcr.cardType}
                        </Badge>
                      </div>
                      <p className="text-sm">{rcr.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">적용자: {rcr.appliedBy}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Logs */}
        {memberActivityLogs.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <CardTitle>활동 일지</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {memberActivityLogs.slice(0, 5).map((log) => {
                  const typeLabels: Record<string, string> = {
                    tardiness: '지각', absence: '결석',
                    homework_incomplete: '숙제 미완료', rule_violation: '규칙 위반', other: '기타'
                  };
                  return (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{log.date}</span>
                        <Badge variant="outline">{typeLabels[log.activityType] || log.activityType}</Badge>
                      </div>
                      <p className="text-sm">{log.comment}</p>
                      <p className="text-xs text-muted-foreground mt-1">기록자: {log.recordedBy}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
