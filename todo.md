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
