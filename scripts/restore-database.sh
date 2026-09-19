#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || -z "${RESTORE_DATABASE_URL:-}" ]]; then
  echo "Usage: RESTORE_DATABASE_URL=... scripts/restore-database.sh BACKUP.dump" >&2
  exit 2
fi

# The target must be a newly created, empty, non-production database.
if [[ "$RESTORE_DATABASE_URL" != *test* && "$RESTORE_DATABASE_URL" != *restore* ]]; then
  echo "Restore target name must contain test or restore" >&2
  exit 2
fi

if [[ -n "$(psql "$RESTORE_DATABASE_URL" -Atqc "SELECT to_regclass('public.\"User\"')")" ]]; then
  echo "Restore target already contains PCC tables" >&2
  exit 2
fi

pg_restore --no-owner --no-acl --exit-on-error --dbname="$RESTORE_DATABASE_URL" "$1"
DATABASE_URL="$RESTORE_DATABASE_URL" npm run prisma:migrate:deploy
DATABASE_URL="$RESTORE_DATABASE_URL" npx prisma migrate status
echo "Database restored. Start the app with DATABASE_URL set to this target and verify health and a known proposal ID."
