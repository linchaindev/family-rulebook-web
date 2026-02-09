import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Megaphone, 
  Clock, 
  BookOpen, 
  HandshakeIcon, 
  PiggyBank, 
  MessageSquare,
  Smartphone,
  CalendarCheck,
  PieChart,
  Sun,
  School,
  Book,
  Moon,
  Calculator,
  Vote,
  Users,
  Shield,
  Target,
  Gift,
  AlertTriangle,
  ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <Badge className="mb-4 text-base px-4 py-2" variant="outline">
            v1.0.0 · 2026년 2월 9일 시행
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            2026 KH 패밀리 룰북
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            함께 성장하는 우리 가족의 약속
          </p>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            KH 패밀리가 함께 성장하고 건강한 생활습관을 만들기 위해 전원 합의하에 제정한 규칙입니다.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => scrollToSection('core-principles')} className="text-lg">
              룰북 보기
            </Button>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg">
                대시보드
              </Button>
            </Link>
            <Link href="/newbie-guide">
              <Button size="lg" variant="secondary" className="text-lg">
                뉴비 가이드 🎓
              </Button>
            </Link>
          </div>
          <div className="flex gap-3 justify-center flex-wrap mt-4">
            <Link href="/comments">
              <Button variant="ghost" size="sm">
                💬 가족 소통 게시판
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => scrollToSection('glossary')}>
              📖 용어집
            </Button>
          </div>
        </div>
      </section>

      {/* Family Members */}
      <section className="container py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">가족 구성원</h2>
          <p className="text-muted-foreground">프로필을 클릭하면 개인별 DDC 순위와 매니저 활동을 확인할 수 있어요</p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {[
            { id: 'dad', name: '강혁 (아빠)', avatar: '👨', color: '#3498DB', role: '감사' },
            { id: 'mom', name: '하정현 (엄마)', avatar: '👩', color: '#E74C3C', role: '감사' },
            { id: 'jin', name: '강지인 (진)', avatar: '👧', color: '#9B59B6', role: '팀원' },
            { id: 'sean', name: '강시현 (션)', avatar: '🧒', color: '#F39C12', role: '팀원' },
            { id: 'liam', name: '강리암 (럄)', avatar: '👦', color: '#1ABC9C', role: '팀원' },
          ].map((member) => (
            <Link key={member.id} href={`/profile/${member.id}`}>
              <Card className="border-2 hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                <CardContent className="pt-6 text-center">
                  <div 
                    className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl"
                    style={{ backgroundColor: `${member.color}20`, border: `3px solid ${member.color}` }}
                  >
                    {member.avatar}
                  </div>
                  <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                  <Badge variant="outline">{member.role}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Core Principles */}
      <section id="core-principles" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">핵심 원칙</h2>
          <p className="text-muted-foreground">우리 가족이 지향하는 4가지 가치</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Shield className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>투명성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">모든 보고와 허락은 카톡으로 기록</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Users className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>상호 책임</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">부모 포함 전 가족 참여</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Target className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>자율성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">학생들이 스스로 관리하는 매니저 시스템</p>
            </CardContent>
          </Card>
          <Card className="border-2 hover:shadow-lg transition-all">
            <CardHeader>
              <Gift className="w-12 h-12 mb-4 text-primary" />
              <CardTitle>보상과 제재</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">명확한 인센티브 및 페널티 체계</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Part 1: Daily Rules */}
      <section id="part1" className="container py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-base" variant="secondary">Part 1</Badge>
            <h2 className="text-4xl font-bold mb-4">데일리 룰 (DR)</h2>
            <p className="text-xl text-muted-foreground">일상생활 7대 원칙과 차등 레드카드 시스템</p>
          </div>

          {/* RCR Warning */}
          <Card className="mb-8 border-destructive border-2 bg-destructive/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">레드카드 룰 (RCR)</CardTitle>
                  <CardDescription>위반 수위에 따른 4단계 차등 제재</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <Badge variant="destructive">경미</Badge>
                <span className="text-sm">DDC 스크린타임 -5시간 차감</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-100 rounded-lg border border-red-300">
                <Badge variant="destructive">중등</Badge>
                <span className="text-sm">용돈 1만원 삭감 + 전자기기 1주일 금지</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-200 rounded-lg border border-red-400">
                <Badge variant="destructive">중대</Badge>
                <span className="text-sm">용돈 3만원 삭감 + 전자기기 2주일 금지</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-red-300 rounded-lg border border-red-500">
                <Badge variant="destructive">최대</Badge>
                <span className="text-sm font-bold">용돈 전액 삭감 + 전자기기 한 달 금지</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                💡 특정 감사(엄마)의 패널티에 이의제기는 다른 감사(아빠)에게 요청 가능
              </p>
            </CardContent>
          </Card>

          {/* 7 Rules Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="rule1" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-6 h-6 text-primary" />
                  <span className="font-bold">1. 언행 규칙</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p>• 미성년자는 어른에게 <strong>존댓말만</strong> 사용</p>
                <p>• 말끝을 짧게 줄이지 않기</p>
                <p>• 어른에게 화를 내거나 징징대는 행동 금지</p>
                <Badge variant="destructive" className="mt-2">위반 시 → RCR 적용</Badge>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule2" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Megaphone className="w-6 h-6 text-primary" />
                  <span className="font-bold">2. 보고 체계</span>
                  <Badge variant="outline" className="ml-2">보고용 단톡방</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p className="font-semibold">모든 보고는 <span className="text-primary">보고용 단톡방</span>으로 전달:</p>
                <p>• 학교/학원 시작/끝 시간</p>
                <p>• 숙제가 나오는 즉시 보고</p>
                <p>• 친구 만남, 간식, PC방 등 <strong>30분 이상 소요 활동</strong> 사전 허락</p>
                <Badge variant="destructive" className="mt-2">사후 적발 시 → RCR 적용</Badge>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule3" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="font-bold">3. 생활 습관 규칙</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p>• <strong>방학 중:</strong> 오전 10시 기상</p>
                <p>• <strong>학기 중:</strong> 오전 7시 30분 기상</p>
                <p>• 아침에 짜증 내기 / 문 세게 닫기 / 화내기 금지</p>
                <p>• <strong>밤 11시 정각</strong> 전자기기 안방 충전 스테이션 반납</p>
                <p>• 일/월/화/수/목요일 새벽 수면 엄수</p>
                <Badge variant="destructive" className="mt-2">위반 시 → RCR 적용</Badge>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule4" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                  <span className="font-bold">4. 학습 습관 규칙</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p>• 숙제가 나오는 <strong>즉시 그날 안에 반드시 완료</strong></p>
                <p>• 숙제가 남아있는 한 → 모든 취미생활 금지</p>
                <p>• 숙제하는 동안 전자기기 사용 금지 (필요 시 부모님 허락)</p>
                <Badge variant="destructive" className="mt-2">숙제 미루기 적발 시 → RCR 적용</Badge>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule5" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <HandshakeIcon className="w-6 h-6 text-primary" />
                  <span className="font-bold">5. 공동생활 참여 규칙</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p className="font-semibold">주간 당번제:</p>
                <p>• 분리수거: 2명 / 설거지: 1명 (매주 순환)</p>
                <p>• 주말 설거지는 식사 준비를 하지 않은 사람들이 담당</p>
                <p className="font-semibold mt-4">방 청소:</p>
                <p>• 본인 방은 본인이 직접 청소</p>
                <p>• 매주 <strong>일요일 밤</strong> 부모님 점검</p>
                <Badge variant="destructive" className="mt-2">더러운 방 판정 시 → RCR 적용</Badge>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule6" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-6 h-6 text-primary" />
                  <span className="font-bold">6. 소비 원칙</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p>• 용돈 외 필요한 돈은 부모님께 <strong>승낙받고</strong> 소비</p>
                <p>• 외식 금지 - 모든 3끼는 <strong>집밥</strong>으로 해결</p>
                <p>• 간식은 <strong>30분 이내</strong> 소요 + <strong>본인 용돈</strong>으로 해결</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rule7" className="border rounded-lg px-6">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  <span className="font-bold">7. 불만/건의 절차</span>
                  <Badge className="ml-2">NEW</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pt-4">
                <p>• 불만, 요구사항, 건의사항은 <span className="text-primary font-semibold">보고용 단톡방</span>에 공식 면담 요청</p>
                <p>• 감사에게 별도 카톡으로 언제든지 문의 가능</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Infographic */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Part 1 인포그래픽</h3>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663101403784/YkrImXOmuHnSfbJR.png" 
              alt="Part 1 데일리 룰 인포그래픽" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Part 2: DDCR */}
      <section id="part2" className="container py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-base" variant="secondary">Part 2</Badge>
            <h2 className="text-4xl font-bold mb-4">디지털 디톡스 챌린지 룰 (DDCR)</h2>
            <p className="text-xl text-muted-foreground">전 가족 참여 스크린타임 관리 챌린지</p>
          </div>

          <Card className="mb-8 bg-primary/5 border-primary">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <CardDescription className="text-base">
                  부모 포함 <strong>전 가족이 참여</strong>하며, 매일 스크린타임을 투명하게 공개하고 자기 반성을 통해 디지털 중독을 예방합니다.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Process Timeline */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2">
              <CardHeader>
                <Smartphone className="w-10 h-10 mb-2 text-primary" />
                <CardTitle className="text-xl">1. 데일리 리포트</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• 매일 <strong>오전 10시</strong>까지 제출</p>
                <p>• <Badge variant="outline">보고용 단톡방</Badge> 제출</p>
                <p>• 전날 스크린타임 캡처</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CalendarCheck className="w-10 h-10 mb-2 text-primary" />
                <CardTitle className="text-xl">2. 예외 규정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• <strong>주말 면제</strong> (방학 중)</p>
                <p>• <strong>학습 시간 제외</strong></p>
                <p>• 감사 검토 후 최종 산정</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <PieChart className="w-10 h-10 mb-2 text-primary" />
                <CardTitle className="text-xl">3. 월말 결산</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>• 매니저가 통계 작성</p>
                <p>• 감사가 순위 발표</p>
                <p>• 상금 및 벌금 집행</p>
              </CardContent>
            </Card>
          </div>

          {/* Awards Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">월말 시상 및 벌금</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-yellow-100 rounded-lg border-2 border-yellow-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥇</span>
                    <span className="font-bold text-lg">1등</span>
                  </div>
                  <span className="font-bold text-xl text-yellow-700">+50,000원</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border-2 border-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥈</span>
                    <span className="font-bold text-lg">2등</span>
                  </div>
                  <span className="font-bold text-xl text-gray-700">+30,000원</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🥉</span>
                    <span className="font-bold text-lg">3등</span>
                    <Badge className="ml-2">NEW</Badge>
                  </div>
                  <span className="font-bold text-xl text-gray-500">0원</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-300">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">4️⃣</span>
                    <span className="font-bold text-lg">4등</span>
                  </div>
                  <span className="font-bold text-xl text-red-600">-30,000원</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-100 rounded-lg border-2 border-red-400">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">5️⃣</span>
                    <span className="font-bold text-lg">5등</span>
                  </div>
                  <span className="font-bold text-xl text-red-700">-50,000원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infographic */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Part 2 인포그래픽</h3>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663101403784/oZXOjuuHiKUuUPnn.png" 
              alt="Part 2 디지털 디톡스 챌린지 룰 인포그래픽" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Part 3: FMR */}
      <section id="part3" className="container py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-base" variant="secondary">Part 3</Badge>
            <h2 className="text-4xl font-bold mb-4">패밀리 매니저 룰 (FMR)</h2>
            <p className="text-xl text-muted-foreground">학생 주도 학습 스케줄링 자율 책임 시스템</p>
          </div>

          {/* Manager Info */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl mb-2">Manager Order</CardTitle>
                  <p className="text-lg">2월(진) → 3월(션) → 4월(럄) (이후 반복)</p>
                </div>
                <Badge className="text-lg px-4 py-2" variant="default">
                  기본 보상: 월 50,000원 (후불)
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* 6 Missions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <Sun className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>기상 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 2회 이상 팀원 깨우기</p>
                <p>• 방학 10시 / 학기 7:30</p>
                <p>• DDC 리포트 독려</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <School className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>학원 출석</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 월초 스케줄 관리</p>
                <p>• 2회 이상 등교 확인</p>
                <Badge variant="destructive" className="text-xs">지각 시 → 보고 → 감사 RCR</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <Book className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>숙제 독려</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 미완료 팀원 발견 시</p>
                <p>• 즉시 독려</p>
                <p>• 학습 분위기 조성</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <Moon className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>수면 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• 밤 11시 기기 수거</p>
                <p>• 안방 충전 스테이션</p>
                <Badge variant="destructive" className="text-xs">미반납 시 → 보고 → 감사 RCR</Badge>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <Calculator className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>월말 결산</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• DDC 통계 작성</p>
                <p>• 순위 산정</p>
                <p>• 감사에게 보고</p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <Vote className="w-10 h-10 mb-2 text-primary" />
                <CardTitle>활동 평가</CardTitle>
                <Badge className="mt-2">NEW</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• "이번 달 활동 잘했다?"</p>
                <p>• 전 가족 O/X 투표</p>
              </CardContent>
            </Card>
          </div>

          {/* Evaluation Formula */}
          <Card className="bg-accent/10 border-accent border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-center">매니저 활동 평가 (긍정 평가제)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold">
                  <span className="text-primary">O표 개수</span> + 1 = <span className="text-accent-foreground">지급액 (만원)</span>
                </div>
                <div className="flex gap-4 justify-center flex-wrap text-sm">
                  <Badge variant="outline" className="text-base px-4 py-2">O표 4개 → 5만원</Badge>
                  <Badge variant="outline" className="text-base px-4 py-2">O표 2개 → 3만원</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infographic */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">Part 3 인포그래픽</h3>
            <img 
              src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663101403784/gusinLAcDzhCDXtI.png" 
              alt="Part 3 패밀리 매니저 룰 인포그래픽" 
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section id="glossary" className="container py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">용어집</h2>
            <p className="text-muted-foreground">룰북에서 사용되는 주요 용어 정리</p>
          </div>

          <Tabs defaultValue="org" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="org">조직 구성</TabsTrigger>
              <TabsTrigger value="rules">규칙 체계</TabsTrigger>
              <TabsTrigger value="tools">장소 및 도구</TabsTrigger>
            </TabsList>
            <TabsContent value="org" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>KH패밀리 = KH팀</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>강씨, 하씨 가족들 (강혁, 하정현, 강시현, 강지인, 강리암 = 강하션진럄)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>감사</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>부모님 (아빠, 엄마)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>패밀리 매니저, 매니저</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>팀원(학생) 스케줄 관리 담당자</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="rules" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>DR (Daily Rules)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>데일리 룰 - 일상생활 기본 원칙</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>RCR (Red Card Rule)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>레드카드 룰 - DR 위반 시 제재</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>DDCR (Digital Detox Challenge Rules)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>디지털 디톡스 챌린지 룰 - 디지털 사용 관리</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>FMR (Family Manager Rules)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>패밀리 매니저 룰 - 학생 자율 관리 시스템</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tools" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>보고용 단톡방</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>공식 보고/허락 전용 카톡방 (기록용)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>일상 단톡방</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>일상 대화용 카톡방</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>충전 스테이션</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>안방에 위치한 전자기기 보관/충전소</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="container py-16 border-t">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>이의제기 및 제안</CardTitle>
              </CardHeader>
              <CardContent>
                <p>모든 이의제기 및 개선 제안은 <strong>보고용 단톡방</strong>에 제출</p>
                <p className="text-sm text-muted-foreground mt-2">합리적인 제안은 가족 회의를 통해 룰북에 반영</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>다음 정기 검토일</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">2026년 5월 9일</p>
                <p className="text-sm text-muted-foreground mt-2">분기별 검토를 통해 지속적으로 개선</p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>본 룰북은 전 가족의 합의하에 제정되었습니다.</p>
            <p className="mt-2">특별한 사정(질병, 긴급상황 등)이 있을 경우 부모님과 개별 협의 가능</p>
            <p className="mt-4 font-semibold">Version 1.0.0 · 2026년 2월 9일 시행</p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 rounded-full shadow-lg"
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}
