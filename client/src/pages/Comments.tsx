import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Heart, Lightbulb, Send } from "lucide-react";
import { Link } from "wouter";
import { FAMILY_MEMBERS } from "@/types/family";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function Comments() {
  const { data: comments = [], refetch } = trpc.comments.getAll.useQuery();
  const createCommentMutation = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success('댓글이 등록되었습니다! 💕');
      refetch();
      setNewComment({ type: 'praise', from: '', to: '', content: '' });
    },
    onError: () => {
      toast.error('댓글 등록에 실패했습니다.');
    },
  });
  
  const [newComment, setNewComment] = useState({
    type: 'praise' as 'praise' | 'suggestion',
    from: '',
    to: '',
    content: '',
  });

  const handleSubmit = () => {
    if (!newComment.from || !newComment.to || !newComment.content.trim()) {
      toast.error('모든 항목을 입력해주세요!');
      return;
    }

    createCommentMutation.mutate({
      type: newComment.type,
      fromMember: newComment.from,
      toMember: newComment.to,
      content: newComment.content,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="container py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            룰북으로 돌아가기
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">가족 소통 게시판</h1>
          <p className="text-muted-foreground">서로에게 칭찬과 건의사항을 남겨보세요</p>
        </div>

        {/* 댓글 작성 폼 */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle>새 댓글 작성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">댓글 유형</label>
                <Select
                  value={newComment.type}
                  onValueChange={(value: 'praise' | 'suggestion') =>
                    setNewComment({ ...newComment, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="praise">칭찬 💕</SelectItem>
                    <SelectItem value="suggestion">건의 💡</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">보내는 사람</label>
                <Select
                  value={newComment.from}
                  onValueChange={(value) => setNewComment({ ...newComment, from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILY_MEMBERS.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.avatar} {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">받는 사람</label>
              <Select
                value={newComment.to}
                onValueChange={(value) => setNewComment({ ...newComment, to: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="가족">전체 가족</SelectItem>
                  {FAMILY_MEMBERS.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.avatar} {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">내용</label>
              <Textarea
                placeholder="따뜻한 칭찬이나 건설적인 건의사항을 작성해주세요..."
                value={newComment.content}
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                rows={4}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Send className="w-4 h-4 mr-2" />
              댓글 등록
            </Button>
          </CardContent>
        </Card>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">댓글 목록 ({comments.length})</h2>
          
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {comment.type === 'praise' ? (
                        <Heart className="w-6 h-6 text-red-500" />
                      ) : (
                        <Lightbulb className="w-6 h-6 text-yellow-500" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{comment.fromMember}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-semibold">{comment.toMember}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                    </div>
                    <Badge variant={comment.type === 'praise' ? 'default' : 'secondary'}>
                      {comment.type === 'praise' ? '칭찬' : '건의'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed">{comment.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
