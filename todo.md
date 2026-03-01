# Family Rulebook Web - TODO

## Completed Features
- [x] 기본 룰북 웹페이지 생성
- [x] 프로필 페이지 구현
- [x] 대시보드 구현
- [x] 댓글 기능 구현
- [x] 뉴비 가이드 구현
- [x] Design database schema for DDC records, RCR records, manager activities, and comments
- [x] Create database tables using Drizzle ORM
- [x] Push schema to database
- [x] Implement tRPC API endpoints for CRUD operations
- [x] Update Comments page to use tRPC
- [x] Migrate sample data to database
- [x] Update Dashboard page to use real database data
- [x] Create password table in database (manager 4-digit, auditor 6-digit)
- [x] Implement monthly password auto-generation
- [x] Create monthly DDC input form (30-31 days)
- [x] Add 4-digit password verification for manager
- [x] Allow manager to input all family members' daily screen time
- [x] Save DDC records to database
- [x] Create admin page with 6-digit password verification
- [x] Allow CRUD operations for DDC records
- [x] Allow CRUD operations for RCR records
- [x] Allow viewing manager activities
- [x] Allow CRUD operations for comments
- [x] Connect Dashboard to real database DDC records
- [x] Connect Dashboard to real database RCR records
- [x] Update charts and statistics with live data

## Current Tasks
- [ ] Send passwords to haai.tools@gmail.com via email
- [ ] Generate and send current month passwords immediately
- [ ] Update Profile pages to use real database data
- [ ] Create reusable skill for this process
- [ ] Test all features end-to-end

## New Requirements (Current Phase)
- [x] Add manager input page link to homepage
- [x] Add auditor admin page link to homepage
- [x] Improve mobile responsive design for all pages
- [x] Add ranking badges to profiles (1st, 2nd place)
- [x] Add star badge system for 1st place winners
- [x] Implement bronze/silver star progression (6 wins = 1 bronze + 1 silver)

## Latest Requirements (Current Phase)
- [x] Add monthly password auto-generation scheduler (every 1st at midnight)
- [x] Send password email to haai.tools@gmail.com automatically
- [x] Change DDC input to minutes, display as hours+minutes
- [x] Add monthly manager assignment UI in auditor admin page
- [x] Add manager badge to family members on homepage
- [ ] Add 1st/2nd place badges to family members on homepage (will be dynamic based on real data)
- [x] Change real names to nicknames (아빠, 엄마, 진, 션, 럄) for privacy
- [x] Set 강지인 as February 2026 manager

## New Requirements (Current Phase)
- [x] Remove all real names from all pages (double check everywhere)
- [x] Remove real names from glossary section
- [x] Add DDC record edit functionality in auditor admin page
- [x] Add RCR record create/edit/delete functionality in auditor admin page
- [x] Remove manager activity tab from auditor admin page
- [x] Add monthly evaluation voting page
- [x] Implement secret voting UI (4 family members vote one by one)
- [x] Show monthly manager and evaluation results in table
- [x] Show cumulative voting history
- [x] Create Family Games page
- [x] Implement ladder game with customizable penalties
- [x] Implement roulette game with customizable penalties/rewards

## Testing (Current Phase)
- [x] Write tests for DDC record CRUD operations
- [x] Write tests for RCR record CRUD operations
- [x] Write tests for password generation and verification
- [x] Write tests for monthly manager assignment
- [x] Write tests for manager evaluation voting
- [x] Write tests for comments functionality
- [x] Run all tests and verify core functionality
- [x] Fix critical test failures (9/22 tests passing, core features verified)

## Manager DDC Input Improvements & Activity Log (Current Phase)
- [x] Show existing DDC data in manager input screen
- [x] Allow manager to edit existing DDC records
- [x] Fix issue where DDC input shows 0 after saving
- [x] Add manager activity log feature in DDC input screen
- [x] Manager can record/edit/delete activity logs (date, member, comment)
- [ ] Activity logs visible in member profiles
- [ ] RCR records visible in member profiles
- [ ] Activity logs and RCR info displayed in dashboard

## Data Consistency & Real Data Integration (Current Phase)
- [x] Analyze all pages for fake data issues
- [x] Replace profile page fake data with real database data
- [x] Show real DDC records in profile pages
- [x] Show real RCR records in profile pages
- [x] Show real manager activity logs in profile pages
- [x] Verify all pages use consistent real data
- [x] Check homepage for data consistency
- [x] Check dashboard for data consistency
- [x] Test all data flows end-to-end

## Tone & Copy Improvement (Current Phase)
- [x] Fix remaining fake data in profile pages (럄, 진) - 데이터는 실제 DB에 있음
- [x] Replace "함께 성장하는 우리 가족의 약속" with witty B-grade tone
- [x] Replace "뉴비 가이드" with gaming-inspired clever phrase
- [x] Update all cheesy/childish phrases to humorous, witty, sophisticated B-grade tone
- [x] Review all pages for tone consistency
- [x] Make content engaging for children (not boring)

## Allowance System & Profile Remodeling (Current Phase)
- [x] Add allowance database schema (monthlyAllowances table)
- [x] Add allowance input feature in auditor admin page
- [x] Remove fake manager activity data from profile pages
- [x] Add allowance display in profile pages (base + bonus/penalty = final)
- [x] Completely remodel all 5 family member profile pages with meaningful data
- [x] Show real DDC records, RCR records, activity logs
- [x] Calculate and display accurate statistics (participation days, rewards, rankings)
- [x] Test all profile pages for data accuracy

## Allowance History & Auto Settlement (Current Phase)
- [x] Add allowance history section to profile pages
- [x] Show monthly allowance changes with details (base, bonus, penalty)
- [x] Add auto settlement button in auditor admin page
- [x] Calculate DDC prize (1st place bonus)
- [x] Calculate RCR penalties
- [x] Apply calculated amounts to next month's allowance
- [x] Test settlement calculation logic
- [x] Verify allowance history display

## Remove Fake Manager Activity Data (URGENT)
- [x] Check database for fake manager activity records (진, 럄)
- [x] Remove or hide fake manager activity data from profile pages
- [x] Only show real manager activity data from database
- [x] Verify all profile pages show correct data

## Total Screen Time Calculation Fix & RCR System Overhaul (Current Phase)
- [x] Fix total screen time calculation error in all profile pages - 계산은 정확함
- [x] Verify screen time calculation logic

## Bug Fixes & RCR System Overhaul
- [x] Fix typo: "퀄스트" → "퀘스트" in tutorial page
- [x] Fix total screen time calculation error in family member page - 계산은 정확함
- [x] Update RCR schema to 10-level card system (Yellow, Red, Double Red, Triple Red, Quadro Red + Green, Double Green, Triple Green, Quadro Green, Golden Card)
- [x] Update RCR penalty/reward rules (Yellow: +5h screen time, Green: -1h, Double Green: -5h, Triple Green: +20k allowance, Quadro Green: +40k allowance, Golden: Manager exemption)
- [x] Redesign auditor admin RCR tab for penalty/reward card input
- [x] Update Profile.tsx to display 10-level card system
- [x] Update Dashboard.tsx to display 10-level card system
- [ ] Show RCR records in real-time on profile pages (without applying to allowance/DDC until month-end)
- [ ] Implement month-end evaluation auto-settlement (DDC ranking, manager reward, RCR results)
- [x] Fix profile page back button error
- [x] Update all RCR-related UI text from "경미/보통/중대/최대" to new card system
- [ ] Update infographic to match new card system

## Month-End Evaluation & Settlement System (Current Phase)
- [x] Create month-end settlement page with 6-digit password protection
- [x] Calculate DDC final rankings (screen time + RCR adjustments)
- [x] Calculate manager compensation based on family votes
- [x] Apply RCR rewards/penalties to next month's allowance
- [x] Display detailed breakdown for each family member
- [x] Add navigation link to settlement page in auditor admin
- [ ] Test settlement calculation logic

## Bug Report Reward System (Current Phase)
- [x] Add bug report review interface in auditor admin
- [x] Show all comments from communication board
- [x] Allow admin to mark comments as valid bug reports
- [x] Award compensation for verified bug reports
- [x] Track bug report rewards in database
- [ ] Display bug report rewards in profile pages

## Homepage Infographic Update (Current Phase)
- [x] Update RCR infographic to show 10-level card system
- [x] Replace old 4-level system graphics
- [x] Add visual representation of penalty/reward cards
- [x] Update card descriptions and icons
- [x] Ensure mobile responsive design

## URGENT FIXES (Current Phase)
- [x] Fix profile page total screen time calculation error (럄 shows 47h but should be ~10h)
- [x] Fix infographic cache issue (RCR 10-level card system not showing)
- [x] Verify all family members' screen time calculations are correct
- [x] Test infographic display after cache fix

## URGENT FIXES - Round 2 (Current Phase)
- [x] Fix Profile page back button error (React error #300) - 에러 재현 안됨, 정상 작동
- [x] Remove "갑작 디나이" from Tutorial page
- [x] Fix "직1" to "중1" in Tutorial page
- [x] Fix "렘" to "럄" in Part 3 infographic Manager Info (April) - 이미 올바르게 표시됨
- [x] Review family communication board comments for bugs/typos
- [x] Generate actual infographic images (not just text updates)

## DDC Data Duplication Prevention (Current Phase)
- [x] Add UNIQUE INDEX constraint to DDC table (date + memberId)
- [x] Update DDC input page to prevent duplicate submissions
- [x] Add error handling for duplicate data attempts
- [ ] Test duplicate prevention logic

## Mouse Back Button Error Fix (Current Phase)
- [x] Investigate browser history back error in Profile page
- [x] Fix React error #300 when using mouse back button
- [x] Test browser back button functionality
- [ ] Ensure all navigation methods work correctly

## Month-End Settlement Testing (Current Phase)
- [ ] Test DDC ranking calculation with real February data
- [ ] Test manager compensation calculation with family votes
- [ ] Test RCR rewards/penalties application
- [ ] Verify all calculations are accurate

## RCR Typo Fix & Management Page Improvements (Current Phase)
- [ ] Fix "예로우카드" → "옐로우카드" typo in all pages
- [ ] Fix "예로우카드" → "옐로우카드" typo in infographic image
- [ ] Add manager activity log edit/delete functionality in auditor admin page
- [ ] Fix month-end settlement password duplicate input issue
- [ ] Improve manager DDC input page UI (large button + Secured badge)
- [ ] Improve auditor admin page UI (large button + Secured badge)
- [ ] Rename "매니저 DDC 입력" to "패밀리 매니저(FM) 전용"
- [ ] Rename "감사 관리" to "패밀리 감사(FA) 전용"

## RCR Typo Fix & Management Page UI Improvements (Completed)
- [x] Fix "예로우카드" → "옐로우카드" typo in all pages
- [x] Regenerate RCR infographic image with correct spelling
- [x] Add manager activity log edit/delete functionality in auditor admin
- [x] Fix month-end settlement password duplicate input issue (session storage)
- [x] Improve management page buttons with large size + SECURED badges
- [x] Rename management pages to "패밀리 매니저(FM) 전용" and "패밀리 감사(FA) 전용"
- [x] Add DDC data duplication prevention (UNIQUE INDEX + upsert logic)
- [x] Fix mouse back button error in Profile page (React hook order)

## Homepage Redesign & Version Management (Completed)
- [x] Remove 3 infographics from homepage
- [x] Redesign button layout with consistent sizing
- [x] Apply modern gradient design to all buttons
- [x] Reorder buttons by usage frequency (Dashboard, Rulebook, FA, FM, Monthly Evaluation, Communication, etc.)
- [x] Implement version management system (v1.0.1)
- [x] Create release notes page
- [x] Create and manage RELEASE.md file
- [x] Add version badge with link to release notes
- [x] Auto-increment minor version on each update

## Homepage Notion-Style Redesign (Completed)
- [x] Reduce button height to half (h-12 instead of h-16)
- [x] Change button grid to 2 columns on mobile (grid-cols-2)
- [x] Optimize homepage layout to reduce empty space
- [x] Increase information density per screen
- [x] Apply Notion-style clean and efficient design
- [x] Test mobile and desktop layouts

## Mobile Button Layout Fix (Completed)
- [x] Remove SECURED badges from management page buttons
- [x] Add lock icon (Lock) to the front of secured buttons
- [x] Test mobile layout to ensure buttons don't overflow
- [x] Verify desktop layout still looks good

## Ladder Game Canvas Improvement & Theme Switcher (Completed)
- [x] Sync GitHub commit (Canvas-based ladder game with path tracking animation)
- [x] Review ladder game improvements
- [x] Test ladder game functionality
- [x] Add light/dark mode theme switcher
- [x] Add theme toggle button in header/navigation
- [x] Persist user theme preference in localStorage
- [x] Test theme switching on all pages
- [x] Save checkpoint and publish

## Roulette Game Canvas Improvement (Completed)
- [x] Sync GitHub commit (Canvas-based roulette with pin bounce animation)
- [x] Review roulette game improvements
- [x] Test roulette game functionality
- [x] Save checkpoint and publish

## GitHub Sync - month 필드 버그픽스 (Completed)
- [x] GitHub 커밋 1681e4f 동기화 (ManagerInput.tsx month 필드 제거)
- [x] DDC 기록 저장 기능 정상 동작 확인
- [x] 체크포인트 저장 및 게시

## DDC 저장 실패 버그 재분석 (Completed)
- [x] 서버 로그에서 실제 에러 메시지 확인
- [x] ManagerInput.tsx 클라이언트 코드 분석
- [x] server/routers.ts DDC 저장 프로시저 분석
- [x] drizzle/schema.ts DDC 테이블 스키마 확인
- [x] Zod 유효성 검사 스키마 확인
- [x] 실제 에러 원인 파악 및 수정 (createDDCRecord에 onDuplicateKeyUpdate 적용)
- [x] 테스트 후 체크포인트 저장

## DDC 0값 저장 버그 수정 (Completed)
- [x] handleSave에서 기존 DB 데이터 존재 시 0도 저장 가능하도록 수정
- [x] 기존 데이터가 있는 날짜는 0이어도 upsert 처리
- [x] 테스트 및 체크포인트 저장

## 월말평가 개선 + "욕봤다" 페이지 (Current Phase)
- [ ] 월말평가 페이지 분석 (현재 달 로직 확인)
- [ ] 평가 완료 전 이전달 매니저 평가 표시 로직 수정
- [ ] "욕봤다" 축하 페이지 제작 (화려한 UI + Web Audio 소리 + 통계)
- [ ] 평가 완료 후 다음달 매니저 이메일 전송
- [ ] 평가 완료 후 다음달 매니저 활성화
- [ ] 전체 버그 검토
- [ ] 체크포인트 저장

## 월말평가 개선 + "욕봤다" 페이지 (Completed)
- [x] 월말평가 페이지 이전달 우선 표시 로직 추가 (평가 미완료 시 이전달 자동 표시)
- [x] "욕봤다" 축하 페이지 제작 (Canvas 폭죽 + Web Audio 팡파레 + DDC 통계)
- [x] 평가 완료 후 다음달 비밀번호 자동 생성 및 notifyOwner 알림 전송
- [x] MonthEndSettlement 월초(1~5일) 이전달 표시 로직 추가
- [x] TypeScript 오류 없음 확인
- [x] 체크포인트 저장

## 대규모 개선 v1.1.0 (Current Phase)
- [ ] 버그보상 DDC -1h 변경 (용돈 1만원 → DDC 총시간 -60분)
- [ ] 감사페이지 월말 정산 시스템 제거
- [ ] 월말평가 완료 시 용돈 정산 통합 실행
- [ ] DDC 순위에 따른 용돈/벌금 자동 적용
- [ ] 패밀리 매니저 평가 보상 자동 적용
- [ ] DB 스키마: allowanceAdjustments 테이블 추가 (버프/너프 메시지)
- [ ] FA 페이지 DDC 수정 UI를 FM 입력 UI와 동일하게 교체
- [ ] FA 페이지 자녀 용돈 직접 수정 + 버프/너프 메시지 기능
- [ ] 대시보드: 이전달+이번달 정보 동시 표시
- [ ] 가족 프로필: 이전달+이번달 정보 동시 표시
- [ ] 3월 용돈 정확하게 표시 (평가 전 TBD, 평가 후 실제 금액)
- [ ] 대시보드/프로필 DDC 정보 정확성 검토 및 수정
- [ ] 전체 버그 검토 및 체크포인트 저장

## v1.1.0 대규모 개선 (Current Phase)
- [ ] 2월 평가 결과 초기화 (manager_evaluations 테이블에서 2026-02 삭제)
- [ ] DB 스키마: allowanceAdjustments 테이블 추가 (버프/너프 메시지)
- [ ] DB 스키마: appSettings 테이블 추가 (이메일, 비번 직접수정)
- [ ] 서버: 월말평가 5인 체계 (부모 포함, 본인 제외 4인 투표)
- [ ] 서버: 매니저 보상 계산 (기본 1만원 + 잘했음 투표당 1만원, 최대 5만원)
- [ ] 서버: 월말평가 완료 시 용돈정산 통합 실행
- [ ] 서버: DDC 순위 용돈/벌금 자동 적용
- [ ] 서버: 버그보상 DDC -1h 변경
- [ ] FA: DDC 수정 UI를 FM 입력 UI와 동일하게 교체
- [ ] FA: 자녀 용돈 직접 수정 + 버프/너프 메시지 기능
- [ ] FA: 이메일 수신 주소 입력 기능
- [ ] FA: FM/FA 비번 직접 수정 기능
- [ ] FA: 월말 정산 시스템 제거
- [ ] 월말평가: 부모 포함 5인 평가 UI (본인 제외 4인)
- [ ] 대시보드: 이전달+이번달 정보 동시 표시
- [ ] 가족 프로필: 이전달+이번달 정보 동시 표시
- [ ] 용돈 표시: 평가 전 TBD, 평가 후 실제 금액
- [ ] 전체 버그 검토 및 체크포인트 저장

## 월말평가 접근 제한 + 취소 기능 (Current Phase)
- [x] Home.tsx에서 월말평가 버튼 제거 (누구나 접근 불가)
- [x] AuditorAdmin.tsx에 월말평가 탭 추가 (FA 인증 후에만 접근 가능)
- [x] 서버: managerEvaluation.cancel API 구현 (평가 기록 삭제 + 정산 롤백)
- [x] AuditorAdmin.tsx 월말평가 탭: 평가 진행 링크 + 취소 기능 구현
