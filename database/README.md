# DB 백업

백업 일시: 2026-07-14T13:08:33.586Z

## 파일 목록

| 파일 | 테이블 | 행 수 |
|------|--------|-------|
| users.json | users | 1 |
| ddc_records.json | ddc_records | 359 |
| rcr_records.json | rcr_records | 9 |
| manager_activities.json | manager_activities | 0 |
| manager_activity_logs.json | manager_activity_logs | 5 |
| family_comments.json | family_comments | 11 |
| passwords.json | passwords | 5 |
| auditor_config.json | auditor_config | 1 |
| monthly_managers.json | monthly_managers | 5 |
| manager_evaluations.json | manager_evaluations | 20 |
| monthly_allowances.json | monthly_allowances | 25 |
| allowance_adjustments.json | allowance_adjustments | 4 |
| bug_report_rewards.json | bug_report_rewards | 0 |
| app_settings.json | app_settings | 1 |
| backup.json | 전체 통합 | 446 |

## 복원 방법

```bash
# 특정 테이블 복원 (예시)
node scripts/restore-db.mjs --table ddc_records
```

> ⚠️ 이 파일들은 자동 생성됩니다. 직접 편집하지 마세요.
