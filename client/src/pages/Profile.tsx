import { useState, useEffect, useMemo } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Calendar, Target, Award, AlertTriangle } from "lucide-react";
import { FAMILY_MEMBERS } from "@/types/family";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const memberId = params?.id || '';
  
  const member = FAMILY_MEMBERS.find(m => m.id === memberId);
  
  // 데이터베이스에서 모든 데이터 불러오기
  const { data: ddcRecords = [] } = trpc.ddc.getAll.useQuery();
  const { data: rcrRecords = [] } = trpc.rcr.getAll.useQuery();
  const { data: activityLogs = [] } = trpc.managerActivityLog.getAll.useQuery();
  const { data: managerActivities = [] } = trpc.managerActivity.getAll.useQuery();
  
  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>프로필을 찾을 수 없습니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 현재 월 DDC 순위 계산
  const currentMonth = '2026-02';
  const memberTimes = useMemo(() => {
    const times = FAMILY_MEMBERS.map(m => {
      const totalTime = ddcRecords
        .filter(d => d.memberId === m.id && d.date.startsWith(currentMonth))
        .reduce((sum, d) => sum + d.screenTime, 0);
      return { memberId: m.id, total: totalTime };
    });
    times.sort((a, b) => a.total - b.total);
    return times;
  }, [ddcRecords]);
  
  const memberRanking = memberTimes.findIndex(r => r.memberId === memberId) + 1;
  const memberScreenTime = memberTimes.find(r => r.memberId === memberId)?.total || 0;
  
  // 참여 일수 계산 (실제 DDC 기록이 있는 날짜 수)
  const participationDays = useMemo(() => {
    const uniqueDates = new Set(
      ddcRecords
        .filter(d => d.memberId === memberId && d.date.startsWith(currentMonth))
        .map(d => d.date)
    );
    return uniqueDates.size;
  }, [ddcRecords, memberId]);
  
  // 1등 횟수 계산 (월별로 1등인 횟수)
  const firstPlaceCount = useMemo(() => {
    const months = new Set(ddcRecords.map(d => d.date.substring(0, 7)));
    let count = 0;
    
    months.forEach(month => {
      const monthlyTimes = FAMILY_MEMBERS.map(m => {
        const totalTime = ddcRecords
          .filter(d => d.memberId === m.id && d.date.startsWith(month))
          .reduce((sum, d) => sum + d.screenTime, 0);
        return { memberId: m.id, total: totalTime };
      });
      monthlyTimes.sort((a, b) => a.total - b.total);
      if (monthlyTimes[0]?.memberId === memberId && monthlyTimes[0].total > 0) {
        count++;
      }
    });
    
    return count;
  }, [ddcRecords, memberId]);
  
  const bronzeStars = Math.floor(firstPlaceCount / 6);
  const silverStars = Math.floor(firstPlaceCount / 6);
  const remainingWins = firstPlaceCount % 6;

  // 누적 보상 계산 (매니저 활동 보상 합계)
  const totalReward = useMemo(() => {
    return managerActivities
      .filter(a => a.managerId === memberId)
      .reduce((sum, a) => sum + (a.reward || 0), 0);
  }, [managerActivities, memberId]);

  // 매니저 활동 기록 (최신)
  const latestActivity = useMemo(() => {
    const activities = managerActivities
      .filter(a => a.managerId === memberId)
      .sort((a, b) => b.month.localeCompare(a.month));
    return activities[0];
  }, [managerActivities, memberId]);
  
  // 이 구성원의 RCR 기록
  const memberRcrRecords = useMemo(() => {
    return rcrRecords
      .filter(r => r.memberId === memberId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [rcrRecords, memberId]);
  
  // 이 구성원의 활동 일지
  const memberActivityLogs = useMemo(() => {
    return activityLogs
      .filter(l => l.memberId === memberId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activityLogs, memberId]);
  
  // 최근 활동 통합 (DDC, RCR, 활동 일지)
  const recentActivities = useMemo(() => {
    const activities: Array<{ date: string; type: string; content: string; variant: 'default' | 'destructive' | 'outline' }> = [];
    
    // DDC 기록
    ddcRecords
      .filter(d => d.memberId === memberId)
      .slice(0, 3)
      .forEach(d => {
        activities.push({
          date: d.date,
          type: 'DDC',
          content: `스크린타임 ${Math.floor(d.screenTime / 60)}시간 ${d.screenTime % 60}분 기록`,
          variant: 'outline'
        });
      });
    
    // RCR 기록
    memberRcrRecords.slice(0, 3).forEach(r => {
      const levelLabels = {
        minor: '경미',
        moderate: '보통',
        major: '중대',
        maximum: '최대'
      };
      activities.push({
        date: r.date,
        type: 'RCR',
        content: `${levelLabels[r.level]} - ${r.reason}`,
        variant: 'destructive'
      });
    });
    
    // 활동 일지
    memberActivityLogs.slice(0, 3).forEach(l => {
      const typeLabels = {
        tardiness: '지각',
        absence: '결석',
        homework_incomplete: '숙제 미완료',
        rule_violation: '규칙 위반',
        other: '기타'
      };
      activities.push({
        date: l.date,
        type: '활동',
        content: `${typeLabels[l.activityType as keyof typeof typeLabels]} - ${l.comment.substring(0, 30)}${l.comment.length > 30 ? '...' : ''}`,
        variant: 'default'
      });
    });
    
    // 날짜순 정렬
    activities.sort((a, b) => b.date.localeCompare(a.date));
    
    return activities.slice(0, 10);
  }, [ddcRecords, memberRcrRecords, memberActivityLogs, memberId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
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
            {memberRanking === 1 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                <Trophy className="w-6 h-6 text-yellow-900" />
              </div>
            )}
            {memberRanking === 2 && (
              <div className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-2 shadow-lg">
                <Award className="w-6 h-6 text-gray-700" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{member.nickname}</h1>
              {memberRanking === 1 && <span className="text-3xl">🥇</span>}
              {memberRanking === 2 && <span className="text-3xl">🥈</span>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={member.role === 'parent' ? 'default' : 'secondary'} className="text-base">
                {member.role === 'parent' ? '감사' : '팀원'}
              </Badge>
              {memberRanking === 1 && firstPlaceCount > 0 && (
                <div className="flex items-center gap-1">
                  {Array.from({ length: bronzeStars }).map((_, i) => (
                    <span key={`bronze-${i}`} className="text-xl" title="브론즈별">🥉</span>
                  ))}
                  {Array.from({ length: silverStars }).map((_, i) => (
                    <span key={`silver-${i}`} className="text-xl" title="실버별">🥈</span>
                  ))}
                  {Array.from({ length: remainingWins }).map((_, i) => (
                    <span key={`star-${i}`} className="text-xl" title="1등 횟수">⭐</span>
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">({firstPlaceCount}회 1등)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DDC Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-primary" />
                <CardTitle>2월 DDC 순위</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2" style={{ color: member.color }}>
                {memberRanking > 0 ? `${memberRanking}등` : '-'}
              </div>
              <p className="text-muted-foreground">
                총 스크린타임: {Math.floor(memberScreenTime / 60)}시간 {memberScreenTime % 60}분
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                <CardTitle>참여 일수</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2" style={{ color: member.color }}>
                {participationDays}일
              </div>
              <p className="text-muted-foreground">2월 현재까지</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-primary" />
                <CardTitle>누적 보상</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-2" style={{ color: member.color }}>
                {totalReward > 0 ? `+${totalReward}만원` : '0원'}
              </div>
              <p className="text-muted-foreground">2026년 누적</p>
            </CardContent>
          </Card>
        </div>

        {/* Manager Activities (학생만) */}
        {member.role === 'student' && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                <CardTitle>매니저 활동 기록</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {latestActivity ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {latestActivity.month} 매니저 활동
                    </span>
                    <Badge className="text-lg px-4 py-2" variant="default">
                      보상: {latestActivity.reward}만원
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>기상 관리</span>
                        <span className="font-semibold">{latestActivity.wakeupCount}/31일</span>
                      </div>
                      <Progress value={(latestActivity.wakeupCount / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>학원 출석</span>
                        <span className="font-semibold">{latestActivity.academyCount}/31일</span>
                      </div>
                      <Progress value={(latestActivity.academyCount / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>숙제 독려</span>
                        <span className="font-semibold">{latestActivity.homeworkCount}/31일</span>
                      </div>
                      <Progress value={(latestActivity.homeworkCount / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>수면 관리</span>
                        <span className="font-semibold">{latestActivity.sleepCount}/31일</span>
                      </div>
                      <Progress value={(latestActivity.sleepCount / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>월말 결산</span>
                        <span className="font-semibold">{latestActivity.settlementCount}/1회</span>
                      </div>
                      <Progress value={latestActivity.settlementCount * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>활동 평가</span>
                        <span className="font-semibold">{latestActivity.evaluationCount}/1회</span>
                      </div>
                      <Progress value={latestActivity.evaluationCount * 100} />
                    </div>
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
              ) : (
                <p className="text-muted-foreground">아직 매니저 활동 기록이 없습니다.</p>
              )}
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
                  const levelLabels = {
                    minor: '경미',
                    moderate: '보통',
                    major: '중대',
                    maximum: '최대'
                  };
                  const levelColors = {
                    minor: 'bg-yellow-100 text-yellow-800',
                    moderate: 'bg-orange-100 text-orange-800',
                    major: 'bg-red-100 text-red-800',
                    maximum: 'bg-purple-100 text-purple-800'
                  };
                  return (
                    <div key={rcr.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{rcr.date}</span>
                        <Badge className={levelColors[rcr.level]}>
                          {levelLabels[rcr.level]}
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
                  const typeLabels = {
                    tardiness: '지각',
                    absence: '결석',
                    homework_incomplete: '숙제 미완료',
                    rule_violation: '규칙 위반',
                    other: '기타'
                  };
                  return (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{log.date}</span>
                        <Badge variant="outline">
                          {typeLabels[log.activityType as keyof typeof typeLabels]}
                        </Badge>
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <span className="text-sm text-muted-foreground mr-2">{activity.date}</span>
                      <span className="text-sm">{activity.content}</span>
                    </div>
                    <Badge variant={activity.variant}>{activity.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">아직 활동 기록이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
