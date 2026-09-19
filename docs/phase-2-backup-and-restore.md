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

The importer accepts schema version 1, validates its records, requires an empty database, and writes all records in one transaction. It preserves user, seed, and proposal IDs. Export metadata is rebuilt from each proposal ID, so deployment-specific paths from the source are not copied.

## Tested restore record: 2026-09-18

- Source: disposable PostgreSQL 16 database with the original three migrations, one production-shaped user, seed, proposal, and export, followed by the Phase 2 migration.
- Stable record: `upgrade_proposal` linked to `upgrade_seed` and `demo-user`.
- Targets: clean disposable databases `pcc_phase2_restore_test` for portable JSON and `pcc_phase2_dump_restore` for the PostgreSQL dump.
- Migration status: all four migrations applied; no pending migrations after restore.
- App health: `/api/health` returned `status: ok`, database mode, and migrated database.
- Record read: `/proposals/upgrade_proposal` returned 200 and rendered the proposal title without a browser error overlay.
- Export read: `/api/proposals/upgrade_proposal/export/download` returned 200 with `text/html; charset=utf-8`.

Delete restore targets and local backup files after recording the drill. Never run the restore script against production.
