# Release, rollback, and hotfix runbook

## Required GitHub settings

Protect `main` and require the `quality`, `migrations`, `build`, and `end-to-end` jobs from the CI workflow. Disable direct pushes and require the branch to be current before merge.

Create `preview` and `production` GitHub environments. Require an operator approval for `production`. Store these values in the matching environment:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `PREVIEW_ACCESS_PASSWORD` in preview
- `PRODUCTION_URL` and `PRODUCTION_ACCESS_PASSWORD` in production

Keep preview and production databases, owner passwords, session secrets, OpenAI keys, and backup settings separate in Vercel. The example environment files list the required names without real values.

## Normal release

1. Open a pull request and wait for every CI job to pass.
2. Merge the reviewed change to `main`.
3. Run **Preview release** for the exact `main` commit. The workflow repeats local gates, builds one Vercel artifact, deploys it as a preview, and runs the release smoke test.
4. Open preview `/api/diagnostics`. Record the full build ID and preview URL.
5. Test sign-in, an existing project, an existing proposal, HTML export, liveness, and readiness.
6. Run **Production promotion** with that preview URL and build ID.
7. Approve the protected production environment. The workflow inspects and smoke-tests the candidate before promotion, promotes the same artifact, and smoke-tests production afterward.
8. Save the workflow links, build ID, production URL, migration result, and smoke result in the release record.

A failed command stops its job. Promotion cannot run after a failed candidate smoke test, and a failed production smoke test leaves a visible failed release record.

## Database changes

Take a verified backup before a production migration. Test the migration against a restored copy of production data. Deploy backward-compatible schema changes before code that depends on them. Keep destructive cleanup in a later release after rollback is no longer needed.

## Rollback

1. Find the last working deployment URL and build ID in the previous release record.
2. Confirm the old application can run against the current database schema. Restore the pre-release backup when it cannot.
3. Run **Production rollback** with the previous deployment URL and build ID.
4. Approve the protected production environment.
5. The workflow inspects the target, changes the production alias, and verifies the restored build through diagnostics and authenticated reads.
6. Confirm liveness, readiness, sign-in, project detail, proposal detail, and export.

## Hotfix

1. Branch from the production commit and make the smallest safe change.
2. Open a pull request. Do not bypass CI.
3. Run the normal preview and production promotion workflows.
4. Link the incident, pull request, release workflow, and follow-up work.

If the incident is still active and the previous build is safe, rollback first and prepare the hotfix after service is restored.

## Release record

Record:

- Commit and build ID
- Preview and production URLs
- CI and deployment workflow links
- Migration and backup identifiers
- Smoke-test result
- Operator and approval time
- Rollback target
- Known limitations or follow-up issue numbers
