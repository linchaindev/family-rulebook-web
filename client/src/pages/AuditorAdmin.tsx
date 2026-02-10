import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Trash2, Edit, Plus } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FAMILY_MEMBERS } from "@/types/family";
import { formatMinutesToHoursAndMinutes } from "@/lib/timeUtils";

// 월별 매니저 지정 컴포넌트
function MonthlyManagerTab() {
  const [newMonth, setNewMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newManagerId, setNewManagerId] = useState('');
  
  const { data: monthlyManagers = [], refetch } = trpc.monthlyManager.getAll.useQuery();
  const setManagerMutation = trpc.monthlyManager.set.useMutation({
    onSuccess: () => {
      toast.success('매니저가 지정되었습니다!');
      refetch();
      setNewMonth('');
      setNewManagerId('');
    },
    onError: () => {
      toast.error('매니저 지정에 실패했습니다.');
    },
  });
  
  const handleSetManager = () => {
    if (!newMonth || !newManagerId) {
      toast.error('월과 매니저를 모두 선택해주세요.');
      return;
    }
    setManagerMutation.mutate({ month: newMonth, managerId: newManagerId });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매니저 지정</CardTitle>
        <CardDescription>각 월의 패밀리 매니저를 지정합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label>대상 월</Label>
            <Input
              type="month"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex-1">
            <Label>매니저 선택</Label>
            <Select value={newManagerId} onValueChange={setNewManagerId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="매니저 선택" />
              </SelectTrigger>
              <SelectContent>
                {FAMILY_MEMBERS.filter(m => m.role === 'student').map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.avatar} {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleSetManager} disabled={setManagerMutation.isPending}>
              지정하기
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">월별 매니저 목록</h3>
          {monthlyManagers.length === 0 ? (
            <p className="text-sm text-muted-foreground">아직 지정된 매니저가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {monthlyManagers.map((manager) => {
                const member = FAMILY_MEMBERS.find(m => m.id === manager.managerId);
                return (
                  <div key={manager.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge>{manager.month}</Badge>
                      <span className="font-medium">{member?.avatar} {member?.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuditorAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // DDC 수정 상태
  const [editingDDC, setEditingDDC] = useState<number | null>(null);
  const [editDDCData, setEditDDCData] = useState({ date: '', memberId: '', screenTime: 0 });

  // RCR 추가/수정 상태
  const [isAddingRCR, setIsAddingRCR] = useState(false);
  const [editingRCR, setEditingRCR] = useState<number | null>(null);
  const [rcrFormData, setRcrFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memberId: '',
    level: 'minor' as 'minor' | 'moderate' | 'major' | 'maximum',
    reason: '',
    appliedBy: '',
  });

  // 용돈 관리 상태
  const [allowanceMonth, setAllowanceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [memberAllowances, setMemberAllowances] = useState<Record<string, { baseAllowance: number; bonus: number; penalty: number }>>({});

  const verifyPasswordMutation = trpc.password.verifyAuditor.useQuery(
    { month: selectedMonth, password },
    { enabled: false }
  );

  const { data: ddcRecords = [], refetch: refetchDDC } = trpc.ddc.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: rcrRecords = [], refetch: refetchRCR } = trpc.rcr.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: comments = [], refetch: refetchComments } = trpc.comments.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateDDCMutation = trpc.ddc.update.useMutation({
    onSuccess: () => {
      toast.success('DDC 기록이 수정되었습니다.');
      refetchDDC();
      setEditingDDC(null);
    },
    onError: () => {
      toast.error('DDC 기록 수정에 실패했습니다.');
    },
  });

  const deleteDDCMutation = trpc.ddc.delete.useMutation({
    onSuccess: () => {
      toast.success('DDC 기록이 삭제되었습니다.');
      refetchDDC();
    },
  });

  const createRCRMutation = trpc.rcr.create.useMutation({
    onSuccess: () => {
      toast.success('RCR 기록이 추가되었습니다.');
      refetchRCR();
      setIsAddingRCR(false);
      resetRCRForm();
    },
    onError: () => {
      toast.error('RCR 기록 추가에 실패했습니다.');
    },
  });

  const updateRCRMutation = trpc.rcr.update.useMutation({
    onSuccess: () => {
      toast.success('RCR 기록이 수정되었습니다.');
      refetchRCR();
      setEditingRCR(null);
      resetRCRForm();
    },
    onError: () => {
      toast.error('RCR 기록 수정에 실패했습니다.');
    },
  });

  const deleteRCRMutation = trpc.rcr.delete.useMutation({
    onSuccess: () => {
      toast.success('RCR 기록이 삭제되었습니다.');
      refetchRCR();
    },
  });

  const saveAllowancesMutation = trpc.allowance.upsert.useMutation({
    onSuccess: () => {
      toast.success('용돈이 저장되었습니다.');
    },
    onError: () => {
      toast.error('용돈 저장에 실패했습니다.');
    },
  });
  
  const autoSettlementMutation = trpc.allowance.autoSettle.useMutation({
    onSuccess: (data) => {
      toast.success(`월말 정산이 완료되었습니다! ${data.settlements.length}명의 용돈이 계산되었습니다.`);
    },
    onError: () => {
      toast.error('자동 정산에 실패했습니다.');
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success('댓글이 삭제되었습니다.');
      refetchComments();
    },
  });

  const handleSaveAllowances = async () => {
    for (const memberId of Object.keys(memberAllowances)) {
      const allowance = memberAllowances[memberId];
      await saveAllowancesMutation.mutateAsync({
        month: allowanceMonth,
        memberId,
        baseAllowance: allowance.baseAllowance,
        bonus: allowance.bonus,
        penalty: allowance.penalty,
      });
    }
    toast.success('모든 용돈이 저장되었습니다!');
  };
  
  const handleAutoSettlement = async () => {
    // 현재 월과 다음달 계산
    const currentDate = new Date(allowanceMonth + '-01');
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    
    const currentMonth = allowanceMonth;
    const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    
    await autoSettlementMutation.mutateAsync({
      currentMonth,
      nextMonth,
    });
  };

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

  const handleEditDDC = (record: any) => {
    setEditingDDC(record.id);
    setEditDDCData({
      date: record.date,
      memberId: record.memberId,
      screenTime: record.screenTime,
    });
  };

  const handleSaveDDC = () => {
    if (!editingDDC) return;
    updateDDCMutation.mutate({
      id: editingDDC,
      updates: editDDCData,
    });
  };

  const resetRCRForm = () => {
    setRcrFormData({
      date: new Date().toISOString().split('T')[0],
      memberId: '',
      level: 'minor',
      reason: '',
      appliedBy: '',
    });
  };

  const handleAddRCR = () => {
    if (!rcrFormData.memberId || !rcrFormData.reason || !rcrFormData.appliedBy) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    createRCRMutation.mutate(rcrFormData);
  };

  const handleEditRCR = (record: any) => {
    setEditingRCR(record.id);
    setRcrFormData({
      date: record.date,
      memberId: record.memberId,
      level: record.level,
      reason: record.reason,
      appliedBy: record.appliedBy,
    });
  };

  const handleSaveRCR = () => {
    if (!editingRCR) return;
    updateRCRMutation.mutate({
      id: editingRCR,
      updates: rcrFormData,
    });
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
                <Label>비밀번호 (6자리)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="••••••"
                  className="mt-2 text-2xl tracking-widest text-center"
                />
              </div>
              <Button
                className="w-full"
                onClick={handlePasswordSubmit}
                disabled={password.length !== 6 || verifyPasswordMutation.isFetching}
              >
                {verifyPasswordMutation.isFetching ? '확인 중...' : '확인'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-4 md:py-8 px-2 md:px-4 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold mb-2">감사 관리 페이지</h1>
          </div>
          <p className="text-muted-foreground">모든 데이터베이스 기록을 조회, 수정, 삭제할 수 있습니다.</p>
        </div>

        <Tabs defaultValue="ddc" className="w-full">
          <TabsList className="grid w-full grid-cols-5 text-xs md:text-sm">
            <TabsTrigger value="ddc">DDC</TabsTrigger>
            <TabsTrigger value="rcr">RCR</TabsTrigger>
            <TabsTrigger value="monthlyManager">월별 매니저</TabsTrigger>
            <TabsTrigger value="allowance">용돈</TabsTrigger>
            <TabsTrigger value="comments">댓글</TabsTrigger>
          </TabsList>

          <TabsContent value="ddc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>DDC 기록 관리 ({ddcRecords.length}개)</CardTitle>
                <CardDescription>스크린타임 기록을 조회, 수정, 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ddcRecords.map((record) => (
                    <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-2">
                      {editingDDC === record.id ? (
                        <>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Input
                              type="date"
                              value={editDDCData.date}
                              onChange={(e) => setEditDDCData({ ...editDDCData, date: e.target.value })}
                            />
                            <Select value={editDDCData.memberId} onValueChange={(val) => setEditDDCData({ ...editDDCData, memberId: val })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FAMILY_MEMBERS.map((member) => (
                                  <SelectItem key={member.id} value={member.id}>
                                    {member.avatar} {member.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={editDDCData.screenTime}
                              onChange={(e) => setEditDDCData({ ...editDDCData, screenTime: parseInt(e.target.value) || 0 })}
                              placeholder="분"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveDDC}>저장</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingDDC(null)}>취소</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge>{record.date}</Badge>
                              <span className="font-medium">{FAMILY_MEMBERS.find(m => m.id === record.memberId)?.name}</span>
                              <span className="text-muted-foreground">{formatMinutesToHoursAndMinutes(record.screenTime)}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDDC(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
                        </>
                      )}
                    </div>
                  ))}
                  {ddcRecords.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">아직 DDC 기록이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rcr" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>RCR 기록 관리 ({rcrRecords.length}개)</CardTitle>
                    <CardDescription>레드카드 기록을 추가, 수정, 삭제할 수 있습니다.</CardDescription>
                  </div>
                  <Button onClick={() => { setIsAddingRCR(true); resetRCRForm(); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingRCR && (
                  <Card className="mb-4 border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">새 RCR 기록 추가</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>날짜</Label>
                          <Input
                            type="date"
                            value={rcrFormData.date}
                            onChange={(e) => setRcrFormData({ ...rcrFormData, date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>대상자</Label>
                          <Select value={rcrFormData.memberId} onValueChange={(val) => setRcrFormData({ ...rcrFormData, memberId: val })}>
                            <SelectTrigger>
                              <SelectValue placeholder="선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {FAMILY_MEMBERS.map((member) => (
                                <SelectItem key={member.id} value={member.id}>
                                  {member.avatar} {member.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>레벨</Label>
                          <Select value={rcrFormData.level} onValueChange={(val: any) => setRcrFormData({ ...rcrFormData, level: val })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minor">경미</SelectItem>
                              <SelectItem value="moderate">보통</SelectItem>
                              <SelectItem value="major">중대</SelectItem>
                              <SelectItem value="maximum">최대</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>적용자</Label>
                          <Input
                            value={rcrFormData.appliedBy}
                            onChange={(e) => setRcrFormData({ ...rcrFormData, appliedBy: e.target.value })}
                            placeholder="예: 아빠"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>사유</Label>
                        <Textarea
                          value={rcrFormData.reason}
                          onChange={(e) => setRcrFormData({ ...rcrFormData, reason: e.target.value })}
                          placeholder="RCR 적용 사유를 입력하세요"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddRCR}>추가</Button>
                        <Button variant="outline" onClick={() => { setIsAddingRCR(false); resetRCRForm(); }}>취소</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  {rcrRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-3">
                      {editingRCR === record.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>날짜</Label>
                              <Input
                                type="date"
                                value={rcrFormData.date}
                                onChange={(e) => setRcrFormData({ ...rcrFormData, date: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>대상자</Label>
                              <Select value={rcrFormData.memberId} onValueChange={(val) => setRcrFormData({ ...rcrFormData, memberId: val })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FAMILY_MEMBERS.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                      {member.avatar} {member.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>레벨</Label>
                              <Select value={rcrFormData.level} onValueChange={(val: any) => setRcrFormData({ ...rcrFormData, level: val })}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minor">경미</SelectItem>
                                  <SelectItem value="moderate">보통</SelectItem>
                                  <SelectItem value="major">중대</SelectItem>
                                  <SelectItem value="maximum">최대</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>적용자</Label>
                              <Input
                                value={rcrFormData.appliedBy}
                                onChange={(e) => setRcrFormData({ ...rcrFormData, appliedBy: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>사유</Label>
                            <Textarea
                              value={rcrFormData.reason}
                              onChange={(e) => setRcrFormData({ ...rcrFormData, reason: e.target.value })}
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveRCR}>저장</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingRCR(null); resetRCRForm(); }}>취소</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <Badge>{record.date}</Badge>
                              <span className="font-medium">{FAMILY_MEMBERS.find(m => m.id === record.memberId)?.name}</span>
                              <Badge variant="destructive">{record.level}</Badge>
                              <span className="text-sm text-muted-foreground">적용: {record.appliedBy}</span>
                            </div>
                            <p className="text-sm">{record.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRCR(record)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
                        </div>
                      )}
                    </div>
                  ))}
                  {rcrRecords.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">아직 RCR 기록이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthlyManager" className="space-y-4">
            <MonthlyManagerTab />
          </TabsContent>
          <TabsContent value="allowance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>용돈 관리</CardTitle>
                <CardDescription>가족 구성원의 월별 용돈을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Label>대상 월</Label>
                    <Input
                      type="month"
                      value={allowanceMonth}
                      onChange={(e) => setAllowanceMonth(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">가족 구성원별 용돈 설정</h3>
                  {FAMILY_MEMBERS.map((member) => {
                    const allowance = memberAllowances[member.id] || { baseAllowance: 0, bonus: 0, penalty: 0 };
                    return (
                      <Card key={member.id} className="border-2">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="text-2xl">{member.avatar}</div>
                            <div>
                              <h4 className="font-bold">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role === 'parent' ? '감사' : '팀원'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>기본 용돈 (만원)</Label>
                              <Input
                                type="number"
                                value={allowance.baseAllowance}
                                onChange={(e) => setMemberAllowances({
                                  ...memberAllowances,
                                  [member.id]: { ...allowance, baseAllowance: parseInt(e.target.value) || 0 }
                                })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>상금 (만원)</Label>
                              <Input
                                type="number"
                                value={allowance.bonus}
                                onChange={(e) => setMemberAllowances({
                                  ...memberAllowances,
                                  [member.id]: { ...allowance, bonus: parseInt(e.target.value) || 0 }
                                })}
                                className="mt-2"
                              />
                            </div>
                            <div>
                              <Label>벌금 (만원)</Label>
                              <Input
                                type="number"
                                value={allowance.penalty}
                                onChange={(e) => setMemberAllowances({
                                  ...memberAllowances,
                                  [member.id]: { ...allowance, penalty: parseInt(e.target.value) || 0 }
                                })}
                                className="mt-2"
                              />
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                            <p className="text-sm font-semibold">
                              최종 용돈: {allowance.baseAllowance + allowance.bonus - allowance.penalty}만원
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSaveAllowances} disabled={saveAllowancesMutation.isPending}>
                    모두 저장
                  </Button>
                  <Button variant="outline" onClick={handleAutoSettlement} disabled={autoSettlementMutation.isPending}>
                    월말 자동 정산
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>댓글 관리 ({comments.length}개)</CardTitle>
                <CardDescription>가족 소통 게시판의 댓글을 조회하고 삭제할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col md:flex-row md:items-start justify-between p-3 border rounded-lg gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={comment.type === 'praise' ? 'default' : 'secondary'}>
                            {comment.type === 'praise' ? '칭찬' : '건의'}
                          </Badge>
                          <span className="text-sm font-medium">{comment.fromMember} → {comment.toMember}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
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
                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">아직 댓글이 없습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
