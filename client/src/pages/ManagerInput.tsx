import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Save, Calendar, RefreshCw, Plus, Trash2, Edit } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Link } from "wouter";
import { FAMILY_MEMBERS } from "@/types/family";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { formatMinutesToHoursAndMinutes } from "@/lib/timeUtils";

export default function ManagerInput() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // DDC 데이터 상태 (날짜별, 멤버별)
  const [ddcData, setDdcData] = useState<Record<string, Record<string, number>>>({});
  
  // 활동 일지 상태
  const [activityLogDialogOpen, setActivityLogDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    memberId: '',
    activityType: 'tardiness' as 'tardiness' | 'absence' | 'homework_incomplete' | 'rule_violation' | 'other',
    comment: '',
  });
  
  const verifyPasswordMutation = trpc.password.verifyManager.useQuery(
    { month: selectedMonth, password },
    { enabled: false }
  );
  
  // 기존 DDC 데이터 불러오기
  const { data: existingDdcData, refetch: refetchDdcData } = trpc.ddc.getByMonth.useQuery(
    { month: selectedMonth },
    { enabled: isAuthenticated }
  );
  
  // 활동 일지 데이터 불러오기
  const { data: activityLogs, refetch: refetchActivityLogs } = trpc.managerActivityLog.getByMonth.useQuery(
    { month: selectedMonth },
    { enabled: isAuthenticated }
  );
  
  // 활동 일지 생성 뮤테이션
  const createActivityLogMutation = trpc.managerActivityLog.create.useMutation({
    onSuccess: () => {
      toast.success('활동 일지가 추가되었습니다!');
      refetchActivityLogs();
      setActivityLogDialogOpen(false);
      resetLogForm();
    },
    onError: () => {
      toast.error('활동 일지 추가에 실패했습니다.');
    },
  });
  
  // 활동 일지 수정 뮤테이션
  const updateActivityLogMutation = trpc.managerActivityLog.update.useMutation({
    onSuccess: () => {
      toast.success('활동 일지가 수정되었습니다!');
      refetchActivityLogs();
      setActivityLogDialogOpen(false);
      setEditingLog(null);
      resetLogForm();
    },
    onError: () => {
      toast.error('활동 일지 수정에 실패했습니다.');
    },
  });
  
  // 활동 일지 삭제 뮤테이션
  const deleteActivityLogMutation = trpc.managerActivityLog.delete.useMutation({
    onSuccess: () => {
      toast.success('활동 일지가 삭제되었습니다!');
      refetchActivityLogs();
    },
    onError: () => {
      toast.error('활동 일지 삭제에 실패했습니다.');
    },
  });
  
  // 기존 데이터를 ddcData 상태에 로드
  useEffect(() => {
    if (existingDdcData && existingDdcData.length > 0) {
      const loadedData: Record<string, Record<string, number>> = {};
      existingDdcData.forEach((record) => {
        const dateKey = record.date;
        if (!loadedData[dateKey]) {
          loadedData[dateKey] = {};
        }
        loadedData[dateKey][record.memberId] = record.screenTime;
      });
      setDdcData(loadedData);
    }
  }, [existingDdcData]);
  
  const createBatchMutation = trpc.ddc.createBatch.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || `${data.count}개의 DDC 기록이 저장되었습니다!`);
      // 저장 후 데이터 다시 불러오기
      refetchDdcData();
    },
    onError: () => {
      toast.error('DDC 기록 저장에 실패했습니다.');
    },
  });

  const handlePasswordSubmit = async () => {
    if (password.length !== 4) {
      toast.error('비밀번호는 4자리 숫자여야 합니다.');
      return;
    }
    
    const result = await verifyPasswordMutation.refetch();
    if (result.data?.valid) {
      setIsAuthenticated(true);
      toast.success('인증되었습니다!');
    } else {
      toast.error('비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSave = () => {
    // 기존 DB에 저장된 날짜+멤버 조합 목록 (Set으로 빠른 조회)
    const existingKeys = new Set(
      (existingDdcData || []).map(r => `${r.date}__${r.memberId}`)
    );

    const records = [];
    for (const date in ddcData) {
      for (const memberId in ddcData[date]) {
        const screenTime = ddcData[date][memberId];
        const key = `${date}__${memberId}`;
        // 기존 데이터가 있으면 0이어도 저장 (수정 허용)
        // 기존 데이터가 없으면 0은 저장하지 않음 (빈 칸)
        if (screenTime > 0 || existingKeys.has(key)) {
          records.push({
            memberId,
            date,
            screenTime,
          });
        }
      }
    }
    
    if (records.length === 0) {
      toast.error('입력된 데이터가 없습니다.');
      return;
    }
    
    createBatchMutation.mutate({ records });
  };

  const resetLogForm = () => {
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      memberId: '',
      activityType: 'tardiness',
      comment: '',
    });
  };
  
  const handleAddActivityLog = () => {
    if (!newLog.memberId || !newLog.comment) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    
    // 현재 로그인한 매니저 ID를 recordedBy로 사용 (예시: '진')
    const currentMonth = selectedMonth.split('-')[1];
    const managerMap: Record<string, string> = {
      '02': 'jin',
      // 다른 달의 매니저 추가 가능
    };
    const recordedBy = managerMap[currentMonth] || 'unknown';
    
    createActivityLogMutation.mutate({
      ...newLog,
      recordedBy,
    });
  };
  
  const handleEditActivityLog = (log: any) => {
    setEditingLog(log);
    setNewLog({
      date: log.date,
      memberId: log.memberId,
      activityType: log.activityType,
      comment: log.comment,
    });
    setActivityLogDialogOpen(true);
  };
  
  const handleUpdateActivityLog = () => {
    if (!editingLog || !newLog.memberId || !newLog.comment) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    
    updateActivityLogMutation.mutate({
      id: editingLog.id,
      updates: {
        date: newLog.date,
        memberId: newLog.memberId,
        activityType: newLog.activityType,
        comment: newLog.comment,
      },
    });
  };
  
  const handleDeleteActivityLog = (id: number) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteActivityLogMutation.mutate({ id });
    }
  };
  
  const activityTypeLabels = {
    tardiness: '지각',
    absence: '결석',
    homework_incomplete: '숙제 미완료',
    rule_violation: '규칙 위반',
    other: '기타',
  };

  const handleInputChange = (date: string, memberId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setDdcData(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        [memberId]: numValue,
      },
    }));
  };

  // 해당 월의 날짜 목록 생성
  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(`${yearMonth}-${String(day).padStart(2, '0')}`);
    }
    return days;
  };

  const days = getDaysInMonth(selectedMonth);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background py-12 px-4">
        <div className="container max-w-md mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">매니저 DDC 입력</CardTitle>
              <CardDescription>
                매니저 비밀번호를 입력하세요 (4자리 숫자)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">입력 월</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                  placeholder="4자리 숫자"
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button 
                onClick={handlePasswordSubmit} 
                className="w-full"
                disabled={password.length !== 4}
              >
                확인
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-base px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {selectedMonth}
            </Badge>
            <Button 
              onClick={() => refetchDdcData()} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
            <Button 
              onClick={handleSave}
              disabled={createBatchMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              저장
            </Button>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">월간 DDC 데이터 입력</CardTitle>
            <CardDescription>
              각 가족 구성원의 일별 스크린타임을 분 단위로 입력하세요. 기존 데이터는 자동으로 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2">
                    <th className="p-3 text-left font-semibold sticky left-0 bg-background z-10">날짜</th>
                    {FAMILY_MEMBERS.map(member => (
                      <th key={member.id} className="p-3 text-center font-semibold min-w-[120px]">
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
                            <span className="text-xs text-muted-foreground">
                              {['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}
                            </span>
                          </div>
                        </td>
                        {FAMILY_MEMBERS.map(member => {
                          const value = ddcData[date]?.[member.id] || 0;
                          return (
                            <td key={member.id} className="p-2">
                              <div className="flex flex-col gap-1">
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  value={value || ''}
                                  onChange={(e) => handleInputChange(date, member.id, e.target.value)}
                                  placeholder="0"
                                  className="text-center text-base"
                                />
                                {value > 0 && (
                                  <span className="text-xs text-center text-muted-foreground">
                                    {formatMinutesToHoursAndMinutes(value)}
                                  </span>
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
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>팁:</strong> 입력은 분 단위로 하되, 아래에 시간+분 형식으로 표시됩니다. 
                저장 버튼을 누르면 데이터가 저장되며, 언제든 수정 가능합니다.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* 활동 일지 섭션 */}
        <Card className="shadow-lg mt-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">매니저 활동 일지</CardTitle>
                <CardDescription>
                  가족 구성원의 지각, 결석, 숙제 미완료 등의 활동을 기록하세요. RCR 결정의 참고 자료로 활용됩니다.
                </CardDescription>
              </div>
              <Dialog open={activityLogDialogOpen} onOpenChange={setActivityLogDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingLog(null); resetLogForm(); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    일지 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingLog ? '활동 일지 수정' : '활동 일지 추가'}</DialogTitle>
                    <DialogDescription>
                      가족 구성원의 활동 내용을 기록하세요.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="log-date">날짜</Label>
                      <Input
                        id="log-date"
                        type="date"
                        value={newLog.date}
                        onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-member">구성원</Label>
                      <Select value={newLog.memberId} onValueChange={(value) => setNewLog({ ...newLog, memberId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="구성원 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {FAMILY_MEMBERS.map(member => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.icon} {member.nickname}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-type">활동 유형</Label>
                      <Select value={newLog.activityType} onValueChange={(value: any) => setNewLog({ ...newLog, activityType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(activityTypeLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="log-comment">상세 내용</Label>
                      <Textarea
                        id="log-comment"
                        value={newLog.comment}
                        onChange={(e) => setNewLog({ ...newLog, comment: e.target.value })}
                        placeholder="상세 내용을 입력하세요"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setActivityLogDialogOpen(false); setEditingLog(null); resetLogForm(); }}>
                      취소
                    </Button>
                    <Button onClick={editingLog ? handleUpdateActivityLog : handleAddActivityLog}>
                      {editingLog ? '수정' : '추가'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {activityLogs && activityLogs.length > 0 ? (
              <div className="space-y-3">
                {activityLogs.map((log: any) => {
                  const member = FAMILY_MEMBERS.find(m => m.id === log.memberId);
                  return (
                    <div key={log.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{member?.icon}</span>
                            <span className="font-semibold">{member?.nickname}</span>
                            <Badge variant="outline">{activityTypeLabels[log.activityType as keyof typeof activityTypeLabels]}</Badge>
                            <span className="text-sm text-muted-foreground">{log.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.comment}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEditActivityLog(log)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteActivityLog(log.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>아직 기록된 활동 일지가 없습니다.</p>
                <p className="text-sm mt-2">위의 '일지 추가' 버튼을 눌러 기록을 시작하세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
