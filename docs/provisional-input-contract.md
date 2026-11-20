# Provisional input data contract

**Status:** Draft for discussion, version 0.1. Not validated against the existing ACO attribution model or approved for production. All examples are synthetic.

## Purpose and scope

AtReach consumes existing attribution results to support a member work queue, member review, and saved outreach history. It does not rebuild the attribution model in this prototype.

The README and explicitly approved project decisions govern scope. Other working documents provide proposals until approved. This contract describes a possible input shape; its field names are proposed application names, not verified upstream column names.

The first implementation can use synthetic CSV files representing the record types below. CSV is a proposed prototype transport, not a confirmed production interface. Incoming files do not have to match the eventual database tables or screen layout.

## How the records connect

- One member can have multiple separately identifiable payer relationships, including overlapping coverage.
- Each payer relationship can have multiple dated payer-attribution snapshots.
- ACO model results are separate from payer attribution. They may apply to a member or a particular payer relationship; that remains unconfirmed.
- Outreach attempts are created in AtReach and linked to the member and the relevant payer relationship. Attribution imports must preserve them.

The four proposed input datasets are `members`, `payer_relationships`, `payer_attributions`, and `aco_model_results`. They may come from different upstream sources. Contact information, coverage, and attribution evidence are not assumed to be available in one existing model export.

## Field conventions

**Required** means required in a synthetic record of this draft. **Optional** means the column may be empty. **Conditional** describes when it is required. These are proposed validation rules, not claims about source availability.

- IDs, MRNs, member IDs, and NPIs are text, preserving leading zeros. An internal member ID is distinct from a payer member ID. Provider names alone are not matching keys.
- Dates use `YYYY-MM-DD`; timestamps use ISO 8601 with an explicit timezone, preferably UTC.
- Empty CSV cells mean missing/unknown, never zero, false, or an empty identifier. Controlled fields use an explicit `unknown` value where specified.
- Counts are nonnegative integers. Count definitions and time windows must be documented before real-data use.
- Provider identifiers include an identifier system and whether they identify an individual or a group. Synthetic IDs are clearly marked and do not pretend to be valid NPIs.

## 1. Members

**One row:** One member in the source identity system. Proposed key: `member_id`.

| Field | Type | Requirement | Meaning |
| --- | --- | --- | --- |
| `member_id` | Text | Required | Stable member key agreed with the source owner; not derived from name or date of birth. |
| `mrn` | Text | Optional | Medical record number; production identity mapping remains to be confirmed. |
| `mrn_system` | Text | Conditional | Required when MRN is supplied; identifies its issuing system. |
| `display_name` | Text | Required | Name displayed to an authorized user. |
| `date_of_birth` | Date | Optional | Date of birth, when available. |
| `phone` | Text | Optional | Contact phone number. |
| `email` | Text | Optional | Contact email address. |
| `preferred_contact_method` | Enum | Required | `phone`, `email`, `portal`, `other`, or `unknown`. Preference does not establish consent or messaging authorization. |
| `contact_data_as_of` | Date | Optional | Date through which contact information was last verified or supplied; exact source meaning must be documented. |

The README's demographic and contact fields remain product requirements. Optional here allows incomplete source records to be identified without inventing data. Missing contact information must be visible to reviewers; it must not silently remove otherwise eligible members. Automated communication is outside the agreed prototype scope.

Member context also includes the four primary care utilization fields below. They are dated utilization evidence rather than permanent demographics; the proposed location in the incoming contract is alongside the ACO model result, or a linked utilization snapshot if supplied separately.

## 2. Payer relationships

**One row:** One member's distinct payer-plan enrollment episode. Proposed key: `payer_relationship_id`.

| Field | Type | Requirement | Meaning |
| --- | --- | --- | --- |
| `payer_relationship_id` | Text | Required | Stable relationship key; a later enrollment episode may require a different key. |
| `member_id` | Text | Required | Reference to the member. |
| `payer_id` | Text | Required | Stable payer identifier in the agreed reference system. |
| `payer_name` | Text | Required | Display name. |
| `plan_id` | Text | Optional | Plan identifier, if supplied; plan-name-only matching requires review. |
| `plan_name` | Text | Optional | Display name of the plan. |
| `line_of_business` | Enum | Required | `medicaid`, `medicare_advantage`, `commercial`, `other`, or `unknown`; does not establish program eligibility. |
| `payer_member_id` | Text | Optional | Member identifier within this payer context; not interchangeable with a subscriber ID. |
| `coverage_start_date` | Date | Optional | Effective start of this enrollment episode. |
| `coverage_end_date` | Date | Optional | Effective end, if known. An empty end date does not by itself prove active coverage. |
| `coverage_status` | Enum | Required | `active`, `inactive`, or `unknown`, as supplied for the relevant date. |
| `coverage_as_of_date` | Date | Required | Date to which the supplied coverage status applies. |
| `latest_payer_file_received_at` | Timestamp | Allow missing | Latest payer file arrival time for the relevant payer-plan feed, displayed as “Latest payer file received date.” Taken from receipt metadata, not the file's stated as-of date or AtReach import time. Missing means unknown. |

Concurrent relationships are valid. Do not impose one payer per member, use fixed Payer 1/Payer 2 slots, or assume a member–payer–plan combination uniquely identifies every enrollment episode.

The latest payer file received date is feed-level metadata shown with the payer relationship; it can be shared across members on the same feed. A new file's arrival does not prove successful processing, inclusion of this member, or an update to the member's coverage or attribution. Confirm the authoritative receipt system and payer-plan feed mapping before production use.

## 3. Payer attribution snapshots

**One row:** One payer's attribution assertion for one payer relationship and contract/program context at a point in time. Proposed key: `payer_attribution_id`.

| Field | Type | Requirement | Meaning |
| --- | --- | --- | --- |
| `payer_attribution_id` | Text | Required | Stable identifier for the source assertion/version. |
| `payer_relationship_id` | Text | Required | Reference to the relevant payer relationship. |
| `contract_program_id` | Text | Optional | Contract/program attribution context; coverage alone does not establish ACO financial risk. |
| `aco_risk_status` | Enum | Required | `yes`, `no`, or `unknown`: whether the ACO bears risk for this member in this context, subject to source-owner validation. |
| `payer_provider_id` | Text | Optional | Payer-assigned provider or group identifier. Missing means unavailable or unassigned until its meaning is confirmed. |
| `payer_provider_id_system` | Text | Conditional | Required with provider ID; for example, `NPI` or an agreed source system. |
| `payer_provider_name` | Text | Optional | Display name of the payer-assigned provider/group. |
| `payer_provider_type` | Enum | Required | `individual`, `group`, or `unknown`. |
| `payer_provider_network_status` | Enum | Required | `in_network`, `out_of_network`, or `unknown`, for the relevant attribution context/date. |
| `attribution_effective_date` | Date | Optional | When the payer says the assignment takes effect. |
| `payer_data_as_of_date` | Date | Required | Source roster's stated as-of date; distinct from file receipt or import date. |

Do not force multiple contract assertions into a single record. Their production identity and precedence require confirmation from the data owner.

## 4. ACO model results

**One row:** One versioned result from the existing ACO model at its declared scope. Proposed key: `model_result_id`.

| Field | Type | Requirement | Meaning |
| --- | --- | --- | --- |
| `model_result_id` | Text | Required | Identifier for this model result/version. |
| `member_id` | Text | Required | Reference to the member. |
| `result_scope` | Enum | Required | `member`, `payer_relationship`, or `unknown`; must match how the source actually calculates the result. |
| `payer_relationship_id` | Text | Conditional | Required for `payer_relationship` scope; empty for `member` scope. Unknown scope needs review before comparison. |
| `model_provider_id` | Text | Optional | Selected provider's identifier. |
| `model_provider_id_system` | Text | Conditional | Required with selected provider ID. |
| `model_provider_name` | Text | Optional | Display name; do not assume the selected provider belongs to the ACO. |
| `model_provider_type` | Enum | Required | `individual`, `group`, or `unknown`. |
| `model_provider_class` | Enum | Required | `pcp`, `specialist`, or `unknown`. |
| `model_provider_network_status` | Enum | Required | `in_network`, `out_of_network`, or `unknown`. |
| `attribution_source` | Enum | Required | Provisional labels: `payer`, `clinical`, `claims`, or `unknown`; confirm mapping to actual output codes. |
| `follow_up_flag` | Enum | Required | `unattributed`, `out_of_network`, `group_attribution`, `specialist`, `termed`, `no_utilization`, `none`, or `unknown`. Preserve the existing model's first-match flag. |
| `selection_reason` | Text | Optional | Source-supplied explanation, if available; not a generated explanation presented as verified fact. |
| `utilization_window_start` | Date | Conditional | Required when a utilization count or clinical/claims evidence is supplied. |
| `utilization_window_end` | Date | Conditional | Required when a utilization count or clinical/claims evidence is supplied. |
| `claims_utilization_count` | Integer | Optional | Count supporting the README's zero-claims exclusion; exact unit, payer scope, and qualifying-claim definition remain unresolved. |
| `claims_data_status` | Enum | Required | `available`, `incomplete`, or `unknown`. A count of zero cannot establish eligibility exclusion without sufficient source coverage. |
| `model_run_at` | Timestamp | Required | When the model produced this result. |
| `model_data_as_of_date` | Date | Required | Date through which the model's inputs are represented; not necessarily the execution date. |
| `model_version` | Text | Optional | Rule/code version, if supplied; confirm how this is recorded upstream. |

### Primary care utilization context

These four fields were explicitly requested for member context. All four must be represented in the prototype input schema and UI; individual values may be unknown until supplied. Their placement alongside model results does not imply that the existing model already produces them.

| Field | Type | Value requirement | Meaning |
| --- | --- | --- | --- |
| `in_network_last_primary_care_visit_date` | Date | Allow missing | Most recent qualifying primary care visit across all available history with a provider classified as in the ACO network. Display as “Last known in-network primary care visit date.” This date may precede the 24-month count window. |
| `out_of_network_last_primary_care_visit_date` | Date | Allow missing | Most recent qualifying primary care visit across all available history with a provider classified as outside the ACO network. Display as “Last known OON primary care visit date.” This date may precede the 24-month count window. |
| `in_network_primary_care_visit_count_24m` | Integer | Allow missing | Number of qualifying in-network primary care visits during the stated past-24-month window. |
| `out_of_network_primary_care_visit_count_24m` | Integer | Allow missing | Number of qualifying out-of-network primary care visits during the same past-24-month window. |

Use `utilization_window_start` and `utilization_window_end` to state the exact 24-month count window. The provisional anchor is the utilization data's as-of date, not the date a user opens the screen. Calendar boundary rules, qualifying primary care encounter definitions, deduplication across clinical/claims records, source completeness, and whether network membership is assessed at the visit date or snapshot date require source-owner confirmation.

These are member-context totals across qualifying providers, distinct from candidate-provider visit counts below. Confirm whether the available source totals are member-wide or payer-specific using the declared result scope; do not sum overlapping payer records and double-count visits. If utilization has a different scope or freshness from the model result, preserve its own scope and as-of metadata in a linked snapshot instead.

Zero means a verified count of no qualifying visits in a sufficiently observed window. Missing means unknown, not zero. A missing last-visit date may mean no qualifying visit or unavailable history; those meanings need to be distinguished in the source mapping. Unknown network membership must not be silently classified as out of network. These primary care counts do not replace the total qualifying-claims evidence needed for the README's zero-claims exclusion.

### Other optional supporting evidence

For each of the two candidate sources, `clinical` and `claims`, propose these fields:

| Field suffix | Type | Meaning |
| --- | --- | --- |
| `_candidate_provider_id` | Text | Candidate selected within this evidence source. |
| `_candidate_provider_id_system` | Text | Required if its candidate ID is present. |
| `_candidate_provider_name` | Text | Candidate display name. |
| `_candidate_provider_class` | Enum | `pcp`, `specialist`, or `unknown`. |
| `_candidate_visit_count` | Integer | Candidate-specific qualifying visit count, not the member's total claims count. |
| `_candidate_last_visit_date` | Date | Most recent qualifying visit to that candidate. |

For example, `clinical_candidate_visit_count` and `claims_candidate_last_visit_date`. These are requested evidence fields, not confirmed existing outputs. Claims aggregate paid amount is deferred unless reviewers need it to explain a tie-break and the source owner approves its meaning and use.

## Source metadata and import behavior

Each dataset delivery needs `schema_version`, `source_system`, `source_batch_id`, `extracted_at`, and `delivery_mode` (`full_snapshot` or `delta`). AtReach records `imported_at` separately. A file name alone is not a reliable data identity.

Payer-file deliveries also retain `source_received_at`, the timestamp when the file arrived at the agreed receiving system. The latest receipt for the relevant feed supplies `latest_payer_file_received_at`. Preserve individual batch receipt timestamps rather than overwriting their history; do not substitute import time when arrival time is unavailable.

Proposed behavior to validate before implementation:

- Reimporting the same batch and record version does not duplicate members, relationships, or attribution snapshots. Changed contents under an existing record/version key are flagged as a correction requiring an explicit policy.
- Preserve source assertions and prior outreach. Do not treat a missing row in a later file as proof of lost coverage, corrected attribution, or resolved outreach.
- Invalid links, duplicate conflicting IDs, impossible date ranges, or unknown result scope are held for review with a reason; they are not silently accepted into an actionable queue.
- A member-scoped model result is stored once. Comparing it with multiple payer relationships requires an explicit, approved mapping rule. Do not duplicate it and imply independent payer-specific calculations.
- Older or late-arriving data must not automatically replace newer evidence. Selection precedence and freshness thresholds remain to be agreed.
- Security audit events and business outreach history have separate purposes. Neither is part of this incoming attribution contract.

## Provisional queue-eligibility assessment

**Approved scope decision:** Include eligible members under ACO risk with payer-versus-model primary care attribution mismatches. Prioritize OON mismatches first and mismatches between two in-network providers second. This supersedes the earlier decision to restrict the prototype to OON care. Preserve the zero-claims exclusion. See [future considerations](future-considerations.md) for the separate scenario where both attribution sources agree on the same OON provider.

This is a checklist for validating upstream evidence, not a replacement attribution algorithm or a production-certified eligibility rule.

Before making a case actionable, establish that the member is in an eligible ACO risk/contract population, has qualifying claims utilization in an agreed observation window, and has a confirmed payer-versus-model primary care provider mismatch. Confirm relevant effective dates, provider identities, group-to-individual mappings, and model/payer scope. A name difference or unresolved group-to-individual comparison alone does not establish a mismatch.

- Verified zero claims utilization is excluded under the README, even when clinical records support an OON PCP relationship. The user explicitly retained this rule for the MVP after reviewing Taylor. It is a scope choice, not a determination that clinical-only cases lack outreach value. Do not add a third priority tier; revisit clinical-only outreach through the future-feature backlog.
- Missing or incomplete claims data remains unresolved; do not relabel it zero.
- A `no_utilization` model flag alone does not prove zero claims overall.
- Missing eligibility evidence yields `needs_review`, not automatic eligibility or exclusion. Approved prototype behavior: show these cases in a separate “Needs review” view rather than the prioritized outreach list. Explain the missing evidence and display source freshness; do not assign a guessed priority. Casey is the validated example. Detailed review actions remain to be designed.
- Member preference, conversion, and payer recognition require their own evidence. An import or verbal commitment must not automatically imply payer confirmation.

### Approved outreach prioritization

Assess eligibility first, then assign a priority from verified evidence. This is a simple two-tier ordering feature for the prototype, not a predictive score or a change to the attribution model.

| Priority | Eligible scenario | Queue behavior |
| --- | --- | --- |
| **1 — OON mismatch** | The payer and model identify different PCPs, and the model-supported primary care provider is outside the ACO network. Alex's in-network payer assignment versus OON model selection is the validated example. | Listed before Priority 2. |
| **2 — In-network mismatch** | The payer and model identify different PCPs, and both providers are in the ACO network. Jordan is the validated example. | Included after Priority 1. |

`outreach_priority` and `outreach_priority_reason` are derived AtReach presentation/decision outputs, not newly required upstream input fields. Keep them separate from `follow_up_flag`, eligibility status, and outreach progress. Show priority alongside the concise reason and freshness information. Retain the evidence used to explain the ordering; no LLM is required.

Missing or ambiguous evidence does not automatically become Priority 2. Cases outside these defined patterns, including an OON payer assignment with an in-network model selection, need a separate priority decision before automated ranking. The matched-OON scenario remains a future consideration, not an attribution mismatch. Tie-breaking within a priority tier, manual overrides, and additional scoring factors are undecided; they are not added to scope by this two-tier rule.

## Approved rationale and freshness presentation

This is a small prototype presentation enhancement, not an additional AI feature or a change to eligibility rules.

- Show a short **Reason for outreach** column in the queue. Example: “Payer PCP in network; model-selected PCP OON.”
- In member details, show a concise **Outreach eligibility rationale**, populated from the actual eligibility checks and input evidence. Example: “ACO risk confirmed. Payer assigns Provider A; model selects OON Provider B based on claims. Past 24 months: 0 in-network and 4 OON primary care visits.”
- Keep **Model selection reason** separate: use source-supplied reasoning when available. Do not infer or invent an unprovided decision-tree branch from the selected provider alone.
- Display freshness beside the rationale, separately from its text: **Payer data as of**, **Model data through**, **Payer file received**, and **Model run**. If payer and model as-of dates agree, a shared “Data through” label may summarize both; otherwise show each date explicitly. Arrival and execution dates do not establish source completeness or current member relationships.
- Use deterministic templates and verified fields. Missing evidence should remain visibly unknown. A system rationale must not be presented as member-confirmed preference or payer-recognized resolution.
- Defer detailed decision-tree tracing. This presentation does not authorize sending outreach, change outreach eligibility, or require an LLM at runtime.

See [example member validation](example-member-validation.md) for reviewed and proposed scenarios. Explanations below are expected prototype behavior, not results from an implemented application.

## Synthetic example of multiple payers

Member `SYN-001` is **Alex Example**. Both relationships are separately retained:

| Relationship ID | Member ID | Payer | Member ID | Payer-attributed provider |
| --- | --- | --- | --- | --- |
| `REL-A` | `SYN-001` | Example Plan A | `A-123` | Synthetic Provider X |
| `REL-B` | `SYN-001` | Example Plan B | `B-456` | Synthetic Provider Y |

The payer-attributed providers above belong to distinct dated payer-attribution records. A separate model result might select Synthetic Provider Z, but its scope must be declared before comparisons are made. Outreach about Plan A references `REL-A`; it must not silently change Plan B's attribution or history.

## Outreach records: application-created data

These records are saved inside AtReach, not supplied in incoming attribution files. Each attempt is a separate history entry linked to the member and relevant payer relationship.

**Approved field structure:** Attempt date/time, recorded-by user, contact method, member reached, member-confirmed PCP when established, notes, and three separate outcome components:

1. **Contact result:** What happened during the attempt.
2. **PCP relationship finding:** What the member said about their current or historical PCP relationship.
3. **Next step:** What the member/coordinator intends to do or has arranged following this attempt.

The approved PCP findings include uncertainty about the current PCP and a historical PCP whose current relationship is unconfirmed. Record whether reported care preceded current plan/benefits as described below. Earlier care alone must not invalidate a current relationship.

Member statements do not overwrite payer attribution or model output. A stated plan to contact a payer is not payer confirmation; a plan to schedule is not an appointment completed. Records document externally performed outreach, not automated sending or scheduling.

### Approved contact results

| Result | Meaning |
| --- | --- |
| No answer | No member contact; no message left. |
| Message left | Message left under approved practices. |
| Invalid contact information | Wrong number, disconnected phone, or undeliverable address. |
| Callback requested | Member asks to discuss later. |
| Discussion completed | Attribution discussion took place, even if the member does not know their PCP. |
| Member declined discussion | Member chose not to participate. |
| Communication assistance needed | Discussion could not be completed without interpreter or accessibility support. |
| Other / interrupted | Another result; brief note required. |

“Discussion completed” describes the conversation, not resolution of the attribution mismatch. These options do not by themselves establish member engagement, commitment, conversion, or payer recognition; funnel mappings still need definition.

### Approved PCP relationship findings

| Finding | Meaning |
| --- | --- |
| Current PCP confirmed | Member identifies their current PCP; record that provider separately. |
| Member unsure of current PCP | Member cannot confidently identify their PCP. |
| Historical PCP identified; current relationship unconfirmed | Member names a former provider without establishing a current relationship. |
| Member reports no current PCP | Member explicitly says they do not have a current PCP. |
| Member declined to identify PCP | Member chooses not to provide the information. |
| Not assessed | The conversation did not establish the PCP relationship. |

For a historical PCP, also record **Reported care occurred before current plan started** as `yes`, `no`, or `unknown`. This is member-reported context, not verified coverage history. An older visit does not automatically make the provider a former PCP: if the member confirms that provider remains their PCP, select **Current PCP confirmed**, even if their last visit preceded current coverage. A historical provider must not populate the member-confirmed current PCP field as if the current relationship were established.

### Approved member PCP preference

Record preference separately from the PCP relationship finding and the payer/model assignments:

| Preference | Meaning |
| --- | --- |
| Retain confirmed PCP | Member wants to continue with the PCP they confirmed as current. Use only when a current PCP has been confirmed. |
| Wants a different PCP | Member wants a different primary care relationship; record the requested provider separately in context if known. |
| Undecided | Member explicitly has not decided whom they want as PCP. |
| Not assessed | Preference was not established during the attempt; do not infer indecision from lack of contact. |

Preference is member-reported and does not establish a payer assignment, an effective change, or a conversion. In Alex's walkthrough, record **Retain confirmed PCP**, referring to Provider B; the old relationship with Provider A remains supporting history.

### Approved next-step choices

| Next step | Meaning |
| --- | --- |
| Member plans to contact payer | Member intends to confirm or update their PCP assignment. |
| PCP-change assistance requested | Member wants help navigating the payer's process. |
| Member plans to schedule | Member intends to arrange a primary care appointment. |
| Scheduling assistance requested | Member wants help arranging an appointment. |
| Appointment already scheduled | Member reports an existing appointment. |
| Appointment scheduled during outreach | Staff records that scheduling occurred. |
| Follow-up discussion needed | Another conversation is needed. |
| Internal review needed | Coverage, provider information, or another discrepancy needs investigation. |
| No action requested | Member does not request a change or assistance. |
| No next step established | No plan was agreed, for example because the member was not reached. |

Allow multiple next-step selections because a member may need both PCP-change and scheduling assistance. **No next step established** is exclusive of all other selections. These choices record intentions or arrangements; they do not automatically establish appointment completion, conversion, or payer recognition. Any appointment details or supporting evidence should preserve whether they are member-reported or staff-recorded; exact structured fields and other combination rules remain to be defined during walkthroughs.

**Review progress:** The three-part structure, eight contact-result choices, six PCP relationship findings with historical-care timing, structured member PCP preference, and ten next-step choices with multiple selections are approved. Step 7's outreach-record draft is being validated through a synthetic conversation walkthrough. Funnel mappings and detailed form validation remain unresolved.

### Approved prototype follow-up work queue

The user approved a small follow-up view for the prototype: logging an intention to contact the payer must be accompanied by owned follow-through and verification where needed. Ownership, follow-up dates, state transitions, and verification are manual in the initial prototype. The categories, closure reasons, ownership/timing defaults, visible attempt counts, and manual reopening rule below are approved. There is no numeric attempt threshold for closure in the prototype.

- Link a follow-up item to the same member, payer relationship, and originating outreach attempt. Do not create a duplicate member case.
- Give it a manually assigned owner, follow-up date, and specific next action. Approved categories are **Action needed**, **Awaiting payer update**, **Closed — payer confirmed**, and **Closed — unresolved**, kept distinct from the attribution funnel.
- Keep due and overdue follow-ups visible. A completed conversation must not close an unresolved case or clear its follow-up simply because outreach was logged.
- For Alex, create an owned follow-up to help with the PCP-change process and check whether the member contacted the payer. After a change request is evidenced, manually monitor the appropriate subsequent payer data.
- Confirm a corrected provider assignment using dated source evidence for this member and payer relationship. Receipt of any new payer file is not proof of inclusion or correction. If Provider A is still assigned, or no applicable newer record is available, keep the issue open for review and further action.
- Record evidence and dates for conversion and payer recognition separately, following the README definitions. Neither the member's intention nor a follow-up status alone proves either milestone. A qualifying completed appointment may establish conversion while payer-attribution follow-up remains open. The 60-day anchor, authoritative source mapping, closure exceptions, and refresh reconciliation rules need agreement.

| Category | Approved meaning and evidence |
| --- | --- |
| Action needed | Coordinator or member still has an outstanding next step. A member's intention to contact the payer remains here until submission/completion is documented. |
| Awaiting payer update | Required actions are documented as completed, and payer confirmation is pending. For Alex, document submission through the appropriate PCP-change process. Retain the owner, request date, evidence/reference, whether submission is member-reported or independently confirmed, and next review date. This is an active waiting category, not successful closure. |
| Closed — payer confirmed | Dated authoritative payer evidence confirms the intended PCP assignment for the correct member and payer relationship. Record the evidence/reference, confirmed provider, assignment effective date, verification date, and verifying staff member. This closes the assignment follow-up; it does not establish that ACO financial accountability ended. |
| Closed — unresolved | Active follow-up stops without payer-confirmed resolution. A reason and supporting context are required, along with the closing staff member and closure timestamp. The record remains searchable and retains prior outreach, evidence, and milestones. |

Waiting cases remain visible and become due for review on their review date. If an applicable subsequent payer file still shows the old provider, staff assess whether additional time or action is needed; retain waiting status with a new review date or return to Action needed as appropriate. File receipt, elapsed time, or a missing member row alone must not close the item. No automatic transitions are required for the prototype.

### Approved unresolved-closure reasons

| Reason | Meaning |
| --- | --- |
| Member declines further assistance | Member explicitly chooses to stop this assistance. |
| Unable to reach — manual closure | Staff document that the member remains unreachable and choose to stop follow-up, recording the reason and supporting context. No numeric attempt threshold is imposed by the prototype. |
| No longer eligible | Verified coverage or contract changes remove the member from scope. |
| Record corrected or duplicate | Review establishes that this case was erroneous or duplicated. |

These reasons are not successful payer resolution and do not create conversion or payer-recognition evidence. Preserve any independently evidenced prior milestones. Closing a record does not delete history or automatically alter the member's payer assignments. An unanswered call, an unverified coverage report, or elapsed time must not automatically close an item. Detailed reporting denominators remain to be agreed.

### Approved outreach attempt visibility

Show a clearly labeled count of recorded outreach attempts for the member in the work queue and member workspace, with access to the dated attempt history and recording staff. The member total includes recorded attempts across staff and payer relationships; distinguish the relevant payer relationship in history, and clearly label any relationship-filtered count so it is not mistaken for the member total.

Count saved outreach-attempt records, not unsaved forms, internal record reviews, or edits to follow-up dates. No minimum or maximum count is required for manual closure, and reaching a particular count does not automatically stop outreach or close the case. Continue to require a closure reason, supporting context, closing staff member, and timestamp. A future maximum-attempt or outreach-to-close rule is deferred, not inferred from the visible count.

Approved terms, meanings, and examples are also collected in the [member outreach definitions reference](definitions.md), the reusable basis for the eventual user guide or in-app definitions page. No guide UI is implemented yet.

The approved initial implementation is a view of owned follow-up items with manual verification, not automated reconciliation, payer submissions, messaging, or appointment scheduling. Automation is deferred.

### Approved ownership and follow-up timing defaults

| Situation | Rule |
| --- | --- |
| New outreach case | Starts unassigned and visible in the shared queue. |
| Coordinator takes the case | That coordinator becomes its owner. |
| Follow-up needed | Require an owner and next action/review date. |
| Member requests a callback | Use the agreed callback date. |
| Other action needed | Suggest seven calendar days; the coordinator may change the date. This is a prototype convenience, not established ACO policy. |
| Awaiting payer update | Coordinator selects a review date based on the expected payer-file cycle. |
| Review date passes | Show as overdue; do not automatically close or reassign. |

Ownership persists across outreach and follow-up until manually reassigned. Waiting for payer evidence must not clear the owner. A numeric attempt-to-close rule is deferred.

### Approved manual reopening

Allow a closed case to be manually reopened with a reason, assigned owner, and next review date. Preserve the prior closure and outreach history, including requests to stop assistance. Reopening does not erase or override those requests or itself authorize renewed contact. A new payer file must not automatically reopen a case.

## Approved minimum preview reporting

The user approved the reporting scope below for the preview, with an explicit requirement to revisit its usefulness and definitions after reviewing the working application.

| Group | Measures |
| --- | --- |
| Workload | Open P1/P2 cases, unassigned cases, and Needs review cases. |
| Activity | Outreach attempt count and cases outreached, engaged, or committed. |
| Follow-up | Action needed, Awaiting payer update, and due/overdue items. |
| Results | Converted, Payer recognized, and Closed — unresolved, broken down by reason. |

Filter by payer, owner, and priority. Clearly distinguish case counts from unique member counts and outreach attempts. One member may have multiple payer-related cases; do not count attempts as additional cases. Funnel milestones overlap and must not be summed as mutually exclusive outcomes. Reopening preserves milestone history rather than manufacturing another member or another achieved milestone.

Start with counts. Detailed funnel mappings, the conversion window anchor, and rate denominators remain unapproved; do not invent rates or infer milestones from unsupported evidence. Manually documented, evidence-backed milestone records can support the synthetic preview, with the limitations visible. PMPM, clinical outcomes, and financial impact reporting await validated real data and are not required to assess this preview.

## Approved preview acceptance checklist

Approved by the user with the requirement that the preview include more than the four validation members. This checklist targets a synthetic-data working preview, not production readiness.

**Dataset plan:** Target approximately 40 unique synthetic members, with at least 20 unique eligible members represented in the active outreach queue across P1 and P2. Include the four validated examples and additional cases covering multiple payers, owners/unassigned work, repeat attempts, due/overdue follow-ups, waiting for payer updates, both closure categories, Needs review, and exclusions. Include some members with multiple separately identifiable payer relationships. Views may overlap; do not imply their counts are disjoint or that every seeded member belongs in active outreach. This is a planned dataset, not a claim that the application or fixtures have been built.

1. Alex is included as P1, Jordan as P2, Casey appears in Needs review, and Taylor is excluded under the zero-claims rule. The default outreach order places P1 ahead of P2.
2. Opening a member shows the agreed attribution, contact, utilization, concise rationale, and separately labeled freshness information. Multiple payer relationships remain separately identifiable.
3. Staff can claim/reassign a case and save an outreach attempt with the approved contact result, PCP finding, preference, next steps, and notes. Invalid combinations do not silently create misleading records.
4. Saved attempts survive leaving/reopening the record and reloading the application. History retains dates, recording staff, and payer context; the attempt count updates without overwriting attribution or prior history.
5. Staff can create an owned follow-up with a review date and next action. Action needed, Awaiting payer update, and due/overdue cases remain visible and follow approved timing defaults.
6. Successful closure requires the agreed payer evidence. Unresolved closure requires a reason and supporting context. Manual reopening requires a reason, owner, and review date and preserves history and requests to stop assistance. None of these actions silently creates conversion or payer recognition.
7. The basic summary and its payer/owner/priority filters match the visible synthetic records, distinguish cases/members/attempts, and do not add overlapping milestone counts together.
8. Approved meanings are available for the eventual guide/help content and remain consistent with UI labels. Clearly identify the application as a synthetic-data preview; no real-data import, production SSO, external outreach, or automated payer reconciliation is needed for this preview. Those production requirements remain in scope for later readiness work.

## Assumptions requiring confirmation

| Question | Provisional position | Who can confirm |
| --- | --- | --- |
| What is the source's stable member identity? | Use synthetic IDs; do not choose a production matching algorithm yet. | Analytics / identity team |
| Is model selection member-level or payer-specific? | Support explicit scope; unknown scope cannot drive automatic comparisons. | Model owner |
| Which payers/contracts are eligible for the initial pilot? | No production allowlist yet. | Attribution team / contracting |
| Which fields establish ACO risk accountability? | Explicit status with contract context is proposed. | Analytics / contracting |
| What counts as claims utilization, over what window? | Proposed count plus window and completeness status; definition unconfirmed. | Model owner / attribution team |
| How are the four primary care utilization fields defined? | Approved prototype definition: last known visit dates use all available history; counts cover an explicit past-24-month window. Window boundaries, encounter definitions, deduplication, network timing, source completeness, and member-versus-payer scope remain unconfirmed. | Model owner / attribution team / provider data owner |
| Which evidence fields actually exist? | Optional until mapped to source output or another approved source. | Analytics |
| How are network membership and provider/group mappings dated? | Explicit status and stable IDs; authoritative reference and timing unconfirmed. | Provider data owner |
| How are corrections, refreshes, and missing records handled? | Preserve history; no automatic closure from absence. | Data owner / attribution team |

**Project checkpoint:** The preview requirements and acceptance checklist are approved, including a larger synthetic member population. Next: agree the technical setup, then build and verify the working preview. Source mappings and production operational policies remain subject to validation. Revisit reporting after the working preview. Continue one step at a time with user confirmation.
