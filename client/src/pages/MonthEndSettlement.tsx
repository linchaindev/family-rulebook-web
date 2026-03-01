import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Calculator, Trophy, TrendingUp, TrendingDown, Calendar, Award, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { FAMILY_MEMBERS } from "@/types/family";

export default function MonthEndSettlement() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // 세션 스토리지에서 인증 상태 확인
    return sessionStorage.getItem('auditor_authenticated') === 'true';
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // 세션 스토리지에서 월 정보 확인
    const storedMonth = sessionStorage.getItem('auditor_month');
    if (storedMonth) return storedMonth;
    // 월초(1~5일)에는 이전달 정산이 남아있을 가능성이 높으므로 이전달 표시
    const now = new Date();
    const day = now.getDate();
    if (day <= 5) {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [verifyAttempt, setVerifyAttempt] = useState(false);
  const verifyPasswordQuery = trpc.password.verifyAuditor.useQuery(
    { password },
    { enabled: verifyAttempt }
  );
  const getSettlementDataQuery = trpc.settlement.getMonthData.useQuery(
    { month: selectedMonth },
    { enabled: isAuthenticated }
  );
  const processSettlementMutation = trpc.settlement.processMonthEnd.useMutation();

  const handleVerify = () => {
    setVerifyAttempt(true);
  };
  
  // Handle verification result
  if (verifyPasswordQuery.data && verifyAttempt) {
    if (verifyPasswordQuery.data.valid && !isAuthenticated) {
      setIsAuthenticated(true);
      toast.success("✅ 인증 성공", {
        description: "월말 정산 페이지에 접속했습니다.",
      });
      setVerifyAttempt(false);
    } else if (!verifyPasswordQuery.data.valid && !isAuthenticated) {
      toast.error("❌ 인증 실패", {
        description: "비밀번호가 올바르지 않습니다.",
      });
      setVerifyAttempt(false);
    }
  }

  const handleProcessSettlement = async () => {
    try {
      await processSettlementMutation.mutateAsync({ month: selectedMonth });
      toast.success("✅ 정산 완료", {
        description: `${selectedMonth} 월말 정산이 완료되었습니다.`,
      });
      getSettlementDataQuery.refetch();
    } catch (error) {
      toast.error("❌ 정산 실패", {
        description: "정산 처리 중 오류가 발생했습니다.",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">월말 정산 시스템</CardTitle>
            <CardDescription>
              감사 비밀번호(6자리)를 입력하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">정산 월</Label>
              <Input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">감사 비밀번호</Label>
              <Input
                id="password"
                type="password"
                maxLength={6}
                placeholder="6자리 숫자"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerify();
                }}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleVerify}
              disabled={password.length !== 6 || verifyPasswordQuery.isLoading}
            >
              {verifyPasswordQuery.isLoading ? "확인 중..." : "접속하기"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const settlementData = getSettlementDataQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              월말 정산 시스템
            </h1>
            <p className="text-muted-foreground mt-1">
              {selectedMonth} 월말 자동 정산 및 보상/패널티 계산
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Calendar className="w-4 h-4 mr-2" />
            {selectedMonth}
          </Badge>
        </div>

        {getSettlementDataQuery.isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">데이터 로딩 중...</p>
            </CardContent>
          </Card>
        ) : !settlementData ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">정산 데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Settlement Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FAMILY_MEMBERS.filter((m: any) => m.role === "child").map((member: any) => {
                const memberData = settlementData.members.find((m: any) => m.memberId === member.id);
                if (!memberData) return null;

                return (
                  <Card key={member.id} className="relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span>{member.nickname}</span>
                        {memberData.ddcRank === 1 && (
                          <Badge className="bg-yellow-500 text-white">
                            <Trophy className="w-3 h-3 mr-1" />
                            1등
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* DDC 정보 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            총 스크린타임
                          </span>
                          <span className="font-mono">{Math.floor(memberData.totalScreenTime / 60)}h {memberData.totalScreenTime % 60}m</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">RCR 조정</span>
                          <span className={`font-mono ${memberData.rcrAdjustment > 0 ? 'text-red-500' : memberData.rcrAdjustment < 0 ? 'text-green-500' : ''}`}>
                            {memberData.rcrAdjustment > 0 ? '+' : ''}{Math.floor(memberData.rcrAdjustment / 60)}h {Math.abs(memberData.rcrAdjustment % 60)}m
                          </span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between font-semibold">
                          <span>최종 스크린타임</span>
                          <span className="font-mono">{Math.floor(memberData.finalScreenTime / 60)}h {memberData.finalScreenTime % 60}m</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">순위</span>
                          <Badge variant={memberData.ddcRank === 1 ? "default" : "secondary"}>
                            {memberData.ddcRank}위
                          </Badge>
                        </div>
                      </div>

                      <Separator />

                      {/* 용돈 정보 */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            기본 용돈
                          </span>
                          <span className="font-mono">{memberData.baseAllowance}만원</span>
                        </div>
                        {memberData.ddcBonus > 0 && (
                          <div className="flex items-center justify-between text-sm text-green-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              DDC 1등 상금
                            </span>
                            <span className="font-mono">+{memberData.ddcBonus}만원</span>
                          </div>
                        )}
                        {memberData.rcrBonus > 0 && (
                          <div className="flex items-center justify-between text-sm text-green-600">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              RCR 보상
                            </span>
                            <span className="font-mono">+{memberData.rcrBonus}만원</span>
                          </div>
                        )}
                        {memberData.rcrPenalty > 0 && (
                          <div className="flex items-center justify-between text-sm text-red-600">
                            <span className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              RCR 패널티
                            </span>
                            <span className="font-mono">-{memberData.rcrPenalty}만원</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex items-center justify-between font-semibold text-lg">
                          <span>최종 용돈</span>
                          <span className="font-mono text-primary">{memberData.finalAllowance}만원</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Manager Evaluation */}
            {settlementData.managerEvaluation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    매니저 평가 결과
                  </CardTitle>
                  <CardDescription>
                    {selectedMonth} 매니저: {FAMILY_MEMBERS.find((m: any) => m.id === settlementData.managerEvaluation?.managerId)?.nickname}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{settlementData.managerEvaluation.goodVotes}</div>
                      <div className="text-sm text-muted-foreground">잘했음 (O)</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">{settlementData.managerEvaluation.badVotes}</div>
                      <div className="text-sm text-muted-foreground">못했음 (X)</div>
                    </div>
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-3xl font-bold text-primary">{settlementData.managerEvaluation.reward}만원</div>
                      <div className="text-sm text-muted-foreground">매니저 보상</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Settlement Button */}
            <Card>
              <CardHeader>
                <CardTitle>정산 실행</CardTitle>
                <CardDescription>
                  위 계산 결과를 다음 달 용돈에 반영합니다. 이 작업은 한 번만 실행하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleProcessSettlement}
                  disabled={processSettlementMutation.isPending || settlementData.isProcessed}
                >
                  {settlementData.isProcessed ? "✅ 정산 완료됨" : processSettlementMutation.isPending ? "처리 중..." : "🚀 정산 실행하기"}
                </Button>
                {settlementData.isProcessed && (
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    이미 정산이 완료된 월입니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
