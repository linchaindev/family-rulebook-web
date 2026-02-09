import { DDCRecord, ManagerActivity, RCRRecord } from '@/types/family';
import type { Comment } from '@/types/family';

// 최근 3개월 DDC 샘플 데이터
export const sampleDDCData: DDCRecord[] = [
  // 1월 데이터
  { date: '2026-01-01', screenTime: 180, memberId: 'dad' },
  { date: '2026-01-01', screenTime: 150, memberId: 'mom' },
  { date: '2026-01-01', screenTime: 240, memberId: 'jin' },
  { date: '2026-01-01', screenTime: 300, memberId: 'sean' },
  { date: '2026-01-01', screenTime: 360, memberId: 'liam' },
  
  { date: '2026-01-15', screenTime: 200, memberId: 'dad' },
  { date: '2026-01-15', screenTime: 160, memberId: 'mom' },
  { date: '2026-01-15', screenTime: 220, memberId: 'jin' },
  { date: '2026-01-15', screenTime: 280, memberId: 'sean' },
  { date: '2026-01-15', screenTime: 340, memberId: 'liam' },
  
  // 2월 데이터
  { date: '2026-02-01', screenTime: 190, memberId: 'dad' },
  { date: '2026-02-01', screenTime: 140, memberId: 'mom' },
  { date: '2026-02-01', screenTime: 200, memberId: 'jin' },
  { date: '2026-02-01', screenTime: 260, memberId: 'sean' },
  { date: '2026-02-01', screenTime: 320, memberId: 'liam' },
];

// 매니저 활동 기록
export const sampleManagerActivities: ManagerActivity[] = [
  {
    month: '2026-01',
    managerId: 'liam',
    missions: {
      wakeup: 28,
      academy: 25,
      homework: 30,
      sleep: 27,
      settlement: 1,
      evaluation: 1,
    },
    oVotes: 4,
    reward: 5,
  },
  {
    month: '2026-02',
    managerId: 'jin',
    missions: {
      wakeup: 25,
      academy: 22,
      homework: 28,
      sleep: 24,
      settlement: 1,
      evaluation: 1,
    },
    oVotes: 3,
    reward: 4,
  },
];

// RCR 적용 기록
export const sampleRCRRecords: RCRRecord[] = [
  {
    date: '2026-01-15',
    memberId: 'liam',
    level: 'minor',
    reason: '아침에 짜증내기',
    appliedBy: '엄마',
  },
  {
    date: '2026-01-20',
    memberId: 'sean',
    level: 'moderate',
    reason: '숙제 미루기 + 사후 적발',
    appliedBy: '엄마',
  },
  {
    date: '2026-02-05',
    memberId: 'jin',
    level: 'minor',
    reason: '기기 반납 지연',
    appliedBy: '아빠',
  },
];

// 댓글 샘플 데이터
export const sampleComments: Comment[] = [
  {
    id: '1',
    type: 'praise',
    from: '엄마',
    to: '진',
    content: '이번 달 매니저 역할 정말 잘했어! 동생들 깨우는 것도 성실하게 하고, 통계도 꼼꼼하게 작성해줘서 고마워 💕',
    date: '2026-02-08',
  },
  {
    id: '2',
    type: 'suggestion',
    from: '럄',
    to: '가족',
    content: '주말에 가족 영화 보는 시간 만들면 어떨까요? DDC 1등한 사람이 영화 선택하는 거로!',
    date: '2026-02-07',
  },
  {
    id: '3',
    type: 'praise',
    from: '아빠',
    to: '션',
    content: '요즘 숙제 미루지 않고 바로바로 하는 모습 보기 좋다. 계속 이렇게 하면 성적도 오를 거야!',
    date: '2026-02-06',
  },
];

// 월별 DDC 통계 계산
export function calculateMonthlyDDCStats(records: DDCRecord[]) {
  const monthlyStats: { [key: string]: { [memberId: string]: number } } = {};
  
  records.forEach(record => {
    const month = record.date.substring(0, 7); // YYYY-MM
    if (!monthlyStats[month]) {
      monthlyStats[month] = {};
    }
    if (!monthlyStats[month][record.memberId]) {
      monthlyStats[month][record.memberId] = 0;
    }
    monthlyStats[month][record.memberId] += record.screenTime;
  });
  
  return monthlyStats;
}

// 개인별 DDC 순위 계산
export function calculateDDCRankings(records: DDCRecord[], month: string) {
  const memberTotals: { [memberId: string]: number } = {};
  
  records
    .filter(r => r.date.startsWith(month))
    .forEach(record => {
      if (!memberTotals[record.memberId]) {
        memberTotals[record.memberId] = 0;
      }
      memberTotals[record.memberId] += record.screenTime;
    });
  
  const rankings = Object.entries(memberTotals)
    .map(([memberId, total]) => ({ memberId, total }))
    .sort((a, b) => a.total - b.total);
  
  return rankings;
}
