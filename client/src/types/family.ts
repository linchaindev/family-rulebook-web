export interface FamilyMember {
  id: string;
  name: string;
  nickname: string;
  role: 'parent' | 'student';
  avatar: string;
  icon: string;
  color: string;
}

export interface DDCRecord {
  date: string;
  screenTime: number; // in minutes
  memberId: string;
}

export interface ManagerActivity {
  month: string;
  managerId: string;
  missions: {
    wakeup: number; // completion count
    academy: number;
    homework: number;
    sleep: number;
    settlement: number;
    evaluation: number;
  };
  oVotes: number; // O표 개수
  reward: number; // 지급액 (만원)
}

export interface RCRRecord {
  date: string;
  memberId: string;
  level: 'minor' | 'moderate' | 'major' | 'maximum';
  reason: string;
  appliedBy: string; // 감사 이름
}

export interface Comment {
  id: string;
  type: 'praise' | 'suggestion';
  from: string;
  to: string;
  content: string;
  date: string;
}

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'dad', name: '아빠', nickname: '아빠', role: 'parent', avatar: '👨', icon: '👨', color: '#3498DB' },
  { id: 'mom', name: '엄마', nickname: '엄마', role: 'parent', avatar: '👩', icon: '👩', color: '#E74C3C' },
  { id: 'jin', name: '진', nickname: '진', role: 'student', avatar: '👧', icon: '👧', color: '#9B59B6' },
  { id: 'sean', name: '션', nickname: '션', role: 'student', avatar: '🧒', icon: '🧒', color: '#F39C12' },
  { id: 'liam', name: '럄', nickname: '럄', role: 'student', avatar: '👦', icon: '👦', color: '#1ABC9C' },
];
