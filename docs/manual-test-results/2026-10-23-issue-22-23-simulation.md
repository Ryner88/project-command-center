# Issues #22 and #23 — fixture and specification verification

**Date:** October 23, 2026. **Current deliverable:** Documentation and static fixture verification only; no reporting UI or aggregation implementation is included in this PR. **Scope:** Issues #22 and #23 using local, fictional Sarah Chen and Apex Retail Co. proposal fixtures. The feature candidate cross-references #24 but does not specify or test AI-assisted weekly summaries. **Acme approval:** None. **Environment:** Repository checkout and PDF files in the user's Downloads folder; no live Acme system or database was accessed.

| Check                                     | Result                     | Evidence and limit                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PR #38 discovery worksheet integration    | Passed                     | PR #38 merged into `main` as `3d4e78417056b192761b95908c16583fba2a58cd`.                                                                                                                                                                                                                                                                                                |
| Fixture PDF field inspection              | Passed                     | `pdftotext -layout` and assertions verified both client names, start/due dates, and $9,000–$14,000 estimate range in the selected PDFs. Exact SHA-256 hashes are in the [reporting specification](../client-proposals/acme-dashboard-reporting-specification.md).                                                                                                       |
| Simulated metric arithmetic               | Passed                     | An isolated two-record calculation produced total 2, Draft 1, Sent 1, open range $18,000–$28,000. Client filter returned $9,000–$14,000; moving Apex to Won reduced open range to $9,000–$14,000. The records' statuses were simulated, not extracted from PDFs.                                                                                                        |
| Existing automated unit/integration suite | Passed                     | `npm test`: 8 files, 34 tests passed. These tests exercise existing application behavior; they do not prove the candidate Acme dashboard or reporting contract is implemented.                                                                                                                                                                                          |
| Manual source separation review           | Passed                     | The feature and reporting drafts label proposal metrics as agency simulation and leave Acme pages, charts, KPI formulas, source systems, targets, roles, and approvals pending.                                                                                                                                                                                         |
| Proposed reporting UI acceptance R01–R05  | Future implementation gate | The scenarios specify tests for a later implementation; this documentation PR does not deliver that UI or aggregation code. No dedicated client/project/date-range reporting UI or saved simulated fixture dataset was tested. The existing proposal dashboard has status/domain filters and status cards; that does not satisfy the candidate reporting specification. |
| Additional edge cases R08–R10             | Future implementation gate | Zero results, unsupported status or prohibited transitions, and owner isolation are specified for later implementation and have not been run against a reporting UI.                                                                                                                                                                                                    |
| Acme real-time tests R06–R07              | Blocked by requirements    | Named Acme sources, volumes, timing thresholds, failure policy, test access, and authorized approval remain undefined.                                                                                                                                                                                                                                                  |

## Reproduce the local fixture checks

The original PDFs are deliberately outside Git. Set the two paths to the matching local files, then run this command with Python 3 and `pdftotext` installed. Hash mismatches mean the files differ from the inspected fixtures; do not treat a different export as the same evidence.

```bash
SARAH_PDF='/path/to/sarah-chen-sarah-chen-website-redesign-proposal.pdf'
APEX_PDF='/path/to/apex-retail-co-e-commerce-platform-redesign.pdf'
python3 - "$SARAH_PDF" "$APEX_PDF" <<'PY'
import hashlib
import subprocess
import sys
from pathlib import Path

fixtures = [
    (Path(sys.argv[1]), 'ed8f704cd5c8e5044c61eaac33e6845445ba1970385e839c37b8ae1ee39d9456', ('Sarah Chen', 'October 23, 2026', 'February 4, 2027')),
    (Path(sys.argv[2]), '44110dff8e657835f2563824c5bc94bb1817901797c07bb5241b195df444c412', ('Apex Retail Co.', 'November 1, 2026', 'June 15, 2027')),
]
for path, expected_hash, fields in fixtures:
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected_hash, path
    content = subprocess.check_output(['pdftotext', '-layout', str(path), '-'], text=True)
    assert all(field in content for field in fields), path
    assert '$9,000 -' in content and '$14,000' in content, path

records = [('Sarah Chen', 'DRAFT', 9000, 14000), ('Apex Retail Co.', 'SENT', 9000, 14000)]
def totals(rows):
    open_rows = [r for r in rows if r[1] in ('DRAFT', 'IN_REVIEW', 'SENT')]
    return len(rows), {s: sum(r[1] == s for r in rows) for s in ('DRAFT', 'IN_REVIEW', 'SENT', 'WON', 'LOST')}, (sum(r[2] for r in open_rows), sum(r[3] for r in open_rows))
assert totals(records) == (2, {'DRAFT': 1, 'IN_REVIEW': 0, 'SENT': 1, 'WON': 0, 'LOST': 0}, (18000, 28000))
assert totals(records[:1])[2] == (9000, 14000)
assert totals([records[0], ('Apex Retail Co.', 'WON', 9000, 14000)])[2] == (9000, 14000)
print('Fixture and worked-example checks passed')
PY
```

The local arithmetic check validates only the worked example. There is no new production aggregation code in this PR to unit test; any later implementation must add tests for zero records, missing or invalid values, filtered results, status changes and invalid transitions, date boundaries, and owner isolation before claiming the proposed reporting behavior passed. No unredacted fixture PDF was committed. Issues #22 and #23 remain open pending Acme agreement and acceptance evidence.
