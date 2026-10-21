# Phase 2 backup and restore

## Backup schedule

The `Database backup` GitHub Actions workflow runs every day at 05:17 UTC and can also be started manually. It uses the `BACKUP_DATABASE_URL` repository secret, writes a PostgreSQL custom-format dump, checks that PostgreSQL can read the archive, and keeps the artifact for 30 days.

Provider backups remain the first recovery option when they are available. The scheduled dump is a second copy that can be restored without depending on provider tooling. Portable JSON exports are available for owner-controlled recovery with `npm run data:export -- FILE`.

## Restore a database dump

Create an empty non-production database. Its name must contain `test` or `restore`, then run:

```bash
RESTORE_DATABASE_URL='postgresql://...' bash scripts/restore-database.sh backup.dump
```

The script refuses a target that already has PCC tables. It restores the dump, deploys any newer migrations, and checks migration status. Start the app with the restored database URL and verify:

```bash
curl http://localhost:3000/api/health
curl -I http://localhost:3000/proposals/KNOWN_PROPOSAL_ID
curl -I http://localhost:3000/api/proposals/KNOWN_PROPOSAL_ID/export/download
```

## Restore a portable export

Migrate a clean database and import the JSON file:

```bash
DATABASE_URL='postgresql://...' npm run prisma:migrate:deploy
DATABASE_URL='postgresql://...' npm run data:import -- export.json
```

The importer accepts schema version 2, validates its records, requires an empty database, and writes the complete workspace in one transaction. It preserves IDs, relationships, and timestamps for users, briefing items, proposal seeds, projects, proposals, tasks, proposal versions, and audit events. Export metadata is rebuilt from each proposal ID, so deployment-specific paths from the source are not copied.

## Tested restore record: 2026-09-18

- Source: disposable PostgreSQL 16 database with the original three migrations, one production-shaped user, seed, proposal, and export, followed by the Phase 2 migration.
- Stable record: `upgrade_proposal` linked to `upgrade_seed` and `demo-user`.
- Targets: clean disposable databases `pcc_phase2_restore_test` for portable JSON and `pcc_phase2_dump_restore` for the PostgreSQL dump.
- Migration status: all four migrations applied; no pending migrations after restore.
- App health: `/api/health` returned `status: ok`, database mode, and migrated database.
- Record read: `/proposals/upgrade_proposal` returned 200 and rendered the proposal title without a browser error overlay.
- Export read: `/api/proposals/upgrade_proposal/export/download` returned 200 with `text/html; charset=utf-8`.

Delete restore targets and local backup files after recording the drill. Never run the restore script against production.

## Production rollout record: 2026-09-19

- `BACKUP_DATABASE_URL` was configured as a GitHub Actions secret.
- Backup run `35446168633` completed with PostgreSQL 17, validated the dump, and uploaded the 30-day artifact.
- The production profile found one duplicate briefing seed. Both copies were unreferenced and had identical content; the older record was retained and the newer record `cmqm5zqt60001l704yhjjy5ay` was deleted.
- The profile was repeated after cleanup and returned zero owner mismatches and zero duplicate source-reference groups.
- Final pre-migration backup run `35446278532` completed and uploaded its artifact.
- Migration `20260918120000_durable_integrity` applied successfully. PostgreSQL reports both owner-aware foreign keys and the partial unique source-reference index.
- Production deployment `dpl_ADVB3HR2heKFytAtUEh31i9xZnJ2` reached `READY` and received the production alias.
- Production health returned `ok` in database mode with migrations ready and demo fallback disabled.
- Proposal `cmt3cs0xp0003ld04lk2q3owx` and its HTML export both returned 200.
- A post-migration portable export restored two proposals, three seeds, and regenerated two export records in a clean database. The known proposal rendered in a browser without an error overlay.
- Deployment `dpl_5ByCrdP2YV58QUkRz6dYz3oY8xQ8` remains `READY` as the immediate application rollback target. The Phase 2 migration is additive and remains compatible with that build.
