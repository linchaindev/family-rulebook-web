import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FAMILY_MEMBERS } from "@/types/family";

export default function ManagerEvaluation() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, 'good' | 'bad'>>({});
  const [isComplete, setIsComplete] = useState(false);

  // 투표 가능한 가족 구성원 (학생만, 매니저는 자신을 평가하지 않음)
  const voters = FAMILY_MEMBERS.filter(m => m.role === 'student');
  
  const { data: monthlyManager } = trpc.monthlyManager.get.useQuery({ month: selectedMonth });
  const { data: existingEvaluations = [], refetch: refetchEvaluations } = trpc.managerEvaluation.getByMonth.useQuery({ month: selectedMonth });
  const { data: allEvaluations = [] } = trpc.managerEvaluation.getAll.useQuery();
  
  const submitVoteMutation = trpc.managerEvaluation.submitVote.useMutation({
    onSuccess: () => {
      refetchEvaluations();
    },
  });

  const currentVoter = voters[currentVoterIndex];
  const hasVoted = currentVoter && votes[currentVoter.id] !== undefined;
  const allVoted = voters.every(v => votes[v.id] !== undefined);

  const handleVote = (vote: 'good' | 'bad') => {
    if (!currentVoter) return;
    
    setVotes(prev => ({
      ...prev,
      [currentVoter.id]: vote,
    }));
  };

  const handleNext = () => {
    if (currentVoterIndex < voters.length - 1) {
      setCurrentVoterIndex(prev => prev + 1);
    } else if (allVoted) {
      handleSubmitAll();
    }
  };

  const handleSubmitAll = async () => {
    if (!monthlyManager) {
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
      
      setIsComplete(true);
      toast.success('모든 투표가 완료되었습니다!');
    } catch (error) {
      toast.error('투표 제출에 실패했습니다.');
    }
  };

  // 월별 평가 결과 집계
  const monthlyResults = allEvaluations.reduce((acc, evaluation) => {
    const key = `${evaluation.month}-${evaluation.managerId}`;
    if (!acc[key]) {
      acc[key] = {
        month: evaluation.month,
        managerId: evaluation.managerId,
        goodVotes: 0,
        badVotes: 0,
        totalVotes: 0,
      };
    }
    acc[key].totalVotes++;
    if (evaluation.vote === 'good') {
      acc[key].goodVotes++;
    } else {
      acc[key].badVotes++;
    }
    return acc;
  }, {} as Record<string, { month: string; managerId: string; goodVotes: number; badVotes: number; totalVotes: number }>);

  // 누적 통계
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                이미 투표가 완료되었습니다
              </CardTitle>
              <CardDescription>
                {selectedMonth}월 매니저 평가가 이미 완료되었습니다. 아래에서 결과를 확인하세요.
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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container py-8 max-w-4xl">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              룰북으로 돌아가기
            </Button>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                투표가 완료되었습니다!
              </CardTitle>
              <CardDescription>
                {selectedMonth}월 매니저 평가가 성공적으로 저장되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">투표 결과</h3>
                  <div className="space-y-2">
                    {voters.map((voter) => (
                      <div key={voter.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{voter.avatar}</span>
                          <span>{voter.name}</span>
                        </div>
                        <Badge variant={votes[voter.id] === 'good' ? 'default' : 'destructive'}>
                          {votes[voter.id] === 'good' ? '👍 잘했음' : '👎 못했음'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={() => window.location.reload()}>
                  결과 확인하기
                </Button>
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
                {selectedMonth}월 매니저를 먼저 지정해주세요.
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

        <Card className="border-2 border-primary">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>월말 매니저 평가</CardTitle>
                <CardDescription>
                  {selectedMonth}월 매니저: {manager?.avatar} {manager?.name}
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
                      ? 'border-green-500 bg-green-50'
                      : 'border-muted'
                  } transition-all`}
                >
                  {votes[voter.id] ? '✓' : voter.avatar}
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
                  className="h-32 flex-col gap-2 border-2 hover:border-green-500 hover:bg-green-50"
                  onClick={() => handleVote('good')}
                >
                  <ThumbsUp className="w-12 h-12 text-green-600" />
                  <span className="text-lg font-semibold">잘했음</span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-32 flex-col gap-2 border-2 hover:border-red-500 hover:bg-red-50"
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
                  {currentVoterIndex < voters.length - 1 ? '다음 사람' : '투표 제출'}
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
