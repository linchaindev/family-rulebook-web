import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import LadderGame from "@/components/LadderGame";
import RouletteGame from "@/components/RouletteGame";

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
                  플레이어 수와 결과를 입력하고 사다리를 타서 누가 어떤 결과를 받을지 정해보세요!
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
