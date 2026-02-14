import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle2, Bug, Sparkles } from "lucide-react";

export default function ReleaseNotes() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              룰북으로 돌아가기
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">릴리즈 노트</h1>
          <p className="text-muted-foreground">
            KH 패밀리 룰북의 업데이트 내역을 확인하세요.
          </p>
        </div>

        {/* v1.0.4 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">v1.0.4</CardTitle>
                <CardDescription>2026년 2월 14일</CardDescription>
              </div>
              <Badge variant="default" className="bg-green-600">Latest</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 신규 기능 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                신규 기능
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • 라이트/다크 모드 테마 전환 기능 추가
                </li>
                <li className="text-muted-foreground">
                  • 우측 상단에 테마 토글 버튼 추가 (달/해 아이콘)
                </li>
                <li className="text-muted-foreground">
                  • localStorage에 사용자 테마 선호도 저장
                </li>
                <li className="text-muted-foreground">
                  • 사다리 게임 Canvas 기반으로 완전 개편
                </li>
                <li className="text-muted-foreground">
                  • 경로 추적 애니메이션 추가 (1.4초)
                </li>
                <li className="text-muted-foreground">
                  • 플레이어별 고유 색상으로 경로 표시
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* v1.0.3 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">v1.0.3</CardTitle>
                <CardDescription>2026년 2월 14일</CardDescription>
              </div>
              <Badge variant="secondary">Previous</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 버그 수정 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Bug className="w-5 h-5 mr-2 text-red-600" />
                버그 수정
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • 모바일에서 SECURED 뱃지로 인한 버튼 깨짐 문제 해결
                </li>
                <li className="text-muted-foreground">
                  • SECURED 뱃지를 제거하고 열쇠 아이콘(Lock)으로 대체
                </li>
                <li className="text-muted-foreground">
                  • 모바일 2열 배치에서 버튼이 정상적으로 표시됨
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* v1.0.2 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">v1.0.2</CardTitle>
                <CardDescription>2026년 2월 14일</CardDescription>
              </div>
              <Badge variant="secondary">Previous</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 개선사항 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                개선사항
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • 홈페이지 버튼 크기 축소 (h-16 → h-12, 25% 축소)
                </li>
                <li className="text-muted-foreground">
                  • 모바일에서 버튼 2열 배치 (grid-cols-2)
                </li>
                <li className="text-muted-foreground">
                  • 홈페이지 레이아웃 Notion 스타일로 개선
                </li>
                <li className="text-muted-foreground">
                  • 모든 섹션 여백 축소 (py-16 → py-8 md:py-12)
                </li>
                <li className="text-muted-foreground">
                  • 정보 밀도 증가로 한 화면에 더 많은 정보 표시
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* v1.0.1 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">v1.0.1</CardTitle>
                <CardDescription>2026년 2월 14일</CardDescription>
              </div>
              <Badge variant="secondary">Previous</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 개선사항 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
                개선사항
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • RCR "예로우카드" → "옐로우카드" 오타 수정 (전체 페이지 + 인포그래픽 이미지)
                </li>
                <li className="text-muted-foreground">
                  • 홈페이지 버튼 배치 재디자인 (사용 빈도 순서, 일관성 있는 그라데이션 디자인)
                </li>
                <li className="text-muted-foreground">
                  • 홈페이지 인포그래픽 3개 삭제 (Part 1, 2, 3)
                </li>
                <li className="text-muted-foreground">
                  • 관리 페이지 이름 변경 ("패밀리 매니저(FM) 전용", "패밀리 감사(FA) 전용")
                </li>
                <li className="text-muted-foreground">
                  • 관리 페이지 버튼 UI 개선 (큰 버튼 + SECURED 뱃지)
                </li>
              </ul>
            </div>

            {/* 버그 수정 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Bug className="w-5 h-5 mr-2 text-red-600" />
                버그 수정
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • DDC 데이터 중복 저장 방지 (UNIQUE INDEX + upsert 로직)
                </li>
                <li className="text-muted-foreground">
                  • 프로필 페이지 마우스 back 버튼 에러 수정 (React hook 순서 문제)
                </li>
                <li className="text-muted-foreground">
                  • 월말 정산 비밀번호 중복 입력 문제 해결 (세션 스토리지)
                </li>
              </ul>
            </div>

            {/* 신규 기능 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                신규 기능
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • 매니저 활동 기록 수정/삭제 기능 추가 (감사 관리 페이지)
                </li>
                <li className="text-muted-foreground">
                  • 버전 관리 시스템 구축 (릴리즈 노트 페이지)
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* v1.0.0 */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-2xl">v1.0.0</CardTitle>
              <CardDescription>2026년 2월 9일</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 초기 릴리즈 */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-600" />
                초기 릴리즈
              </h3>
              <ul className="space-y-2 ml-7">
                <li className="text-muted-foreground">
                  • KH 패밀리 룰북 웹사이트 출시
                </li>
                <li className="text-muted-foreground">
                  • 데일리 룰 (DR), 디지털 디톡스 챌린지 (DDC), 패밀리 매니저 룰 (FMR) 구현
                </li>
                <li className="text-muted-foreground">
                  • RCR 10단계 카드 시스템 구현
                </li>
                <li className="text-muted-foreground">
                  • 대시보드, 프로필 페이지, 가족 소통 게시판 구현
                </li>
                <li className="text-muted-foreground">
                  • 매니저 DDC 입력 페이지 구현
                </li>
                <li className="text-muted-foreground">
                  • 감사 관리 페이지 구현
                </li>
                <li className="text-muted-foreground">
                  • 월말 정산 시스템 구현
                </li>
                <li className="text-muted-foreground">
                  • 매니저 평가 시스템 구현
                </li>
                <li className="text-muted-foreground">
                  • 비밀번호 자동 생성 및 이메일 발송 기능
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
