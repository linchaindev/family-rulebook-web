import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Shield, Target, Sparkles, BookOpen, Users } from "lucide-react";
import { Link } from "wouter";

export default function NewbieGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        {/* 헤더 */}
        <div className="text-center mb-12">
          <Badge className="mb-4 text-base" variant="secondary">
            🎮 직1 럄이를 위한 특별 가이드
          </Badge>
          <h1 className="text-5xl font-bold mb-4">초보자 튜토리얼</h1>
          <p className="text-xl text-muted-foreground">
            왜 우리 가족에게 룰북이 필요할까? 게임처럼 쉽게 설명해줌게!
          </p>
        </div>

        {/* 인트로 */}
        <Card className="mb-8 bg-primary/5 border-primary border-2">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold">안녕, 럄아!</h2>
              <p className="text-lg leading-relaxed">
                중학생이 되면서 갑자기 난이도가 하드모드로 바뀔지? 학원 몸샷, 숙제 보스, 
                친구들과의 레이드... 그런데 부모님은 자꾸 "공부해라", "핸드폰 그만 봐라" 
                이런 난이도 높은 퀘스트만 주시잖아?
              </p>
              <p className="text-lg leading-relaxed font-semibold text-primary">
                그래서 우리 가족은 <strong>"공식 룰북"</strong>을 제작했어! (게임 규칙서 같은 거지)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 왜 룰북이 필요할까? */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            왜 룰북이 필요할까?
          </h2>

          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎯</div>
                  <CardTitle className="text-xl">1. 명확한 기준이 생겨요</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg">
                  <strong>Before:</strong> "엄마, 친구랑 PC방 가도 돼요?" → "안 돼!" (갑작 디나이 😠)
                </p>
                <p className="text-lg">
                  <strong>After:</strong> "숙제 다 했고, 30분 이내니까 가도 되겠네!" → 자동 승인! 😊
                </p>
                <div className="bg-primary/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold">
                    💡 룰북이 있으면 허가/금지 조건이 명확해서 부모님과의 PvP가 줄어들어요!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">⚖️</div>
                  <CardTitle className="text-xl">2. 공평해요</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg">
                  룰북은 <strong>엄마, 아빠도 지켜야 해요!</strong> DDC는 부모님도 참여하는 
                  서바이벌 게임이잖아? 그래서 "나만 왜 이래!" 이런 억울함이 사라져요.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold">
                    💡 전원 같은 규칙 적용 = 공평한 게임! 이건 진짜 밸런스 패치예요.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">💰</div>
                  <CardTitle className="text-xl">3. 보상이 명확해요</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg">
                  DDC 1등 하면 <strong>5만원</strong>, 매니저 잘하면 <strong>최대 5만원</strong>! 
                  열심히 하면 돈을 벌 수 있어요. 반대로 규칙 안 지키면 벌금도 있지만, 
                  그건 미리 알고 있으니까 억울하지 않아요.
                </p>
                <div className="bg-accent/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold">
                    💡 노력하면 보상받고, 잘못하면 벌금 내는 게 명확하니까 동기부여가 돼요!
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🚀</div>
                  <CardTitle className="text-xl">4. 스스로 성장할 수 있어요</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg">
                  매니저 시스템은 <strong>학생들이 스스로</strong> 가족 일정을 관리하는 거예요. 
                  부모님이 다 해주는 게 아니라, 너희가 직접 동생들 깨우고, 숙제 챙기고, 
                  통계 작성하면서 책임감을 배워요.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg mt-4">
                  <p className="font-semibold">
                    💡 나중에 어른이 되면 이런 능력이 진짜 중요해요. 지금부터 연습하는 거예요!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 왜 지켜야 할까? */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            왜 지켜야 할까?
          </h2>

          <div className="space-y-6">
            <Card className="border-2 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="py-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🏠</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">1. 가족이 더 행복해져요</h3>
                      <p className="text-lg">
                        규칙이 없으면 매일 싸우고, 짜증내고, 서로 불만만 쌓여요. 
                        룰북이 있으면 "이건 규칙이니까" 하고 넘어가서 싸움이 줄어들어요.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-3xl">📱</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">2. 핸드폰 중독을 막아요</h3>
                      <p className="text-lg">
                        DDC는 스크린타임을 줄이려는 거예요. 핸드폰을 너무 많이 보면 
                        공부도 안 되고, 눈도 나빠지고, 친구들이랑 진짜 대화도 못 해요. 
                        지금 습관을 잡아야 나중에 후회 안 해요!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💪</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">3. 미래를 위한 투자예요</h3>
                      <p className="text-lg">
                        지금 숙제 미루지 않고, 일찍 자고, 규칙 지키는 습관을 들이면 
                        나중에 고등학생, 대학생, 어른이 되어서도 성공할 확률이 높아져요. 
                        지금은 힘들어도 미래의 나를 위한 거예요!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🤝</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">4. 서로 존중하는 법을 배워요</h3>
                      <p className="text-lg">
                        존댓말 쓰기, 보고하기, 허락받기 같은 건 "귀찮은 규칙"이 아니라 
                        <strong>"서로 존중하는 방법"</strong>이에요. 나중에 사회에 나가도 
                        이런 게 중요해요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 럄이에게 특별히 */}
        <Card className="border-2 border-accent bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl">럄이에게 특별히 💛</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              중학생이 되면서 많은 게 달라졌지만, 이 룰북은 <strong>너를 힘들게 하려는 게 아니야</strong>. 
              오히려 <strong>너를 보호하고, 성장시키려는 거야</strong>.
            </p>
            <p className="text-lg">
              처음엔 어색하고 귀찮을 수 있어. 하지만 조금씩 익숙해지면, 
              "아, 이게 나한테 도움이 되는구나" 하고 느낄 거야.
            </p>
            <p className="text-lg font-semibold text-accent-foreground">
              가족 모두가 너를 응원하고 있어. 우리 함께 성장해보자! 💪
            </p>
            <div className="flex gap-4 justify-center mt-6 flex-wrap">
              <Link href="/">
                <Button size="lg" variant="default">
                  <BookOpen className="w-4 h-4 mr-2" />
                  룰북 보러 가기
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  <Target className="w-4 h-4 mr-2" />
                  대시보드 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 자주 묻는 질문 */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            자주 묻는 질문
          </h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Q. 규칙이 너무 많지 않아요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  처음엔 많아 보이지만, 대부분 "당연히 해야 하는 것들"이에요. 
                  숙제하기, 일찍 자기, 존댓말 쓰기 같은 거요. 익숙해지면 자연스러워져요!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Q. 친구들은 이런 거 안 하는데...</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  다른 집은 다른 방식이 있을 거예요. 하지만 우리 가족은 이 방식이 
                  가장 잘 맞아요. 그리고 나중에 보면, 규칙 있는 집 아이들이 
                  더 성공하는 경우가 많아요!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Q. 규칙을 바꿀 수 있나요?</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  물론이죠! 불만이나 건의사항이 있으면 <strong>보고용 단톡방</strong>에 
                  제안하세요. 합리적이면 가족 회의를 통해 룰북을 수정할 수 있어요. 
                  룰북은 고정된 게 아니라 계속 발전하는 거예요!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 마무리 */}
        <Card className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 border-2">
          <CardContent className="py-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-2xl font-bold mb-4">우리 가족, 함께 성장해요!</h3>
            <p className="text-lg mb-6">
              룰북은 우리를 묶어두는 게 아니라, 함께 성장하게 도와주는 도구예요. 
              힘들 때도 있겠지만, 가족 모두가 함께하니까 괜찮을 거예요! 💕
            </p>
            <Link href="/">
              <Button size="lg">
                룰북 시작하기 🚀
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
