# Project status — CBSE 2026–27

LearnFlex Saathi now uses a CBSE-only curriculum for Classes 6–10. Only CBSE curriculum content is active in the project.

The chapter catalogue uses the available NCERT editions and CBSE 2026–27 scheme references. Subject/language combinations vary by class and school; Class 10 continuing-cohort provisions are represented separately from the new Class IX scheme.

Every chapter/activity module includes 20 original practice questions across four adaptive levels. These are not official CBSE questions and require subject-teacher review.

Run `npm run check` and `npm test` before demo.


## Round 2 quality upgrades

The current package adds three progressive, optional hints to every quiz question; class-scoped evidence-quality summaries for teachers; and reconnect/focus sync retries for authenticated sessions. The service worker now caches the additional quality module and uses cached-first shell delivery with background refresh. The hints do not reduce scores and do not reveal the answer directly.

Generative AI is intentionally excluded. The system relies on deterministic adaptive rules and curated content. Run `npm run check` and `npm test`; run `npm run test:browser` on a machine with an unrestricted local Chromium installation. The browser test may be skipped in managed environments.

This is still a prototype/pilot. CBSE chapter/elective mappings and translations require educator review; privacy and security controls require school-specific legal and security review before real student data is collected. A feature existing in the code is not equivalent to a compliance certification or independently verified classroom outcome.

## Offline workflow update

Version 10 adds IndexedDB subject/chapter downloads, a durable progress outbox, reconnect retry with exponential backoff, slow-network timeouts, Background Sync wake-up where supported, and visible pending-sync status. Offline learning remains local-first; authenticated server validation and score recalculation still occur after reconnection. See `ROUND-2-COVERAGE.md` for the acceptance test and limitations.
