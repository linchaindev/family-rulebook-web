import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Shield, Trash2, Edit, Plus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FAMILY_MEMBERS } from "@/types/family";

export default function AuditorAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const verifyPasswordMutation = trpc.password.verifyAuditor.useQuery(
    { month: selectedMonth, password },
    { enabled: false }
  );

  const { data: ddcRecords = [], refetch: refetchDDC } = trpc.ddc.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const { data: rcrRecords = [], refetch: refetchRCR } = trpc.rcr.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const { data: managerActivities = [], refetch: refetchManager } = trpc.manager.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const { data: comments = [], refetch: refetchComments } = trpc.comments.getAll.useQuery(undefined, { enabled: isAuthenticated });

  const deleteDDCMutation = trpc.ddc.delete.useMutation({
    onSuccess: () => {
      toast.success('DDC 기록이 삭제되었습니다.');
      refetchDDC();
    },
  });

  const deleteRCRMutation = trpc.rcr.delete.useMutation({
    onSuccess: () => {
      toast.success('RCR 기록이 삭제되었습니다.');
      refetchRCR();
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      refetchComments();
    },
  });

  const handlePasswordSubmit = async () => {
    if (password.length !== 6) {
      toast.error('비밀번호는 6자리 숫자여야 합니다.');
      return;
    }
    
    const result = await verifyPasswordMutation.refetch();
    if (result.data?.valid) {
      setIsAuthenticated(true);
      toast.success('감사 인증되었습니다!');
    } else {
      toast.error('비밀번호가 올바르지 않습니다.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container py-8 max-w-md">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              룰북으로 돌아가기
            </Button>
          </Link>

          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>감사 관리 페이지</CardTitle>
                  <CardDescription>6자리 비밀번호를 입력하세요</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>대상 월</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>감사 비밀번호 (6자리)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="mt-2 text-center text-2xl tracking-widest"
                />
              </div>
              <Button onClick={handlePasswordSubmit} className="w-full" size="lg">
                <Lock className="w-4 h-4 mr-2" />
                인증하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">감사 관리 페이지</h1>
          </div>
          <p className="text-muted-foreground">모든 데이터베이스 기록을 조회, 수정, 삭제할 수 있습니다.</p>
        </div>

        <Tabs defaultValue="ddc" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ddc">DDC 기록</TabsTrigger>
            <TabsTrigger value="rcr">RCR 기록</TabsTrigger>
            <TabsTrigger value="manager">매니저 활동</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="ddc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>DDC 기록 관리 ({ddcRecords.length}개)</CardTitle>
                <CardDescription>스크린타임 기록을 조회하고 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ddcRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge>{record.date}</Badge>
                          <span className="font-medium">{record.memberId}</span>
                          <span className="text-muted-foreground">{record.screenTime}분</span>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            deleteDDCMutation.mutate({ id: record.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rcr" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RCR 기록 관리 ({rcrRecords.length}개)</CardTitle>
                <CardDescription>레드카드 기록을 조회하고 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rcrRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge>{record.date}</Badge>
                          <span className="font-medium">{record.memberId}</span>
                          <Badge variant="destructive">{record.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{record.reason}</p>
                        <p className="text-xs text-muted-foreground mt-1">적용자: {record.appliedBy}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            deleteRCRMutation.mutate({ id: record.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manager" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>매니저 활동 기록 ({managerActivities.length}개)</CardTitle>
                <CardDescription>매니저 활동 통계를 조회할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {managerActivities.map((activity) => (
                    <div key={activity.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{activity.month}</Badge>
                          <span className="font-bold">{activity.managerId}</span>
                        </div>
                        <Badge className="text-lg">{activity.reward}만원</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>기상: {activity.wakeupCount}회</div>
                        <div>학원: {activity.academyCount}회</div>
                        <div>숙제: {activity.homeworkCount}회</div>
                        <div>수면: {activity.sleepCount}회</div>
                        <div>결산: {activity.settlementCount}회</div>
                        <div>O표: {activity.oVotes}개</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>댓글 관리 ({comments.length}개)</CardTitle>
                <CardDescription>가족 댓글을 조회하고 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={comment.type === 'praise' ? 'default' : 'secondary'}>
                            {comment.type === 'praise' ? '칭찬' : '건의'}
                          </Badge>
                          <span className="text-sm font-medium">{comment.fromMember} → {comment.toMember}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{comment.date}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            deleteCommentMutation.mutate({ id: comment.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
