import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Save, Calendar } from "lucide-react";
import { Link } from "wouter";
import { FAMILY_MEMBERS } from "@/types/family";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ManagerInput() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // DDC 데이터 상태 (날짜별, 멤버별)
  const [ddcData, setDdcData] = useState<Record<string, Record<string, number>>>({});
  
  const verifyPasswordMutation = trpc.password.verifyManager.useQuery(
    { month: selectedMonth, password },
    { enabled: false }
  );
  
  const createBatchMutation = trpc.ddc.createBatch.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count}개의 DDC 기록이 저장되었습니다!`);
      setDdcData({});
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

  const getDaysInMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  };

  const handleInputChange = (date: string, memberId: string, value: string) => {
    const screenTime = parseInt(value) || 0;
    setDdcData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [memberId]: screenTime,
      },
    }));
  };

  const handleSave = () => {
    const records = [];
    for (const [date, members] of Object.entries(ddcData)) {
      for (const [memberId, screenTime] of Object.entries(members)) {
        if (screenTime > 0) {
          records.push({ date, memberId, screenTime });
        }
      }
    }
    
    if (records.length === 0) {
      toast.error('입력된 데이터가 없습니다.');
      return;
    }
    
    createBatchMutation.mutate({ records });
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

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>매니저 DDC 입력</CardTitle>
                  <CardDescription>4자리 비밀번호를 입력하세요</CardDescription>
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
                <Label>매니저 비밀번호 (4자리)</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
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

  const daysInMonth = getDaysInMonth(selectedMonth);
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return `${selectedMonth}-${day}`;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-4 md:py-8 px-2 md:px-4 max-w-7xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">룰북으로 돌아가기</span>
            <span className="sm:hidden">돌아가기</span>
          </Button>
        </Link>

        <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">매니저 DDC 입력</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              <Calendar className="w-4 h-4 inline mr-1" />
              {selectedMonth} ({daysInMonth}일)
            </p>
          </div>
          <Button onClick={handleSave} size="default" className="w-full sm:w-auto" disabled={createBatchMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {createBatchMutation.isPending ? '저장 중...' : '저장하기'}
          </Button>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>월간 스크린타임 입력 (단위: 분)</CardTitle>
            <CardDescription>
              각 가족 구성원의 일별 스크린타임을 입력하세요. 0 또는 빈 칸은 저장되지 않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-2 md:mx-0">
              <table className="w-full border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b-2">
                    <th className="p-2 md:p-3 text-left font-bold sticky left-0 bg-background z-10">날짜</th>
                    {FAMILY_MEMBERS.map((member) => (
                      <th key={member.id} className="p-2 md:p-3 text-center font-bold min-w-[100px] md:min-w-[120px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl">{member.avatar}</span>
                          <span className="text-sm">{member.name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dates.map((date) => {
                    const day = new Date(date).getDate();
                    const dayOfWeek = new Date(date).getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    
                    return (
                      <tr key={date} className={`border-b ${isWeekend ? 'bg-muted/30' : ''}`}>
                        <td className="p-2 md:p-3 font-medium sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <Badge variant={isWeekend ? "secondary" : "outline"}>
                              {day}일
                            </Badge>
                            {isWeekend && (
                              <span className="text-xs text-muted-foreground">주말</span>
                            )}
                          </div>
                        </td>
                        {FAMILY_MEMBERS.map((member) => (
                          <td key={member.id} className="p-1 md:p-2">
                            <Input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              placeholder="0"
                              value={ddcData[date]?.[member.id] || ''}
                              onChange={(e) => handleInputChange(date, member.id, e.target.value)}
                              className="text-center"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={createBatchMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            {createBatchMutation.isPending ? '저장 중...' : '저장하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
