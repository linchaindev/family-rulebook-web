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
  
  // 월별 DDC 통계 계산
  const monthlyStats: Record<string, Record<string, number>> = {};
  ddcRecords.forEach(record => {
    const month = record.date.substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) monthlyStats[month] = {};
    if (!monthlyStats[month][record.memberId]) monthlyStats[month][record.memberId] = 0;
    monthlyStats[month][record.memberId] += record.screenTime;
  });
  
  // 차트 데이터 변환
  const chartData = Object.entries(monthlyStats).map(([month, members]) => ({
    month: month.substring(5, 7) + '월',
    ...Object.fromEntries(
      Object.entries(members).map(([memberId, time]) => {
        const member = FAMILY_MEMBERS.find(m => m.id === memberId);
        return [member?.name.split(' ')[0] || memberId, Math.round(time / 60)]; // 시간 단위로 변환
      })
    ),
  }));

  // RCR 레벨별 통계
  const rcrStats = {
    minor: rcrRecords.filter(r => r.level === 'minor').length,
    moderate: rcrRecords.filter(r => r.level === 'moderate').length,
    major: rcrRecords.filter(r => r.level === 'major').length,
    maximum: rcrRecords.filter(r => r.level === 'maximum').length,
  };
  
  // 평균 스크린타임 계산 (2월)
  const currentMonth = '2026-02';
  const currentMonthData = ddcRecords.filter(r => r.date.startsWith(currentMonth));
  const avgScreenTime = currentMonthData.length > 0
    ? Math.round(currentMonthData.reduce((sum, r) => sum + r.screenTime, 0) / currentMonthData.length / 60 * 10) / 10
    : 0;

  const rcrChartData = [
    { level: '경미', count: rcrStats.minor, color: '#FFB6C1' },
    { level: '중등', count: rcrStats.moderate, color: '#FF6B6B' },
    { level: '중대', count: rcrStats.major, color: '#E74C3C' },
    { level: '최대', count: rcrStats.maximum, color: '#C0392B' },
  ];

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
          <h1 className="text-4xl font-bold mb-2">가족 대시보드</h1>
          <p className="text-muted-foreground">월별 DDC 통계와 RCR 적용 현황을 한눈에 확인하세요</p>
        </div>

        {/* 요약 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingDown className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>평균 스크린타임</CardTitle>
                  <CardDescription>2월 현재</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{avgScreenTime}시간</div>
              <p className="text-sm text-muted-foreground mt-2">실시간 데이터 기반</p>
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
              <p className="text-sm text-muted-foreground mt-2">경미 {rcrStats.minor} / 중등 {rcrStats.moderate} / 중대 {rcrStats.major}</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-accent" />
                <div>
                  <CardTitle>참여율</CardTitle>
                  <CardDescription>DDC 리포트 제출</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-accent">96%</div>
              <p className="text-sm text-muted-foreground mt-2">8일 중 7.7일 평균 제출</p>
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
            <CardDescription>레드카드 룰 위반 수위별 통계</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={rcrChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#E74C3C" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              <h3 className="font-semibold text-lg mb-4">최근 RCR 적용 내역</h3>
              {(() => {
                return rcrRecords.slice(0, 5).map((record, index) => {
                const member = FAMILY_MEMBERS.find(m => m.id === record.memberId);
                const levelColors = {
                  minor: 'bg-red-50 border-red-200',
                  moderate: 'bg-red-100 border-red-300',
                  major: 'bg-red-200 border-red-400',
                  maximum: 'bg-red-300 border-red-500',
                };
                const levelLabels = {
                  minor: '경미',
                  moderate: '중등',
                  major: '중대',
                  maximum: '최대',
                };
                
                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${levelColors[record.level]}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{member?.avatar}</span>
                        <div>
                          <p className="font-semibold">{member?.name}</p>
                          <p className="text-sm text-muted-foreground">{record.date}</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{levelLabels[record.level]}</Badge>
                    </div>
                    <p className="text-sm"><strong>사유:</strong> {record.reason}</p>
                    <p className="text-sm text-muted-foreground">적용자: {record.appliedBy}</p>
                  </div>
                );
                });
              })()}
            </div>
          </CardContent>
        </Card>

        {/* 개인별 DDC 순위 */}
        <Card>
          <CardHeader>
            <CardTitle>2월 DDC 순위</CardTitle>
            <CardDescription>현재까지 누적 스크린타임 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                // 멤버별 2월 총 스크린타임 계산
                const memberTimes = FAMILY_MEMBERS.map(member => {
                  const totalTime = ddcRecords
                    .filter(d => d.memberId === member.id && d.date.startsWith('2026-02'))
                    .reduce((sum, d) => sum + d.screenTime, 0);
                  return { ...member, totalTime };
                });
                // 스크린타임 오름차순 정렬 (적을수록 1등)
                memberTimes.sort((a, b) => a.totalTime - b.totalTime);
                
                return memberTimes.map((member, index) => {
                  const hours = Math.floor(member.totalTime / 60);
                  const minutes = member.totalTime % 60;
                
                return (
                  <Link key={member.id} href={`/profile/${member.id}`}>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-muted-foreground w-8">
                          {index + 1}
                        </div>
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${member.color}20`, border: `2px solid ${member.color}` }}
                        >
                          {member.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {hours}시간 {minutes}분
                          </p>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? 'default' : index === FAMILY_MEMBERS.length - 1 ? 'destructive' : 'secondary'}>
                        {index === 0 ? '1등 🥇' : index === 1 ? '2등 🥈' : index === 2 ? '3등 🥉' : `${index + 1}등`}
                      </Badge>
                    </div>
                  </Link>
                );
                });
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
