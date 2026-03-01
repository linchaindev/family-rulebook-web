import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingDown, AlertTriangle, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { FAMILY_MEMBERS } from "@/types/family";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { data: ddcRecords = [] } = trpc.ddc.getAll.useQuery();
  const { data: rcrRecords = [] } = trpc.rcr.getAll.useQuery();

  // 현재 날짜 기준으로 이번달과 지난달 계산
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1;
  const currentMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;
  const prevMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
  const prevYear = currentMonthNum === 1 ? currentYear - 1 : currentYear;
  const prevMonth = `${prevYear}-${String(prevMonthNum).padStart(2, '0')}`;

  // 멤버별 월간 DDC 집계 (중복 제거: 같은 날짜 중 최신 레코드만)
  const calcMonthlyTimes = (month: string) => {
    return FAMILY_MEMBERS.map(member => {
      const memberRecords = ddcRecords.filter(d => d.memberId === member.id && d.date.startsWith(month));
      const uniqueRecords = new Map<string, typeof ddcRecords[0]>();
      memberRecords.forEach(record => {
        const existing = uniqueRecords.get(record.date);
        if (!existing || new Date(record.updatedAt) > new Date(existing.updatedAt)) {
          uniqueRecords.set(record.date, record);
        }
      });
      const totalTime = Array.from(uniqueRecords.values()).reduce((sum, d) => sum + d.screenTime, 0);
      return { ...member, totalTime };
    }).sort((a, b) => a.totalTime - b.totalTime);
  };

  const currentMonthTimes = useMemo(() => calcMonthlyTimes(currentMonth), [ddcRecords, currentMonth]);
  const prevMonthTimes = useMemo(() => calcMonthlyTimes(prevMonth), [ddcRecords, prevMonth]);

  // 월별 DDC 통계 계산 (차트용)
  const monthlyStats: Record<string, Record<string, number>> = {};
  ddcRecords.forEach(record => {
    const month = record.date.substring(0, 7);
    if (!monthlyStats[month]) monthlyStats[month] = {};
    if (!monthlyStats[month][record.memberId]) monthlyStats[month][record.memberId] = 0;
    monthlyStats[month][record.memberId] += record.screenTime;
  });

  const chartData = Object.entries(monthlyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, members]) => ({
      month: month.substring(5, 7) + '월',
      ...Object.fromEntries(
        Object.entries(members).map(([memberId, time]) => {
          const member = FAMILY_MEMBERS.find(m => m.id === memberId);
          return [member?.name || memberId, Math.round(time / 60 * 10) / 10];
        })
      ),
    }));

  // RCR 통계
  const rcrStats = {
    penalty: rcrRecords.filter(r => ['yellow', 'red', 'double_red', 'triple_red', 'quadro_red'].includes(r.cardType)).length,
    reward: rcrRecords.filter(r => ['green', 'double_green', 'triple_green', 'quadro_green', 'golden'].includes(r.cardType)).length,
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">가족 전투 지휘부</h1>
          <p className="text-muted-foreground">스크린 타임 전쟁의 실시간 전황과 RCR 제재 현황을 모니터링합니다</p>
        </div>

        {/* 요약 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>이번달 평균 스크린타임</CardTitle>
                  <CardDescription>{currentMonth}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const total = currentMonthTimes.reduce((sum, m) => sum + m.totalTime, 0);
                const avg = currentMonthTimes.length > 0 ? total / currentMonthTimes.length : 0;
                return (
                  <div className="text-4xl font-bold text-primary">{Math.round(avg / 60 * 10) / 10}시간</div>
                );
              })()}
              <p className="text-sm text-muted-foreground mt-2">가족 평균</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle>RCR 적용 건수</CardTitle>
                  <CardDescription>2026년 누적</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-destructive">{rcrRecords.length}건</div>
              <p className="text-sm text-muted-foreground mt-2">벌칙 {rcrStats.penalty}건 / 보상 {rcrStats.reward}건</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <CardTitle>지난달 DDC 1등</CardTitle>
                  <CardDescription>{prevMonth}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const winner = prevMonthTimes[0];
                return (
                  <>
                    <div className="text-4xl font-bold text-accent">{winner?.avatar} {winner?.name}</div>
                    <p className="text-sm text-muted-foreground mt-2">{formatTime(winner?.totalTime || 0)}</p>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* 이번달 + 지난달 DDC 순위 나란히 */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* 이번달 순위 */}
          <Card>
            <CardHeader>
              <CardTitle>{currentMonth} DDC 순위</CardTitle>
              <CardDescription>스크린타임 적을수록 1등 (현재까지 누적)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentMonthTimes.map((member, index) => (
                  <Link key={member.id} href={`/profile/${member.id}`}>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-muted-foreground w-8">{rankEmoji(index + 1)}</div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${member.color}20`, border: `2px solid ${member.color}` }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{formatTime(member.totalTime)}</p>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? 'default' : index === FAMILY_MEMBERS.length - 1 ? 'destructive' : 'secondary'}>
                        {index + 1}위
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 지난달 순위 */}
          <Card>
            <CardHeader>
              <CardTitle>{prevMonth} DDC 순위</CardTitle>
              <CardDescription>지난달 최종 결과</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prevMonthTimes.map((member, index) => (
                  <Link key={member.id} href={`/profile/${member.id}`}>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-muted-foreground w-8">{rankEmoji(index + 1)}</div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: `${member.color}20`, border: `2px solid ${member.color}` }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{formatTime(member.totalTime)}</p>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? 'default' : index === FAMILY_MEMBERS.length - 1 ? 'destructive' : 'secondary'}>
                        {index + 1}위
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 월별 DDC 스크린타임 차트 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>월별 스크린타임 통계</CardTitle>
            <CardDescription>가족 구성원별 월간 스크린타임 비교 (단위: 시간)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: '시간', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {FAMILY_MEMBERS.map((member) => (
                  <Bar
                    key={member.id}
                    dataKey={member.name.split(' ')[0]}
                    fill={member.color}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* RCR 적용 현황 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>RCR 적용 현황</CardTitle>
            <CardDescription>최근 RCR 카드 적용 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rcrRecords.slice(0, 5).map((record, index) => {
                const member = FAMILY_MEMBERS.find(m => m.id === record.memberId);
                const cardLabels: Record<string, string> = {
                  yellow: '🟨 옐로우카드',
                  red: '🟥 레드카드',
                  double_red: '🟥🟥 더블레드',
                  triple_red: '🟥🟥🟥 트리플레드',
                  quadro_red: '🟥🟥🟥🟥 쿼드로레드',
                  green: '🟩 그린카드',
                  double_green: '🟩🟩 더블그린',
                  triple_green: '🟩🟩🟩 트리플그린',
                  quadro_green: '🟩🟩🟩🟩 쿼드로그린',
                  golden: '🏆 골든카드'
                };
                const isPenalty = ['yellow', 'red', 'double_red', 'triple_red', 'quadro_red'].includes(record.cardType);
                const cardColor = isPenalty ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' : 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';

                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${cardColor}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{member?.avatar}</span>
                        <div>
                          <p className="font-semibold">{member?.name}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                      </div>
                      <Badge variant={isPenalty ? "destructive" : "default"}>{cardLabels[record.cardType] || record.cardType}</Badge>
                    </div>
                    <p className="text-sm"><strong>사유:</strong> {record.reason}</p>
                    <p className="text-sm text-muted-foreground">적용자: {record.appliedBy}</p>
                  </div>
                );
              })}
              {rcrRecords.length === 0 && (
                <p className="text-muted-foreground text-center py-8">아직 RCR 기록이 없습니다.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
