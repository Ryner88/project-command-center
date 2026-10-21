# Reliability and incident runbook

## What to check first

1. Open `/api/live`. A `200` response means the application process can answer requests.
2. Open `/api/ready`. A `200` response means the database is configured and migrated. A `503` response means traffic should stay away from this instance.
3. Sign in and open `/api/diagnostics`. Record the build ID, uptime, failed operation count, last failure, and request ID.
4. Search runtime logs for that request ID. Logs contain operation names, status codes, and durations without request bodies or client content.

## Alert thresholds

| Signal               | Warning               | Page the operator                  |
| -------------------- | --------------------- | ---------------------------------- |
| Liveness             | One failed check      | Two checks fail within two minutes |
| Readiness            | One `503`             | Two consecutive `503` responses    |
| Failed operations    | Three in five minutes | Five in five minutes               |
| Health response time | Over 1 second         | Over 2 seconds for three checks    |
| Backup workflow      | One failed run        | No verified backup within 26 hours |

Run liveness and readiness checks once per minute. Production logs can be read in the hosting dashboard or forwarded through a log drain. Alerts should include the URL, build ID, status, and request ID. They must not include request bodies, cookies, passwords, connection strings, or client content.

## Database outage

1. Confirm `/api/live` remains `200` and `/api/ready` returns `503`.
2. Check the database provider status and connection limit.
3. Pause write traffic. Do not switch production to demo data.
4. Restore database connectivity, then wait for `/api/ready` to return `200`.
5. Run a read and one reversible write through the UI. Confirm both request IDs finish successfully in the logs.

Readiness performs short retries because it is safe to repeat a database probe. Mutations are not retried automatically.

## Failed migration

1. Stop the release before routing production traffic to the new build.
2. Save the migration output and identify the last applied migration with `npx prisma migrate status`.
3. If the migration made no durable change, fix it and test again on a restored copy of production data.
4. If it changed data or schema, restore the pre-migration backup or apply the reviewed forward repair. Do not edit migration history by hand.
5. Run the clean migration test and the production smoke test before trying the release again.

## Bad release or restart loop

1. Check liveness, readiness, and the first error for the current build ID.
2. Roll application traffic back to the previous working build.
3. Confirm the previous build is compatible with the current schema. Restore the pre-release database backup if it is not.
4. Verify sign-in, an existing project, an existing proposal, and HTML export.

## Restore drill

1. Create a new database whose name contains `restore`.
2. Run `RESTORE_DATABASE_URL=... scripts/restore-database.sh BACKUP.dump`.
3. Start the application against the restored database.
4. Verify `/api/ready`, a known project, a known proposal, and an export download.
5. Record the backup timestamp, restore duration, row counts, build ID, and result.

## Malformed input or repeated user error

A malformed mutation should return `400` with a short message. Use the request ID to find the operation name and status. If the same valid action repeatedly returns `500`, treat it as an application incident and use the rollback steps above.

## Closing an incident

Record the start and end time, affected build, affected operations, request IDs, user impact, recovery action, and follow-up owner. Remove any secrets or client content before saving the report.
