# Pilot, privacy and evidence protocol

## Before any student pilot

Use synthetic accounts for demonstrations. Before real learner accounts are created, obtain school leadership approval, a written school data-use agreement, parent/guardian consent using the school's approved form, age-appropriate student assent where required, and a named data controller/contact. Explain what is collected, why, who can see it, retention duration, deletion process and how to stop participation.

This package includes a teacher-entered consent status and internal evidence reference, plus a pilot-evidence panel that pairs two distinct saved attempts for the same student and chapter. The panel requires a latest consent record marked Granted and stores the observed baseline/post score change with clarity/usefulness feedback. It does **not** verify a guardian's signature or replace a consent/assent collection workflow. Never upload identity documents, phone numbers, addresses or other sensitive personal data into the demo.

## Suggested small pilot design

- 5–10 students from one class and one topic (start with Class 6 Fractions & Decimals).
- 1–2 mathematics teachers.
- A short pre-assessment before Smart Recovery.
- A different post-assessment after lesson + Smart Recovery.
- A short usability feedback survey for students and teachers.
- Record all scores, completion rates, missing data, unchanged scores, negative feedback and accessibility barriers. Do not report only improvements.

Separate immediate follow-up question correctness from later post-assessment learning. An immediate correct answer indicates a short-term check passed; it is not proof of durable mastery or causation.

## Minimal data categories

The demo currently stores account identifiers/names and role/class/school fields, question responses, answer confidence, score, recovery progress, consent status/reference, paired pilot-evidence records and audit events. Remove any fields not required by the school pilot.

## Access and storage controls in this demo

- Student APIs are authenticated and scoped to the signed-in learner.
- Teacher APIs are scoped by the teacher's class and school, not an individual section. If a school has multiple sections under one class name, assign distinct class/section identifiers before deployment.
- Server checks question IDs and selected answers against the question bank and recalculates the score. Browser-generated score values are not trusted.
- The server uses SQLite and keeps a local database under `data/`; backups are class-scoped JSON exports. Static curriculum assets are loaded from packaged JS files and are not copied into browser localStorage or sync requests. Static curriculum assets are loaded from the packaged JS files and are not copied into browser localStorage or sync requests.
- Configurable automatic retention defaults to 365 days. Set `LEARNFLEX_RETENTION_DAYS` to the school-approved retention period; set `0` only when a documented manual retention/deletion procedure is in place.
- Student self-service account deletion removes the student record and associated progress on the server; the UI also removes the current browser's local student record. Backups may still contain prior exports and must be managed under the school's retention policy.
- Audit events record sign-ins, state sync, assessment and consent-register actions and account deletion.

## Not a production compliance certification

This code is a hackathon/pilot scaffold, not a legal compliance certification, hardened student information system, encrypted end-to-end platform, independently audited security product or verified guardian-consent service. Before real data: security review, dependency review, HTTPS deployment, secure secret handling, backup restore drill, staff access review, incident response contact, retention/deletion verification and school legal/privacy review are required.

## Honest evidence template

| Measure | Pre | Post | Difference | Notes / missing values |
|---|---:|---:|---:|---|
| Mean assessment score | | | | |
| Students completing assessment | | | | |
| Correct on targeted follow-up | n/a | | n/a | Immediate concept check, not long-term mastery |
| Student ease-of-use rating | | | | |
| Teacher usefulness rating | | | | |
| Unchanged/declined scores | | | | |

Do not fill this with invented results. Publish the sample size and limitations alongside any observed change.
