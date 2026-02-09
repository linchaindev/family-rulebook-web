import { drizzle } from "drizzle-orm/mysql2";
import { ddcRecords, rcrRecords, managerActivities, familyComments } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Sample DDC data
const sampleDDCData = [
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

// Sample Manager Activities
const sampleManagerActivities = [
  {
    month: '2026-01',
    managerId: 'liam',
    wakeupCount: 28,
    academyCount: 25,
    homeworkCount: 30,
    sleepCount: 27,
    settlementCount: 1,
    evaluationCount: 1,
    oVotes: 4,
    reward: 5,
  },
  {
    month: '2026-02',
    managerId: 'jin',
    wakeupCount: 25,
    academyCount: 22,
    homeworkCount: 28,
    sleepCount: 24,
    settlementCount: 1,
    evaluationCount: 1,
    oVotes: 3,
    reward: 4,
  },
];

// Sample RCR Records
const sampleRCRRecords = [
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

// Sample Comments
const sampleComments = [
  {
    type: 'praise',
    fromMember: '엄마',
    toMember: '진',
    content: '이번 달 매니저 역할 정말 잘했어! 동생들 깨우는 것도 성실하게 하고, 통계도 꼼꼼하게 작성해줘서 고마워 💕',
    date: '2026-02-08',
  },
  {
    type: 'suggestion',
    fromMember: '럄',
    toMember: '가족',
    content: '주말에 가족 영화 보는 시간 만들면 어떨까요? DDC 1등한 사람이 영화 선택하는 거로!',
    date: '2026-02-07',
  },
  {
    type: 'praise',
    fromMember: '아빠',
    toMember: '션',
    content: '요즘 숙제 미루지 않고 바로바로 하는 모습 보기 좋다. 계속 이렇게 하면 성적도 오를 거야!',
    date: '2026-02-06',
  },
];

async function seed() {
  console.log('Seeding database...');
  
  // Insert DDC records
  for (const record of sampleDDCData) {
    await db.insert(ddcRecords).values(record);
  }
  console.log('DDC records inserted');
  
  // Insert Manager Activities
  for (const activity of sampleManagerActivities) {
    await db.insert(managerActivities).values(activity);
  }
  console.log('Manager activities inserted');
  
  // Insert RCR Records
  for (const record of sampleRCRRecords) {
    await db.insert(rcrRecords).values(record);
  }
  console.log('RCR records inserted');
  
  // Insert Comments
  for (const comment of sampleComments) {
    await db.insert(familyComments).values(comment);
  }
  console.log('Comments inserted');
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
