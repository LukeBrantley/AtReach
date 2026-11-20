# AtReach

AtReach helps the ACO identify and resolve mismatches between payer attribution and the ACO attribution model for members under the ACO's risk. The outreach queue prioritizes mismatches where the model-supported primary care provider is outside the ACO network, followed by mismatches between two in-network providers. By giving the attribution team a focused work queue and the context needed for outreach, the initiative aims to improve care continuity, quality performance, and value-based contract outcomes.

## Working documentation

- [Provisional input data contract](docs/provisional-input-contract.md) — proposed input records, fields, and assumptions for discussion; not yet validated against source data.
- [Future considerations](docs/future-considerations.md) — ideas to evaluate in later iterations, outside the agreed prototype scope.
- [Member outreach definitions](docs/definitions.md) — approved terminology, outcome meanings, and workflow categories for development and the eventual user guide or definitions page.

The [approved preview acceptance checklist](docs/provisional-input-contract.md#approved-preview-acceptance-checklist) calls for a working synthetic-data preview. The dataset plan targets approximately 40 unique members, including at least 20 eligible members in active outreach, with varied payer relationships and follow-up states. Alex, Jordan, Casey, and Taylor are validation examples, not the full preview population.

## The problem

Payer attribution and the provider actually delivering a member's care can differ, particularly in managed Medicaid plans that automatically assign a PCP when the member has not selected one. The ACO may therefore be financially accountable for members whose care, utilization, and care gaps it cannot influence.

This mismatch also means health centers may not receive appropriate credit for care-gap closure and may miss key information about transitions of care, care management, utilization management, and shared savings.

AtReach prioritizes attribution mismatches involving outside-network primary care. Mismatches between two in-network providers are also in scope as a secondary outreach priority. Members with zero claims utilization remain out of scope.

## Goals

- Reduce per-member-per-month (PMPM) costs.
- Improve quality STAR performance.
- Align payer attribution with where members receive primary care.
- Create a repeatable, compliant process for attribution outreach and resolution.

## Process funnel

1. **Identified** — attribution and utilization data indicate an eligible mismatch.
2. **Outreached** — the member has received an outreach attempt.
3. **Engaged** — the member was successfully reached.
4. **Committed** — the member verbally commits to changing PCP information or scheduling with their attributed provider.
5. **Converted** — the payer file reflects the provider change, or the member completes an appointment with their attributed provider within 60 days.
6. **Payer recognized** — the payer confirms the updated attribution.

## How it works

AtReach compares the ACO attribution/utilization model with payer attribution data to surface actionable mismatches. Eligible members appear in a work queue where authorized users can review context, conduct outreach, and document the result.

The default queue order places **Priority 1: OON mismatches** above **Priority 2: in-network mismatches**. Priority explains outreach ordering; it is separate from the model's follow-up flag and the member's outreach status.

During outreach, the team confirms the member's preferred PCP and can help the member:

- Schedule with their attributed provider.
- Change PCP information through the payer's portal or designated process.
- Reinstate an appropriate in-network relationship when eligible.

Each managed Medicaid organization may have its own PCP-change form or procedure. The workflow should support those plan-specific requirements.

## Users

| User group | Primary use |
| --- | --- |
| ACO attribution team | Day-to-day member review, outreach, and outcome documentation. |
| ACO, Quality, VBC, and Finance leaders | Monitor the problem and performance; engage payers strategically. |
| Population Health teams | Refer eligible members into the work queue. |

## Key performance indicators

### Process KPIs

- Number of members not attributed to a ACO provider according to the ACO Attribution Model.
- **Conversion rate:** members with a payer-file provider change or an appointment completed with the attributed provider within 60 days, divided by outreaches.
- **Leading conversion rate:** members with a documented verbal commitment to change provider or schedule an appointment, divided by outreaches.
- **Engagement rate:** members reached, divided by outreaches.

### Outcome KPIs

- Network PMPM.
- Network A1C control rate (A1C <7%).
- Network blood-pressure control rate (definition TBD).
- Network statin medication adherence.

## Measurement plan

Compare the total ACO population with members not attributed to a ACO provider under the ACO Attribution Model. Track:

- PMPM costs
- A1C control rate (<7%)
- Blood-pressure control rate (TBD)
- Prior full-year statin medication adherence
- Member count

## V1 scope

V1 must:

- Identify eligible members.
- Keep cases with unresolved eligibility or priority evidence visible in a separate “Needs review” view, without assigning a guessed outreach priority.
- Prioritize eligible OON mismatches above eligible mismatches between two in-network providers, with visible priority and concise rationale.
- Produce a contactable member list with the context needed for outreach:
  - MRN
  - Name
  - Date of birth
  - Preferred communication preference
  - Phone number
  - Email address
- Allow users to record outreach completion, outreach outcome, and verbal provider confirmation.
- Show the member's recorded outreach attempt count and dated history. The prototype imposes no numeric attempt threshold for closure and does not automatically close a case based on the count; a future maximum-attempt rule is deferred.
- Provide a follow-up view linked to each member's payer relationship, with manually assigned owner, follow-up/review date, next action, and category (Action needed, Awaiting payer update, Closed — payer confirmed, or Closed — unresolved). Waiting requires documented completion of required actions and retains an owner and review date. Successful closure requires dated authoritative payer evidence of the intended assignment. Unresolved closure requires an approved reason and supporting context, records who closed it and when, and preserves searchable history without implying success. Keep due and overdue items visible and document conversion and payer recognition separately.
- Provide a basic reporting summary of workload, outreach activity, follow-up, and results, filterable by payer, owner, and priority. Label case counts separately from unique member counts and distinguish attempt volume from cases reaching a milestone. Revisit reporting after the preview; rates and real-data financial/clinical impact reporting are deferred until their definitions and inputs are validated.

Bulk/worklist outreach (such as SMS, MyChart, email, or agent phone calls) is a possible future enhancement and is not in V1.

New cases start unassigned in the shared queue; a coordinator takes ownership and may manually reassign it. Active follow-ups require an owner and review date. Use agreed callback dates, suggest seven calendar days for other actions as an adjustable prototype default, and manually select payer-review dates based on the expected file cycle. Overdue items remain visible without automatic closure or reassignment. See [definitions](docs/definitions.md) for the approved meanings.

Closed cases may be manually reopened with a reason, owner, and next review date, preserving previous closures and any requests to stop assistance. Reopening does not itself authorize renewed contact. New payer files do not automatically reopen closed cases.

## Access and security

- Access requires a valid, active ACO EID.
- Authentication and authorization will use Microsoft Entra ID and Azure controls.
- The workflow must protect PHI and comply with HIPAA.
- Outreach scripts and practices must follow payer, legal, and FCC requirements.

## Dependencies

- ACO Attribution Team
- ACO strategic alignment and sponsorship
- Analytics and HDI, including the ACO Attribution Model and payer-data pipeline

## Strategic alignment

**Strategic priority:** Achieve Fiscal Resilience & Smart Growth  
**Strategic initiative:** Value-based care performance management

AtReach supports operational and clinical levers that affect financial performance in value- and risk-based contracts, including revenue cycle/coding, risk adjustment, risk stratification, and utilization management.

## Future direction

V2 and later phases may extend follow-up tracking with automated reconciliation, additional operational dispositions, bulk outreach capabilities, and other workflow automation.

## Running the synthetic preview

The first preview uses React and TypeScript, a validated server API, and a SQL database. Hosted data uses the Sites D1 binding `DB`; local development uses Node's SQLite implementation. The Sites starter helper bundle was unavailable in this workspace, so the app uses the supported Worker ESM deployment format with a small esbuild pipeline rather than the Vinext starter. This preview architecture does not certify production Entra ID, Azure, or real-data readiness.

```sh
npm ci
npm run build
npm run dev
```

Node.js 24 or later is required for local SQLite. The local server listens on port 4173 (override with `PORT`). It creates the local database in ignored `.local/` state using the initial schema migration. Hosted migrations are schema-only; the app's idempotent seed endpoint adds 40 synthetic members and 44 payer-related cases when the dataset is empty. It does not overwrite saved edits.

```sh
npm test
npm run typecheck
npm run build
```

The 13 automated tests cover eligibility, validation, persistence through SQL, optimistic concurrency, closure evidence, waiting states, reopening, and member-wide attempt counts. Browser interaction and visual QA remain unverified in the current managed environment because its required browser-control tool is unavailable.

### Preview boundaries

- No real member data, external outreach, EHR access, payer submissions, or production SSO.
- The interface labels the synthetic team role as **Preview coordinator**; seeded team names are demonstration identities. Hosted account identity is retained separately on new case events.
- Payer-file conversion is recorded only through the explicit evidence-backed confirmation form. Appointment-based conversion remains deferred until the 60-day anchor and provider mapping are approved.
- Rates and financial/clinical impact are deferred. Reporting uses labeled case, unique-member, attempt, and independently documented milestone counts.
- Structured case snapshots and append-only outreach/activity history are stored in SQL JSON payloads with optimistic revision checks. Production normalization, retention, authorization, and audit review remain future readiness work.
