import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Trash2, Edit, Plus, Save, RefreshCw, Calendar, Settings, Gift } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FAMILY_MEMBERS } from "@/types/family";
import { formatMinutesToHoursAndMinutes } from "@/lib/timeUtils";

// 매니저 활동 기록 컴포넌트
function ManagerActivityLogTab() {
  const [editingLog, setEditingLog] = useState<number | null>(null);
  const [editLogData, setEditLogData] = useState({
    date: '',
    memberId: '',
    activityType: 'tardiness' as 'tardiness' | 'absence' | 'homework_incomplete' | 'rule_violation' | 'other',
    comment: '',
  });

  const { data: activityLogs = [], refetch } = trpc.managerActivityLog.getAll.useQuery();

  const updateLogMutation = trpc.managerActivityLog.update.useMutation({
    onSuccess: () => {
      toast.success('매니저 활동 기록이 수정되었습니다.');
      refetch();
      setEditingLog(null);
    },
    onError: () => toast.error('매니저 활동 기록 수정에 실패했습니다.'),
  });

  const deleteLogMutation = trpc.managerActivityLog.delete.useMutation({
    onSuccess: () => { toast.success('삭제되었습니다.'); refetch(); },
  });

  const activityTypeLabels: Record<string, string> = {
    tardiness: '지각', absence: '결석', homework_incomplete: '숙제 미완료',
    rule_violation: '규칙 위반', other: '기타',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>매니저 활동 기록 관리 ({activityLogs.length}개)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activityLogs.map((log) => {
            const member = FAMILY_MEMBERS.find(m => m.id === log.memberId);
            return (
              <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-2">
                {editingLog === log.id ? (
                  <>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input type="date" value={editLogData.date} onChange={(e) => setEditLogData({ ...editLogData, date: e.target.value })} />
                      <Select value={editLogData.memberId} onValueChange={(val) => setEditLogData({ ...editLogData, memberId: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {FAMILY_MEMBERS.map((m) => <SelectItem key={m.id} value={m.id}>{m.avatar} {m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select value={editLogData.activityType} onValueChange={(val: any) => setEditLogData({ ...editLogData, activityType: val })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(activityTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input value={editLogData.comment} onChange={(e) => setEditLogData({ ...editLogData, comment: e.target.value })} placeholder="코멘트" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => updateLogMutation.mutate({ id: editingLog!, updates: editLogData })}>저장</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingLog(null)}>취소</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{log.date}</Badge>
                      <span className="font-medium">{member?.avatar} {member?.name}</span>
                      <Badge variant="outline">{activityTypeLabels[log.activityType]}</Badge>
                      <span className="text-sm text-muted-foreground">{log.comment}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setEditingLog(log.id); setEditLogData({ date: log.date, memberId: log.memberId, activityType: log.activityType as any, comment: log.comment }); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => confirm('삭제?') && deleteLogMutation.mutate({ id: log.id })}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {activityLogs.length === 0 && <p className="text-center text-muted-foreground py-8">아직 활동 기록이 없습니다.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// 월별 매니저 지정 컴포넌트
function MonthlyManagerTab() {
  const [newMonth, setNewMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newManagerId, setNewManagerId] = useState('');
  const { data: monthlyManagers = [], refetch } = trpc.monthlyManager.getAll.useQuery();
  const setManagerMutation = trpc.monthlyManager.set.useMutation({
    onSuccess: () => { toast.success('매니저가 지정되었습니다.'); refetch(); },
    onError: () => toast.error('매니저 지정에 실패했습니다.'),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매니저 지정</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label>대상 월</Label>
            <Input type="month" value={newMonth} onChange={(e) => setNewMonth(e.target.value)} className="mt-2" />
          </div>
          <div className="flex-1">
            <Label>매니저 선택</Label>
            <Select value={newManagerId} onValueChange={setNewManagerId}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="매니저 선택" /></SelectTrigger>
              <SelectContent>
                {FAMILY_MEMBERS.filter(m => m.role === 'student').map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.avatar} {m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => setManagerMutation.mutate({ month: newMonth, managerId: newManagerId })} disabled={!newManagerId}>지정하기</Button>
          </div>
        </div>
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

  // DDC 데이터 상태 (FM과 동일한 월별 테이블 방식)
  const [ddcData, setDdcData] = useState<Record<string, Record<string, number>>>({});

  // RCR 추가/수정 상태
  const [isAddingRCR, setIsAddingRCR] = useState(false);
  const [editingRCR, setEditingRCR] = useState<number | null>(null);
  const [rcrFormData, setRcrFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memberId: '',
    cardType: 'yellow' as 'yellow' | 'red' | 'double_red' | 'triple_red' | 'quadro_red' | 'green' | 'double_green' | 'triple_green' | 'quadro_green' | 'golden',
    reason: '',
    appliedBy: '',
  });

  // 용돈 관리 상태
  const [allowanceMonth, setAllowanceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 버프/너프 추가 상태
  const [newAdjustment, setNewAdjustment] = useState({ memberId: '', amount: 0, message: '', createdBy: '감사' });

  // 설정 상태
  const [settingsMonth, setSettingsMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [newManagerPw, setNewManagerPw] = useState('');
  const [newAuditorPw, setNewAuditorPw] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');

  const verifyPasswordMutation = trpc.password.verifyAuditor.useQuery(
    { month: selectedMonth, password },
    { enabled: false }
  );

  // DDC 데이터 (월별)
  const { data: existingDdcData, refetch: refetchDDC } = trpc.ddc.getByMonth.useQuery(
    { month: selectedMonth },
    { enabled: isAuthenticated }
  );

  const { data: rcrRecords = [], refetch: refetchRCR } = trpc.rcr.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const { data: comments = [], refetch: refetchComments } = trpc.comments.getAll.useQuery(undefined, { enabled: isAuthenticated });
  const { data: adjustments = [], refetch: refetchAdjustments } = trpc.allowanceAdjustment.getByMonth.useQuery(
    { month: allowanceMonth },
    { enabled: isAuthenticated }
  );
  const { data: allSettings = {} } = trpc.appSettings.getAll.useQuery(undefined, { enabled: isAuthenticated });

  // 기존 DDC 데이터를 테이블 상태에 로드
  useEffect(() => {
    if (existingDdcData && existingDdcData.length > 0) {
      const loadedData: Record<string, Record<string, number>> = {};
      existingDdcData.forEach((record: any) => {
        if (!loadedData[record.date]) loadedData[record.date] = {};
        loadedData[record.date][record.memberId] = record.screenTime;
      });
      setDdcData(loadedData);
    } else {
      setDdcData({});
    }
  }, [existingDdcData]);

  // 설정 데이터 로드
  useEffect(() => {
    const settings = allSettings as Record<string, string>;
    if (settings['notify_email']) setNotifyEmail(settings['notify_email']);
  }, [allSettings]);

  const createBatchMutation = trpc.ddc.createBatch.useMutation({
    onSuccess: (data) => { toast.success(data.message || `${data.count}개 저장`); refetchDDC(); },
    onError: () => toast.error('DDC 저장에 실패했습니다.'),
  });

  const createRCRMutation = trpc.rcr.create.useMutation({
    onSuccess: () => { toast.success('RCR 기록이 추가되었습니다.'); refetchRCR(); setIsAddingRCR(false); resetRCRForm(); },
    onError: () => toast.error('RCR 기록 추가에 실패했습니다.'),
  });

  const updateRCRMutation = trpc.rcr.update.useMutation({
    onSuccess: () => { toast.success('RCR 기록이 수정되었습니다.'); refetchRCR(); setEditingRCR(null); resetRCRForm(); },
    onError: () => toast.error('RCR 기록 수정에 실패했습니다.'),
  });

  const deleteRCRMutation = trpc.rcr.delete.useMutation({
    onSuccess: () => { toast.success('삭제되었습니다.'); refetchRCR(); },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => { toast.success('삭제되었습니다.'); refetchComments(); },
  });

  const createAdjustmentMutation = trpc.allowanceAdjustment.create.useMutation({
    onSuccess: () => { toast.success('버프/너프가 추가되었습니다.'); refetchAdjustments(); setNewAdjustment({ memberId: '', amount: 0, message: '', createdBy: '감사' }); },
    onError: () => toast.error('버프/너프 추가에 실패했습니다.'),
  });

  const deleteAdjustmentMutation = trpc.allowanceAdjustment.delete.useMutation({
    onSuccess: () => { toast.success('삭제되었습니다.'); refetchAdjustments(); },
  });

  const updatePasswordMutation = trpc.appSettings.updatePassword.useMutation({
    onSuccess: () => toast.success('비밀번호가 업데이트되었습니다.'),
    onError: () => toast.error('비밀번호 업데이트에 실패했습니다.'),
  });

  const setEmailMutation = trpc.appSettings.set.useMutation({
    onSuccess: () => toast.success('이메일이 저장되었습니다.'),
    onError: () => toast.error('이메일 저장에 실패했습니다.'),
  });

  // 버그 보상: DDC -1시간 (RCR 그린카드로 처리)
  const createRCRForBugMutation = trpc.rcr.create.useMutation({
    onSuccess: () => { toast.success('버그 보상: DDC -1시간이 지급되었습니다!'); refetchRCR(); },
    onError: () => toast.error('버그 보상 지급에 실패했습니다.'),
  });

  // 월말평가 상태
  const [evalMonth, setEvalMonth] = useState(() => {
    const now = new Date();
    const day = now.getDate();
    if (day <= 5) {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const { data: evalData, refetch: refetchEval } = trpc.managerEvaluation.getByMonth.useQuery(
    { month: evalMonth },
    { enabled: isAuthenticated }
  );
  const { data: evalManagerData } = trpc.monthlyManager.get.useQuery(
    { month: evalMonth },
    { enabled: isAuthenticated }
  );
  const nextMonthStr = (() => { const [y, m] = evalMonth.split('-').map(Number); const d = new Date(y, m, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
  const { data: nextMonthAllowances = [], refetch: refetchNextAllowances } = trpc.allowance.getAllByMonth.useQuery(
    { month: nextMonthStr },
    { enabled: isAuthenticated }
  );

  const cancelEvalMutation = trpc.managerEvaluation.cancelAndRollback.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ ${data.month} 월말평가가 취소되었습니다.`, {
        description: `${data.nextMonth} 용돈 정산 데이터가 삭제되었습니다.`,
      });
      refetchEval();
      refetchNextAllowances();
    },
    onError: () => toast.error('월말평가 취소에 실패했습니다.'),
  });

  const handlePasswordSubmit = async () => {
    if (password.length !== 6) { toast.error('비밀번호는 6자리 숫자여야 합니다.'); return; }
    const result = await verifyPasswordMutation.refetch();
    if (result.data?.valid) { setIsAuthenticated(true); toast.success('감사 인증되었습니다!'); }
    else toast.error('비밀번호가 올바르지 않습니다.');
  };

  const handleSaveDDC = () => {
    const existingKeys = new Set((existingDdcData || []).map((r: any) => `${r.date}__${r.memberId}`));
    const records = [];
    for (const date in ddcData) {
      for (const memberId in ddcData[date]) {
        const screenTime = ddcData[date][memberId];
        const key = `${date}__${memberId}`;
        if (screenTime > 0 || existingKeys.has(key)) {
          records.push({ memberId, date, screenTime });
        }
      }
    }
    if (records.length === 0) { toast.error('입력된 데이터가 없습니다.'); return; }
    createBatchMutation.mutate({ records });
  };

  const handleInputChange = (date: string, memberId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setDdcData(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [memberId]: numValue } }));
  };

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => `${yearMonth}-${String(i + 1).padStart(2, '0')}`);
  };

  const resetRCRForm = () => setRcrFormData({ date: new Date().toISOString().split('T')[0], memberId: '', cardType: 'yellow', reason: '', appliedBy: '' });

  const handleAddRCR = () => {
    if (!rcrFormData.memberId || !rcrFormData.reason || !rcrFormData.appliedBy) { toast.error('모든 필드를 입력해주세요.'); return; }
    createRCRMutation.mutate(rcrFormData);
  };

  const handleSaveRCR = () => {
    if (!editingRCR) return;
    updateRCRMutation.mutate({ id: editingRCR, updates: rcrFormData });
  };

  const handleAddAdjustment = () => {
    if (!newAdjustment.memberId || !newAdjustment.message || newAdjustment.amount === 0) {
      toast.error('구성원, 금액(0 제외), 메시지를 모두 입력해주세요.'); return;
    }
    createAdjustmentMutation.mutate({ month: allowanceMonth, ...newAdjustment });
  };

  const handleBugReward = (comment: any) => {
    const today = new Date().toISOString().split('T')[0];
    const memberName = comment.fromMember;
    const member = FAMILY_MEMBERS.find(m => m.name === memberName || m.nickname === memberName);
    if (!member) { toast.error(`구성원을 찾을 수 없습니다: ${memberName}`); return; }
    createRCRForBugMutation.mutate({
      date: today,
      memberId: member.id,
      cardType: 'green',
      reason: `버그 리포트 보상: ${comment.content.substring(0, 50)}`,
      appliedBy: '감사',
    });
  };

  const days = getDaysInMonth(selectedMonth);

  const rcrCardLabels: Record<string, string> = {
    yellow: '🟨 옐로우카드 (+5시간)', red: '🟥 레드카드 (-1만원)',
    double_red: '🟥🟥 더블레드 (-2만원)', triple_red: '🟥🟥🟥 트리플레드 (-3만원)',
    quadro_red: '🟥🟥🟥🟥 쿼드로레드 (-4만원)', green: '🟩 그린카드 (-1시간)',
    double_green: '🟩🟩 더블그린 (-5시간)', triple_green: '🟩🟩🟩 트리플그린 (+2만원)',
    quadro_green: '🟩🟩🟩🟩 쿼드로그린 (+4만원)', golden: '🏆 골든카드 (매니저 면제)',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container py-8 max-w-md">
          <Link href="/"><Button variant="ghost" className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />룰북으로 돌아가기</Button></Link>
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <div><CardTitle>감사 관리 페이지</CardTitle><CardDescription>6자리 비밀번호를 입력하세요</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>대상 월</Label>
                <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="mt-2" />
              </div>
              <div>
                <Label>비밀번호 (6자리)</Label>
                <Input type="password" inputMode="numeric" maxLength={6} value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="••••••" className="mt-2 text-2xl tracking-widest text-center" />
              </div>
              <Button className="w-full" onClick={handlePasswordSubmit} disabled={password.length !== 6 || verifyPasswordMutation.isFetching}>
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
        <div className="flex items-center justify-between mb-4">
          <Link href="/"><Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" />룰북으로 돌아가기</Button></Link>
        </div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold">감사 관리 페이지</h1>
          </div>
          <p className="text-muted-foreground">모든 데이터베이스 기록을 조회, 수정, 삭제할 수 있습니다.</p>
        </div>

        <Tabs defaultValue="ddc" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
            <TabsTrigger value="ddc">DDC 수정</TabsTrigger>
            <TabsTrigger value="rcr">RCR</TabsTrigger>
            <TabsTrigger value="allowance">용돈/버프</TabsTrigger>
            <TabsTrigger value="monthlyManager">월별 매니저</TabsTrigger>
            <TabsTrigger value="managerActivityLog">매니저 활동</TabsTrigger>
            <TabsTrigger value="bugreport">버그 리포트</TabsTrigger>
            <TabsTrigger value="monthEval" className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 data-[state=active]:bg-orange-500 data-[state=active]:text-white">평가 관리</TabsTrigger>
            <TabsTrigger value="settings">설정</TabsTrigger>
          </TabsList>

          {/* ===== DDC 탭 (FM과 동일한 월별 테이블 UI) ===== */}
          <TabsContent value="ddc">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-base px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />{selectedMonth}
                </Badge>
                <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-40" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetchDDC()} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" />새로고침</Button>
                <Button onClick={handleSaveDDC} disabled={createBatchMutation.isPending} className="gap-2">
                  <Save className="w-4 h-4" />저장
                </Button>
              </div>
            </div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>DDC 데이터 수정 - {selectedMonth}</CardTitle>
                <CardDescription>각 가족 구성원의 일별 스크린타임을 분 단위로 수정하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2">
                        <th className="p-3 text-left font-semibold sticky left-0 bg-background z-10">날짜</th>
                        {FAMILY_MEMBERS.map(member => (
                          <th key={member.id} className="p-3 text-center font-semibold min-w-[110px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-2xl">{member.icon}</span>
                              <span className="text-sm">{member.nickname}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(date => {
                        const dayOfWeek = new Date(date).getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        return (
                          <tr key={date} className={`border-b hover:bg-muted/50 ${isWeekend ? 'bg-muted/30' : ''}`}>
                            <td className="p-3 font-medium sticky left-0 bg-background z-10">
                              <div className="flex flex-col">
                                <span className="text-sm">{date.split('-')[2]}일</span>
                                <span className="text-xs text-muted-foreground">{['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}</span>
                              </div>
                            </td>
                            {FAMILY_MEMBERS.map(member => {
                              const value = ddcData[date]?.[member.id] || 0;
                              return (
                                <td key={member.id} className="p-2">
                                  <div className="flex flex-col gap-1">
                                    <Input
                                      type="number" inputMode="numeric" min="0"
                                      value={value === 0 ? '' : value}
                                      onChange={(e) => handleInputChange(date, member.id, e.target.value)}
                                      placeholder="0"
                                      className="text-center h-9 text-sm px-1"
                                    />
                                    {value > 0 && (
                                      <span className="text-xs text-muted-foreground text-center">{formatMinutesToHoursAndMinutes(value)}</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== RCR 탭 ===== */}
          <TabsContent value="rcr" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>RCR 기록 관리 ({rcrRecords.length}개)</CardTitle>
                    <CardDescription>레드카드 기록을 추가, 수정, 삭제할 수 있습니다.</CardDescription>
                  </div>
                  <Button onClick={() => { setIsAddingRCR(true); resetRCRForm(); }}><Plus className="w-4 h-4 mr-2" />추가</Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingRCR && (
                  <Card className="mb-4 border-2 border-primary">
                    <CardHeader><CardTitle className="text-lg">새 RCR 기록 추가</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>날짜</Label><Input type="date" value={rcrFormData.date} onChange={(e) => setRcrFormData({ ...rcrFormData, date: e.target.value })} /></div>
                        <div>
                          <Label>대상자</Label>
                          <Select value={rcrFormData.memberId} onValueChange={(val) => setRcrFormData({ ...rcrFormData, memberId: val })}>
                            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                            <SelectContent>{FAMILY_MEMBERS.map((m) => <SelectItem key={m.id} value={m.id}>{m.avatar} {m.name}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>카드 종류</Label>
                          <Select value={rcrFormData.cardType} onValueChange={(val: any) => setRcrFormData({ ...rcrFormData, cardType: val })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{Object.entries(rcrCardLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div><Label>적용자</Label><Input value={rcrFormData.appliedBy} onChange={(e) => setRcrFormData({ ...rcrFormData, appliedBy: e.target.value })} placeholder="예: 아빠" /></div>
                      </div>
                      <div><Label>사유</Label><Textarea value={rcrFormData.reason} onChange={(e) => setRcrFormData({ ...rcrFormData, reason: e.target.value })} rows={3} /></div>
                      <div className="flex gap-2">
                        <Button onClick={handleAddRCR}>추가</Button>
                        <Button variant="outline" onClick={() => { setIsAddingRCR(false); resetRCRForm(); }}>취소</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <div className="space-y-2">
                  {rcrRecords.map((record: any) => (
                    <div key={record.id} className="border rounded-lg p-3">
                      {editingRCR === record.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label>날짜</Label><Input type="date" value={rcrFormData.date} onChange={(e) => setRcrFormData({ ...rcrFormData, date: e.target.value })} /></div>
                            <div>
                              <Label>대상자</Label>
                              <Select value={rcrFormData.memberId} onValueChange={(val) => setRcrFormData({ ...rcrFormData, memberId: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{FAMILY_MEMBERS.map((m) => <SelectItem key={m.id} value={m.id}>{m.avatar} {m.name}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>카드 종류</Label>
                              <Select value={rcrFormData.cardType} onValueChange={(val: any) => setRcrFormData({ ...rcrFormData, cardType: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{Object.entries(rcrCardLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div><Label>적용자</Label><Input value={rcrFormData.appliedBy} onChange={(e) => setRcrFormData({ ...rcrFormData, appliedBy: e.target.value })} /></div>
                          </div>
                          <div><Label>사유</Label><Textarea value={rcrFormData.reason} onChange={(e) => setRcrFormData({ ...rcrFormData, reason: e.target.value })} rows={2} /></div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveRCR}>저장</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditingRCR(null); resetRCRForm(); }}>취소</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge>{record.date}</Badge>
                            <span className="font-medium">{FAMILY_MEMBERS.find(m => m.id === record.memberId)?.avatar} {FAMILY_MEMBERS.find(m => m.id === record.memberId)?.name}</span>
                            <Badge variant="outline">{rcrCardLabels[record.cardType]}</Badge>
                            <span className="text-sm text-muted-foreground">{record.reason}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => { setEditingRCR(record.id); setRcrFormData({ date: record.date, memberId: record.memberId, cardType: record.cardType, reason: record.reason, appliedBy: record.appliedBy }); }}><Edit className="w-4 h-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => confirm('삭제?') && deleteRCRMutation.mutate({ id: record.id })}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {rcrRecords.length === 0 && <p className="text-center text-muted-foreground py-8">아직 RCR 기록이 없습니다.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 용돈/버프 탭 ===== */}
          <TabsContent value="allowance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5" />버프/너프 메시지 추가</CardTitle>
                <CardDescription>자녀 용돈에 버프(+) 또는 너프(-) 금액과 메시지를 추가합니다. 가족 프로필에 표시됩니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1">
                    <Label>대상 월</Label>
                    <Input type="month" value={allowanceMonth} onChange={(e) => setAllowanceMonth(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label>구성원</Label>
                    <Select value={newAdjustment.memberId} onValueChange={(val) => setNewAdjustment({ ...newAdjustment, memberId: val })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="선택" /></SelectTrigger>
                      <SelectContent>{FAMILY_MEMBERS.filter(m => m.role === 'student').map((m) => <SelectItem key={m.id} value={m.id}>{m.avatar} {m.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>금액 (만원, 양수=버프, 음수=너프)</Label>
                    <Input type="number" value={newAdjustment.amount} onChange={(e) => setNewAdjustment({ ...newAdjustment, amount: parseInt(e.target.value) || 0 })} placeholder="예: 1 또는 -1" className="mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>메시지 (프로필에 표시됨)</Label>
                    <Input value={newAdjustment.message} onChange={(e) => setNewAdjustment({ ...newAdjustment, message: e.target.value })} placeholder="예: 엄마 설겆이 도와줘서 +1만원" className="mt-1" />
                  </div>
                  <div>
                    <Label>적용자</Label>
                    <Input value={newAdjustment.createdBy} onChange={(e) => setNewAdjustment({ ...newAdjustment, createdBy: e.target.value })} className="mt-1" />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddAdjustment} className="w-full" disabled={createAdjustmentMutation.isPending}>
                      <Plus className="w-4 h-4 mr-2" />버프/너프 추가
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{allowanceMonth} 버프/너프 목록</h3>
                  {adjustments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">이 달의 버프/너프가 없습니다.</p>
                  ) : (
                    adjustments.map((adj: any) => {
                      const member = FAMILY_MEMBERS.find(m => m.id === adj.memberId);
                      return (
                        <div key={adj.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span>{member?.avatar} {member?.name}</span>
                            <Badge variant={adj.amount > 0 ? 'default' : 'destructive'}>
                              {adj.amount > 0 ? '+' : ''}{adj.amount}만원
                            </Badge>
                            <span className="text-sm text-muted-foreground">{adj.message}</span>
                            <span className="text-xs text-muted-foreground">by {adj.createdBy}</span>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => confirm('삭제?') && deleteAdjustmentMutation.mutate({ id: adj.id })}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 월별 매니저 탭 ===== */}
          <TabsContent value="monthlyManager">
            <MonthlyManagerTab />
          </TabsContent>

          {/* ===== 매니저 활동 탭 ===== */}
          <TabsContent value="managerActivityLog">
            <ManagerActivityLogTab />
          </TabsContent>

          {/* ===== 버그 리포트 탭 (DDC -1시간 보상) ===== */}
          <TabsContent value="bugreport" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>버그 리포트 보상 시스템 ({comments.length}개)</CardTitle>
                <CardDescription>버그 리포트를 검토하고 DDC -1시간 보상(그린카드)을 지급합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="flex flex-col md:flex-row md:items-start justify-between p-3 border rounded-lg gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={comment.type === 'praise' ? 'default' : 'secondary'}>
                            {comment.type === 'praise' ? '칭찬' : '건의'}
                          </Badge>
                          <span className="text-sm font-medium">{comment.fromMember} → {comment.toMember}</span>
                          <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString('ko-KR')}</span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                          onClick={() => handleBugReward(comment)} disabled={createRCRForBugMutation.isPending}>
                          🟩 DDC -1시간
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirm('삭제?') && deleteCommentMutation.mutate({ id: comment.id })}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-center text-muted-foreground py-8">아직 댓글이 없습니다.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 평가 관리 탭 ===== */}
          <TabsContent value="monthEval" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  월말평가 관리
                </CardTitle>
                <CardDescription>
                  월말평가를 진행하거나 취소할 수 있습니다. 취소 시 평가 기록과 다음달 용돈 정산이 모두 삭제됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 월 선택 */}
                <div className="flex items-center gap-4">
                  <div>
                    <Label>평가 대상 월</Label>
                    <Input type="month" value={evalMonth} onChange={(e) => setEvalMonth(e.target.value)} className="mt-1 w-48" />
                  </div>
                  <div className="flex-1">
                    <Label>매니저</Label>
                    <div className="mt-1 text-lg font-semibold">
                      {evalManagerData ? (
                        <span>{FAMILY_MEMBERS.find(m => m.id === evalManagerData.managerId)?.avatar} {FAMILY_MEMBERS.find(m => m.id === evalManagerData.managerId)?.name}</span>
                      ) : <span className="text-muted-foreground">미지정</span>}
                    </div>
                  </div>
                </div>

                {/* 현재 평가 현황 */}
                <div>
                  <Label className="text-base font-semibold">현재 평가 현황 ({evalData?.length || 0}표)</Label>
                  {evalData && evalData.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {evalData.map((ev: any) => {
                        const voter = FAMILY_MEMBERS.find(m => m.id === ev.voterId);
                        return (
                          <div key={ev.id} className="flex items-center gap-3 p-2 border rounded-lg">
                            <span>{voter?.avatar} {voter?.name}</span>
                            <Badge variant={ev.vote === 'good' ? 'default' : 'destructive'}>
                              {ev.vote === 'good' ? '👍 잘했음' : '👎 못했음'}
                            </Badge>
                          </div>
                        );
                      })}
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <div className="flex gap-4 text-sm">
                          <span>👍 잘했음: <strong>{evalData.filter((e: any) => e.vote === 'good').length}표</strong></span>
                          <span>👎 못했음: <strong>{evalData.filter((e: any) => e.vote === 'bad').length}표</strong></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-muted-foreground text-sm">아직 평가 기록이 없습니다.</p>
                  )}
                </div>

                {/* 다음달 용돈 정산 현황 */}
                <div>
                  <Label className="text-base font-semibold">{nextMonthStr} 용돈 정산 현황</Label>
                  {(nextMonthAllowances as any[]).length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {(nextMonthAllowances as any[]).map((a: any) => {
                        const member = FAMILY_MEMBERS.find(m => m.id === a.memberId);
                        return (
                          <div key={a.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <span>{member?.avatar} {member?.name}</span>
                            <div className="text-sm text-right">
                              <span className="font-semibold">{a.finalAllowance}만원</span>
                              <span className="text-muted-foreground ml-2">(+{a.bonus} -{a.penalty})</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-sm text-green-800 dark:text-green-300">
                        ✅ {evalMonth} 월말평가가 완료되어 {nextMonthStr} 용돈이 정산되었습니다.
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-muted-foreground text-sm">월말평가 완료 후 용돈이 정산됩니다.</p>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <a href="/manager-evaluation" target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white" size="lg">
                      <span className="mr-2">📊</span>
                      {evalMonth} 월말평가 진행하기
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    disabled={cancelEvalMutation.isPending || ((evalData?.length || 0) === 0 && (nextMonthAllowances as any[]).length === 0)}
                    onClick={() => {
                      if (!confirm(`⚠️ ${evalMonth} 월말평가를 취소하시겠습니까?\n\n- 평가 기록이 모두 삭제됩니다.\n- ${nextMonthStr} 용돈 정산 데이터가 삭제됩니다.\n\n이 작업은 되돌릴 수 없습니다!`)) return;
                      cancelEvalMutation.mutate({ month: evalMonth });
                    }}
                  >
                    {cancelEvalMutation.isPending ? (
                      <><span className="mr-2">⏳</span>취소 중...</>
                    ) : (
                      <><span className="mr-2">❌</span>평가 취소 (롤백)</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ 취소 버튼은 평가 기록과 {nextMonthStr} 용돈 정산 데이터를 삭제합니다. 평가를 다시 진행하려면 월말평가 페이지를 이용하세요.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== 설정 탭 ===== */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" />알림 이메일 설정</CardTitle>
                <CardDescription>월말 평가 완료 시 비밀번호를 전송받을 이메일 주소를 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>수신 이메일</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="example@email.com" />
                    <Button onClick={() => setEmailMutation.mutate({ key: 'notify_email', value: notifyEmail })} disabled={setEmailMutation.isPending}>저장</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>비밀번호 직접 수정</CardTitle>
                <CardDescription>FM(패밀리 매니저)과 FA(패밀리 감사) 비밀번호를 직접 수정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>대상 월</Label>
                  <Input type="month" value={settingsMonth} onChange={(e) => setSettingsMonth(e.target.value)} className="mt-1 w-48" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>FM 비밀번호 (4자리)</Label>
                    <Input type="text" inputMode="numeric" maxLength={4} value={newManagerPw}
                      onChange={(e) => setNewManagerPw(e.target.value.replace(/\D/g, ''))}
                      placeholder="4자리 숫자" className="mt-1 tracking-widest text-center text-lg" />
                  </div>
                  <div>
                    <Label>FA 비밀번호 (6자리)</Label>
                    <Input type="text" inputMode="numeric" maxLength={6} value={newAuditorPw}
                      onChange={(e) => setNewAuditorPw(e.target.value.replace(/\D/g, ''))}
                      placeholder="6자리 숫자" className="mt-1 tracking-widest text-center text-lg" />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (newManagerPw.length !== 4 && newAuditorPw.length !== 6) {
                      toast.error('FM은 4자리, FA는 6자리를 입력해주세요.'); return;
                    }
                    updatePasswordMutation.mutate({
                      month: settingsMonth,
                      managerPassword: newManagerPw || '0000',
                      auditorPassword: newAuditorPw || '000000',
                    });
                  }}
                  disabled={updatePasswordMutation.isPending}
                >
                  비밀번호 업데이트
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
