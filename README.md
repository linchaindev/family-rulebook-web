# 📖 KH 패밀리룰북 2026

> **가족이 함께 합의한 생활 규칙을 디지털로 관리하는 웹앱**  
> 스크린타임 추적, 규칙 카드 시스템, 용돈 자동 정산, 월말평가까지 — 종이 규칙집을 대체하는 가족 거버넌스 플랫폼

[![Version](https://img.shields.io/badge/version-1.0.6-blue)](https://familyrules-7fpmmwr5.manus.space)
[![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20tRPC%2011-61dafb)](https://react.dev)
[![DB](https://img.shields.io/badge/database-TiDB%20%2F%20MySQL-orange)](https://tidbcloud.com)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

**🌐 라이브 사이트:** [familyrules-7fpmmwr5.manus.space](https://familyrules-7fpmmwr5.manus.space)  
**📄 개발 백서:** [whitepaper.html](https://familyrules-7fpmmwr5.manus.space/whitepaper.html) — 아키텍처, DB 스키마, Fork 가이드 포함

---

## 왜 만들었나

KH 패밀리는 부모 2인과 자녀 3인으로 구성된 5인 가족입니다. 2026년 초, 스크린타임 문제와 생활 습관 개선을 위해 가족 전원이 합의한 규칙집을 만들었습니다. 처음에는 문서로 시작했지만, 규칙을 실제로 *추적하고 정산하는* 도구가 없으면 선언에 그친다는 걸 금방 깨달았습니다.

그래서 직접 만들었습니다.

단순한 규칙 열람 페이지가 아니라, **매일 데이터를 기록하고 매달 자동으로 정산하는 운영 가능한 시스템**을 목표로 설계했습니다. 월말이 되면 DDC 스크린타임 순위가 자동으로 계산되고, 상금·벌금이 용돈에 반영되며, 가족 투표로 매니저를 평가합니다. 모든 과정이 DB에 기록되고 누구나 조회할 수 있습니다.

---

## 핵심 기능

### 🖥️ DDC — 디지털 디톡스 챌린지
가족 5인의 일별 스크린타임을 기록하고 월간 순위를 매깁니다. 순위에 따라 용돈 상금/벌금이 자동 적용됩니다.

| 순위 | 상금/벌금 |
|------|---------|
| 1등 | +5만원 |
| 2등 | +3만원 |
| 3등 | 0원 |
| 4등 | -3만원 |
| 5등 | -5만원 |

### 🃏 RCR — 규칙 준수 카드 시스템
규칙 위반·준수를 10가지 카드 타입으로 기록합니다. 옐로/레드 계열은 벌칙, 그린 계열은 보상, 골든 카드는 매니저 1개월 면제입니다.

### 💰 용돈 자동 정산
월말평가 완료 시 아래 공식으로 최종 용돈이 자동 계산됩니다:

```
최종 용돈 = 기본 용돈 + DDC 상금/벌금 + RCR 카드 효과 + FA 버프/너프 + 매니저 보상
```

### 🗳️ 월말평가
가족 5인이 당월 패밀리 매니저(FM)를 평가합니다. 투표 결과에 따라 매니저 보상이 결정되고, 다음 달 FM 비밀번호가 자동 생성됩니다.

### 🔐 이중 접근 제어
- **FM(패밀리 매니저)**: 4자리 월별 비밀번호 → 매니저 입력 페이지
- **FA(패밀리 감사)**: 6자리 전역 비밀번호 → 감사 관리 페이지 (DDC 수정, 카드 발급, 버프/너프, 평가 관리)

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, TypeScript 5.9, Tailwind CSS 4, shadcn/ui |
| 라우팅 | Wouter 3 |
| 백엔드 | Express 4, tRPC 11, Zod |
| ORM / DB | Drizzle ORM 0.44, TiDB (MySQL 호환) |
| 인증 | Manus OAuth 2.0, JWT 세션 쿠키 |
| 빌드 | Vite 7, esbuild |
| 호스팅 | Manus Platform (Autoscale) |

---

## 프로젝트 구조

```
family-rulebook-web/
├── client/
│   ├── public/
│   │   └── whitepaper.html        ← 개발 백서
│   └── src/
│       ├── App.tsx                ← 라우트 정의
│       ├── pages/
│       │   ├── Home.tsx           ← 랜딩 페이지
│       │   ├── Dashboard.tsx      ← DDC 순위 대시보드
│       │   ├── Profile.tsx        ← 멤버 프로필 + 용돈 내역
│       │   ├── AuditorAdmin.tsx   ← FA 감사 관리 (4탭)
│       │   ├── ManagerInput.tsx   ← FM 매니저 입력
│       │   ├── ManagerEvaluation.tsx ← 월말평가 + 정산
│       │   ├── Comments.tsx       ← 가족 소통 게시판
│       │   └── FamilyGames.tsx    ← 룰렛/사다리 게임
│       └── components/
│           ├── RouletteGame.tsx
│           └── LadderGame.tsx
├── server/
│   ├── routers.ts                 ← 모든 tRPC 프로시저 (핵심)
│   ├── db.ts                      ← DB 헬퍼 함수
│   └── _core/                     ← 프레임워크 플러밍 (OAuth, JWT 등)
├── drizzle/
│   └── schema.ts                  ← DB 스키마 (14개 테이블)
├── database/                      ← DB 백업 JSON 파일
└── scripts/
    └── backup-db.mjs              ← DB 백업 스크립트
```

---

## 로컬 실행

### 사전 요구사항
- Node.js 22+
- pnpm 9+
- MySQL 또는 TiDB 인스턴스

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/linchaindev/family-rulebook-web.git
cd family-rulebook-web

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정 (.env 파일 생성)
cp .env.example .env
# .env 파일을 열어 아래 값들을 채워넣으세요

# 4. DB 스키마 적용
pnpm db:push

# 5. 개발 서버 실행
pnpm dev
# → http://localhost:3000
```

### 필수 환경 변수

```env
DATABASE_URL=mysql://user:password@host:4000/dbname?ssl={"rejectUnauthorized":true}
JWT_SECRET=your-random-32-char-secret
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=your-manus-open-id
OWNER_NAME=your-name
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
```

---

## 이 프로젝트를 Fork해서 쓰려면

이 앱은 특정 가족을 위해 만들어졌지만, 구조 자체는 **어느 가족이든 그대로 가져다 쓸 수 있게** 설계했습니다.

### 가족 구성원 변경

`server/routers.ts` 상단의 `FAMILY_MEMBERS` 배열만 수정하면 됩니다:

```ts
const FAMILY_MEMBERS = [
  { id: "dad",  name: "아빠", emoji: "👨" },
  { id: "mom",  name: "엄마", emoji: "👩" },
  { id: "child1", name: "첫째", emoji: "🧒" },
  // 원하는 만큼 추가/제거
];
```

### DDC 상금/벌금 규칙 변경

`server/routers.ts`의 `DDC_PRIZES` 객체를 수정합니다:

```ts
const DDC_PRIZES: Record<number, number> = {
  1: 5,   // 1등: +5만원
  2: 3,
  3: 0,
  4: -3,
  5: -5,
};
```

### 기본 용돈 변경

코드 수정 없이 FA 관리 페이지 → 용돈/버프 탭에서 UI로 직접 설정 가능합니다.

### 앱 이름 변경

```env
VITE_APP_TITLE=우리 가족 룰북
VITE_APP_LOGO=https://your-logo-url.png
```

> 📄 더 자세한 Fork 가이드는 **[개발 백서](https://familyrules-7fpmmwr5.manus.space/whitepaper.html)**를 참고하세요.

---

## DB 백업

`database/` 폴더에 전체 DB 스냅샷이 JSON 형식으로 저장되어 있습니다.  
수동으로 다시 백업하려면:

```bash
node scripts/backup-db.mjs
```

> ⚠️ 비밀번호 필드(`password`, `managerPassword`)는 마스킹 처리되어 커밋됩니다.

---

## 변경 이력

| 버전 | 날짜 | 주요 변경사항 |
|------|------|-------------|
| v1.0.6 | 2026-03-02 | DDC 상금/벌금 규칙 개정, 월말평가 FA 전용 이동, 이사 프로젝트 링크 추가, 개발 백서 추가 |
| v1.0.5 | 2026-02-28 | CelebrationPage DDC 스냅샷 기반 순위, 용돈 breakdown_formula 저장 |
| v1.0.4 | 2026-02-25 | 월말평가 취소(롤백) 기능, FA 감사 페이지 평가 관리 탭 |
| v1.0.3 | 2026-02-20 | 월말평가 전면 개편, Canvas 폭죽 축하 페이지 |
| v1.0.2 | 2026-02-15 | DDC 0 저장 버그 수정, INSERT ON DUPLICATE KEY UPDATE 적용 |
| v1.0.1 | 2026-02-14 | 룰렛/사다리 게임, 야바위 이스터에그, Web Audio API 효과음 |
| v1.0.0 | 2026-02-09 | 최초 출시 |

---

## 라이선스

MIT License — 자유롭게 Fork하고 수정해서 사용하세요.
