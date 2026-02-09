import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Calendar, Target, Award } from "lucide-react";
import { FAMILY_MEMBERS } from "@/types/family";
import { sampleDDCData, sampleManagerActivities, calculateDDCRankings } from "@/lib/sampleData";
import { Link } from "wouter";

export default function Profile() {
  const [, params] = useRoute("/profile/:id");
  const memberId = params?.id || '';
  
  const member = FAMILY_MEMBERS.find(m => m.id === memberId);
  
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
  const rankings = calculateDDCRankings(sampleDDCData, currentMonth);
  const memberRanking = rankings.findIndex(r => r.memberId === memberId) + 1;
  const memberScreenTime = rankings.find(r => r.memberId === memberId)?.total || 0;

  // 매니저 활동 기록
  const managerActivities = sampleManagerActivities.filter(a => a.managerId === memberId);
  const latestActivity = managerActivities[managerActivities.length - 1];

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
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{ backgroundColor: `${member.color}20`, border: `3px solid ${member.color}` }}
          >
            {member.avatar}
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">{member.name}</h1>
            <Badge variant={member.role === 'parent' ? 'default' : 'secondary'} className="text-base">
              {member.role === 'parent' ? '감사' : '팀원'}
            </Badge>
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
                {memberRanking}등
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
                8일
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
                +8만원
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
                        <span className="font-semibold">{latestActivity.missions.wakeup}/31일</span>
                      </div>
                      <Progress value={(latestActivity.missions.wakeup / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>학원 출석</span>
                        <span className="font-semibold">{latestActivity.missions.academy}/31일</span>
                      </div>
                      <Progress value={(latestActivity.missions.academy / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>숙제 독려</span>
                        <span className="font-semibold">{latestActivity.missions.homework}/31일</span>
                      </div>
                      <Progress value={(latestActivity.missions.homework / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>수면 관리</span>
                        <span className="font-semibold">{latestActivity.missions.sleep}/31일</span>
                      </div>
                      <Progress value={(latestActivity.missions.sleep / 31) * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>월말 결산</span>
                        <span className="font-semibold">{latestActivity.missions.settlement}/1회</span>
                      </div>
                      <Progress value={latestActivity.missions.settlement * 100} />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span>활동 평가</span>
                        <span className="font-semibold">{latestActivity.missions.evaluation}/1회</span>
                      </div>
                      <Progress value={latestActivity.missions.evaluation * 100} />
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>2026-02-08 DDC 리포트 제출</span>
                <Badge variant="outline">완료</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>2026-02-07 DDC 리포트 제출</span>
                <Badge variant="outline">완료</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>2026-02-06 DDC 리포트 제출</span>
                <Badge variant="outline">완료</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
