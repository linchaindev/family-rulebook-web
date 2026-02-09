import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shuffle, Play, RotateCw } from "lucide-react";
import { Link } from "wouter";
import { FAMILY_MEMBERS } from "@/types/family";
import { toast } from "sonner";

// 사다리 타기 컴포넌트
function LadderGame() {
  const [penalties, setPenalties] = useState<string[]>(Array(5).fill(''));
  const [isPlaying, setIsPlaying] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const handleStart = () => {
    if (penalties.some(p => !p.trim())) {
      toast.error('모든 벌칙을 입력해주세요!');
      return;
    }

    setIsPlaying(true);
    setCurrentStep(0);
    
    // 사다리 타기 시뮬레이션
    const shuffledPenalties = [...penalties].sort(() => Math.random() - 0.5);
    const newResults: Record<string, string> = {};
    
    FAMILY_MEMBERS.forEach((member, index) => {
      newResults[member.id] = shuffledPenalties[index];
    });

    // 애니메이션 효과
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      
      if (step >= FAMILY_MEMBERS.length) {
        clearInterval(interval);
        setResults(newResults);
      }
    }, 800);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setResults({});
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      {!isPlaying ? (
        <>
          <div>
            <h3 className="font-semibold mb-3">벌칙 입력</h3>
            <div className="space-y-3">
              {penalties.map((penalty, index) => (
                <div key={index}>
                  <Label>벌칙 {index + 1}</Label>
                  <Input
                    value={penalty}
                    onChange={(e) => {
                      const newPenalties = [...penalties];
                      newPenalties[index] = e.target.value;
                      setPenalties(newPenalties);
                    }}
                    placeholder={`예: ${index === 0 ? '설거지' : index === 1 ? '청소' : index === 2 ? '빨래' : index === 3 ? '꽝' : '간식 사기'}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={handleStart}>
            <Play className="w-5 h-5 mr-2" />
            사다리 타기 시작!
          </Button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">사다리 타는 중...</h3>
            <p className="text-muted-foreground">스릴 넘치는 순간!</p>
          </div>

          <div className="space-y-3">
            {FAMILY_MEMBERS.map((member, index) => (
              <div
                key={member.id}
                className={`p-4 border-2 rounded-lg transition-all duration-500 ${
                  currentStep > index
                    ? results[member.id]?.includes('꽝')
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                    : 'border-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{member.avatar}</span>
                    <span className="font-semibold text-lg">{member.name}</span>
                  </div>
                  {currentStep > index && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${results[member.id]?.includes('꽝') ? 'text-green-600' : 'text-red-600'}`}>
                        {results[member.id]}
                        {results[member.id]?.includes('꽝') ? '' : ' 당첨!'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {currentStep >= FAMILY_MEMBERS.length && (
            <Button className="w-full" size="lg" onClick={handleReset}>
              <RotateCw className="w-5 h-5 mr-2" />
              다시 하기
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// 룰렛 게임 컴포넌트
function RouletteGame() {
  const [items, setItems] = useState<string[]>(['']);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSpin = () => {
    if (items.some(item => !item.trim())) {
      toast.error('모든 항목을 입력해주세요!');
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // 룰렛 애니메이션 (3초)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * items.length);
      setResult(items[randomIndex]);
      setIsSpinning(false);
    }, 3000);
  };

  const handleNext = () => {
    if (currentPlayer < FAMILY_MEMBERS.length - 1) {
      setCurrentPlayer(prev => prev + 1);
      setResult(null);
    } else {
      setCurrentPlayer(0);
      setResult(null);
    }
  };

  const player = FAMILY_MEMBERS[currentPlayer];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">룰렛 항목 설정</h3>
          <Button size="sm" variant="outline" onClick={addItem}>
            + 항목 추가
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  setItems(newItems);
                }}
                placeholder={`예: ${index === 0 ? '벌칙: 설거지' : index === 1 ? '상금: 5000원' : '꽝'}`}
              />
              {items.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeItem(index)}
                >
                  삭제
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-center">
            <div className="text-6xl mb-2">{player.avatar}</div>
            <div className="text-2xl">{player.name}의 차례</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !isSpinning && (
            <Button className="w-full" size="lg" onClick={handleSpin}>
              <Shuffle className="w-5 h-5 mr-2" />
              룰렛 돌리기!
            </Button>
          )}

          {isSpinning && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-spin">🎰</div>
              <p className="text-2xl font-bold text-primary">룰렛이 돌아가는 중...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className={`text-center py-8 rounded-lg ${
                result.includes('상금') ? 'bg-yellow-50 border-2 border-yellow-500' :
                result.includes('꽝') ? 'bg-green-50 border-2 border-green-500' :
                'bg-red-50 border-2 border-red-500'
              }`}>
                <div className="text-5xl mb-3">
                  {result.includes('상금') ? '💰' : result.includes('꽝') ? '🎉' : '😱'}
                </div>
                <div className="text-3xl font-bold">
                  {result}
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleNext}>
                {currentPlayer < FAMILY_MEMBERS.length - 1 ? '다음 사람' : '처음부터 다시'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FamilyGames() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8 px-4 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-bold mb-2">🎮 패밀리 게임</h1>
          <p className="text-muted-foreground">가족과 함께 즐기는 재미있는 게임!</p>
        </div>

        <Tabs defaultValue="ladder" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ladder">🪜 사다리 타기</TabsTrigger>
            <TabsTrigger value="roulette">🎰 룰렛 돌리기</TabsTrigger>
          </TabsList>

          <TabsContent value="ladder" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>사다리 타기 게임</CardTitle>
                <CardDescription>
                  5가지 벌칙을 입력하고 사다리를 타서 누가 어떤 벌칙을 받을지 정해보세요!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LadderGame />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roulette" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>룰렛 돌리기 게임</CardTitle>
                <CardDescription>
                  벌칙이나 상금을 입력하고 한 명씩 룰렛을 돌려서 결과를 확인하세요!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RouletteGame />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
