# Round 2 coverage and verification guide

This release intentionally excludes criterion 6 (generative-AI fallback). The platform is designed to function without a generative-AI service.

| Criterion | Included feature | Verification action / limitation |
|---|---|---|
| 2. Root-gap diagnosis | Confidence-aware classification, misconception mapping, Smart Recovery and separate follow-up checks | Test wrong choices and inspect `diagnosticChecks`; mapped errors are hypotheses, not clinical or psychological diagnoses. |
| 3. Efficient diagnostic questions | Mixed foundation/standard/challenge starting set and adaptive question banks | Test new, low-score, uncertain-correct and high-confidence learners. |
| 4. Offline / poor internet | App-shell and curriculum cache, IndexedDB subject/chapter downloads, durable progress outbox and recovery backup, reconnect/background sync, bounded retries, slow-link timeouts and pending-sync status | Follow the offline acceptance test below on HTTPS or localhost. The browser UI rehearsal is still required on the target device; authenticated API data is not cached. |
| 5. Helpful hints (retained) | Three progressive, optional, score-neutral hints; worked examples and feedback | Reveal hints one by one before submitting. |
| 7. Evidence | Real-attempt teacher summaries, consent-gated paired pilot evidence, follow-up outcome log, CSV export | Use real consented attempts; synthetic demo records are excluded. No causal claim is inferred from score change alone. |
| 8. Child-data safety | Authentication, role/class/school scoping, consent register, deletion and retention notes | Complete a deployment-specific privacy/security review before real child data. This is not a certification. |
| 9. Teacher insights | Class-scoped roster, topic gaps, misconception patterns, follow-up checks and evidence-quality panel | Sign in as each teacher and confirm only the assigned class appears. |
| 10. CBSE fit | CBSE/NCERT-aligned Classes 6–10 catalogue and original chapter question banks | School educators must validate textbook editions, electives and local subject combinations. |
| 11. Multilingual support | English/Telugu/Hindi UI selection, supplied translated questions/lesson drafts, speech and accessibility controls | Translation coverage varies by topic; native subject educators must review all drafts before formal use. |
| 12. Motivation | Progress summaries, topic completion, activity history, recovery missions and adaptive levels | Rehearse as a learner with new and returning demo profiles. |
| 13. Progress and sync | Local-first save, authenticated server sync, reconnect/focus retry, server validation and backup export | Verify both browser-local and hosted-server modes; do not assume two devices sync when no backend is running. |
| 14. Code quality | Modular scripts, syntax checks, Node smoke tests and browser smoke tests | Run all scripts; browser test requires a local Chromium installation. |
| 15. Live demo | Demo accounts, student/teacher flows, guided walkthrough and privacy/evidence notes | Follow `DEMO-WALKTHROUGH.md`; use synthetic profiles only for demonstrations. |

## No-AI design statement

LearnFlex Saathi does not call a generative-AI API. Its adaptive decisions are deterministic and based on saved assessment outcomes, confidence, question-level misconception maps and follow-up checks. This keeps explanations predictable and curriculum-linked, while offline packs provide a non-network fallback.

## Offline reliability upgrade (v10)

The offline workflow now includes:
- Service-worker precaching of the complete application shell and curriculum scripts; authenticated `/api/` responses are never cached.
- IndexedDB subject/chapter packs so learners can save one chapter, a whole subject, or all subjects on the current device.
- IndexedDB outbox snapshots of learner progress in addition to the existing localStorage copy, written after saves and when a tab is hidden or closed.
- Automatic reconnect sync, exponential retry/backoff, request timeouts tuned for slower links, and Background Sync wake-up where the browser supports it.
- A visible online / poor-network / offline and pending-sync indicator.
- Merge-on-sync using stable attempt IDs and latest progress timestamps; the server continues to validate submitted answers and recalculate scores. API data is deliberately not cached by the service worker.

Limitations to disclose: offline use requires one successful visit while online on the same browser/device and a secure origin (HTTPS or localhost) for service workers. A learner must have downloaded the relevant subject/chapter before going offline. Background Sync is browser-dependent; reconnect, focus, and visibility retries remain as fallbacks. The browser may evict site storage, so learners should periodically reconnect and sync. Offline work cannot be shared with the teacher until an authenticated backend connection is restored. The bearer session expires after 12 hours; if it expires while offline, sign in again while online to establish a fresh session before syncing.

Manual offline acceptance test: (1) sign in while online and open Learn; (2) download one subject; (3) disconnect the network; (4) reload and sign in with the same local demo account; (5) open a saved chapter and complete practice; (6) reload and verify the result remains; (7) reconnect; (8) verify the pending count returns to zero and the teacher dashboard receives the attempt. Repeat with browser DevTools throttled to Slow 3G to check retries.
