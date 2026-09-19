# Phase 4 threat model

## Access model

Project Command Center is a single-owner workspace. Production requires `APP_ACCESS_PASSWORD` and `SESSION_SECRET`. A successful sign-in creates a signed, HTTP-only, same-site session cookie that expires after 12 hours. The database owner remains the stable application user, and every repository query scopes records to that owner.

## Protected assets

- Project, task, proposal, source, export, and history records
- Client names and project descriptions
- Database credentials, API keys, access passwords, and session secrets
- The integrity of proposal exports and mutation history

## Main threats and controls

| Threat | Control |
| --- | --- |
| Unauthenticated access | Middleware protects pages and APIs. Only sign-in and health checks are public. Production fails closed when access settings are missing. |
| Cross-site mutation | State-changing requests must carry the application's exact origin. Session cookies use `SameSite=Strict`. |
| Cross-owner access | Repository reads and writes include the stable owner ID. Database relationships also enforce owner consistency. |
| Invalid input | Zod schemas validate mutation bodies before services write data. |
| Script injection in exports | Every value inserted into exported HTML is escaped. A restrictive content security policy blocks framing and outside scripts. |
| Secret or error disclosure | Secrets stay in server environment variables. Unexpected production errors return a fixed message. |
| Missing mutation history | Important project, task, proposal, source, status, and export changes create owner-scoped audit events. |
| Vulnerable dependencies | CI blocks high-severity production dependency findings and runs tests and type checks. |
| Demo data in production | Production requires a working database and does not allow the demo store fallback. |

## Operating requirements

Use a long, unique access password and a separate random session secret. Rotate both after suspected exposure. A secret rotation signs out existing sessions. Keep the health endpoint free of credentials and client content.
