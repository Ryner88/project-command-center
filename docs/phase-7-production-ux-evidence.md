# Phase 7 production UX and portfolio evidence

Branch: `phase-7-production-ux-portfolio`

## Acceptance targets

| Check             | Target                                                                                          |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Accessibility     | No serious or critical WCAG A or AA violations on the home, project, and proposal pages         |
| Keyboard access   | The first Tab reveals a skip link that moves focus to the main content                          |
| Responsive layout | No horizontal page overflow at 390 by 844 pixels                                                |
| Performance       | Median browser load time across three warm proposal reloads stays below 3 seconds               |
| Empty state       | A local workspace without a database or demo file starts with no saved proposals                |
| Demo isolation    | Sample data loads only after the user selects **Load demo workspace**; production returns `404` |

## Manual workflow

Use an isolated local demo environment without `DATABASE_URL`:

1. Open the home page and confirm that the demo notice says the workspace is empty.
2. Navigate by keyboard. Confirm that the skip link appears first and moves focus to the main content.
3. Open the proposal dashboard and confirm the empty-state instructions.
4. Return home and select **Load demo workspace**.
5. Confirm that the sample proposal appears and opens from the dashboard.
6. Resize the browser to 390 by 844 pixels. Check the navigation, cards, forms, and proposal content for clipping or horizontal scrolling.
7. Run `npm run test:e2e:phase7` and save its two screenshots.

## Evidence files

- `docs/assets/phase-7-mobile-home.png`
- `docs/assets/phase-7-desktop-proposals.png`
- `docs/assets/phase-7-demo-workflow.webm`

## Result

Completed on 2026-09-20 in an isolated local demo workspace:

- Axe found no serious or critical WCAG A or AA violations on the home, project, or populated proposal dashboard.
- Keyboard testing confirmed that the first Tab reveals the skip link and Enter moves focus to the main content.
- The 390 by 844 pixel checks found no horizontal page overflow.
- The final three warm proposal reloads completed in 2,092, 2,171, and 3,933 ms. The 2,171 ms median passed the 3-second target.
- The workspace started with no proposal data. The sample proposal appeared only after selecting **Load demo workspace**.
- The populated dashboard and saved proposal detail worked without editing a file or database row.
- The screenshots and WebM recording listed above were captured from this isolated run.

The first test run found a stale seeded-ID expectation, recorded in GitHub issue #8. An interrupted server run was recorded in issue #9. The populated accessibility scan found an unlabeled status control and insufficient badge contrast, recorded in issue #10. Issue #11 tracked the unstable development-server network-idle measurement. Issue #12 recorded the project page error in no-database demo mode. Each application or test problem was fixed and tested again before its issue was closed.
