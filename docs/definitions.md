# Member outreach definitions

This reference explains AtReach's approved terms and workflow choices for coordinators and product development. It is the reusable basis for an eventual user guide or in-app definitions page; those interfaces have not been built. Technical field details remain in the [provisional input contract](provisional-input-contract.md). Definitions below are approved for the prototype unless explicitly marked pending. Real source mappings and operational policies still require validation.

## Core terms

| Term | Meaning |
| --- | --- |
| Member | The individual whose attribution and outreach are being reviewed. |
| Payer relationship | One member's distinct payer-plan enrollment episode. A member can have more than one, including overlapping coverage. |
| Payer-attributed provider | The provider or group assigned by the payer for the relevant relationship and contract context. |
| ACO-attributed provider | The provider selected by the existing ACO model. This provider may be outside the ACO network. |
| Member-confirmed current PCP | The provider the member identifies as their current PCP during outreach. This statement is separate from payer and model assignments. |
| In network / OON | Inside / outside the ACO provider network in the relevant context. This is distinct from participation in a particular insurance plan's network. Unknown is not OON. |
| Attribution mismatch | A confirmed difference between payer assignment and the ACO model's PCP selection, after applicable identity, scope, and group-to-individual mapping checks. A name difference alone is insufficient. |
| ACO risk status | Whether the ACO bears risk for the member under the applicable contract/program. Coverage alone does not establish this. |
| Outreach attempt | A separately saved record of contact activity linked to the member and relevant payer relationship. Later attempts preserve earlier history. |
| Follow-up item | An owned next action or pending payer verification linked to the same member case and payer relationship. It does not create a duplicate member. |

## Eligibility and queue priority

| Label | Meaning |
| --- | --- |
| Eligible | Evidence establishes that the member meets the agreed contract/risk, qualifying-claims, and attribution-mismatch requirements. |
| Priority 1 — OON mismatch | Eligible mismatch where the model-supported PCP is outside the ACO network; Alex is the validated example. Listed before Priority 2. |
| Priority 2 — In-network mismatch | Eligible mismatch where payer and model select different in-network PCPs; Jordan is the validated example. |
| Needs review | Eligibility or priority evidence is incomplete or ambiguous. Show separately without inventing a priority or treating missing values as zero; Casey is the validated example. |
| Zero-claims exclusion | Verified zero qualifying claims excludes the member from MVP outreach, even if clinical records support an OON PCP relationship; Taylor is the validated example. This is a scope choice, not a statement that outreach could never be useful. |

A verified zero requires an agreed observation window and sufficient source coverage. Members whose payer and model agree on the same OON provider are a separate future consideration. Priority for patterns outside the validated two-tier rules, such as OON payer assignment with an in-network model selection, remains pending. Queue priority is distinct from model follow-up flags, contact results, and case progress.

## Contact results

Select the result of the attempt. A completed discussion does not mean the mismatch was resolved.

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

## PCP relationship findings

These describe what was established during the conversation, not an independently verified payer assignment.

| Finding | Meaning |
| --- | --- |
| Current PCP confirmed | Member identifies their current PCP; record that provider separately. |
| Member unsure of current PCP | Member cannot confidently identify their PCP. |
| Historical PCP identified; current relationship unconfirmed | Member names a former provider without establishing a current relationship. |
| Member reports no current PCP | Member explicitly says they do not have a current PCP. |
| Member declined to identify PCP | Member chooses not to provide the information. |
| Not assessed | The conversation did not establish the PCP relationship. |

For a historical PCP, record whether reported care occurred before the current plan started: **Yes / No / Unknown**. Earlier care does not automatically make the relationship historical. If the member confirms that the provider remains their current PCP, use **Current PCP confirmed**, even if their last visit preceded current coverage. Keep a historical provider separate from the confirmed current PCP.

## Member PCP preference

Preference describes what the member wants and is separate from the relationship finding.

| Preference | Meaning |
| --- | --- |
| Retain confirmed PCP | Member wants to continue with the PCP they confirmed as current. Use only when a current PCP has been confirmed. |
| Wants a different PCP | Member wants a different primary care relationship; record the requested provider separately in context if known. |
| Undecided | Member explicitly has not decided whom they want as PCP. |
| Not assessed | Preference was not established during the attempt; do not infer indecision from lack of contact. |

## Next steps

Multiple next steps can be selected. **No next step established** is exclusive of the other choices. Recording an intention or an arranged appointment does not establish completed care, conversion, or payer recognition.

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

## Follow-up categories

Owners, review dates, state transitions, and verification are manual in the prototype. Keep due and overdue active items visible.

| Category | Approved meaning and evidence |
| --- | --- |
| Action needed | Coordinator or member still has an outstanding next step. A member's intention to contact the payer remains here until submission/completion is documented. |
| Awaiting payer update | Required actions are documented as completed, and payer confirmation is pending. For Alex, document submission through the appropriate PCP-change process. Retain the owner, request date, evidence/reference, whether submission is member-reported or independently confirmed, and next review date. This is an active waiting category, not successful closure. |
| Closed — payer confirmed | Dated authoritative payer evidence confirms the intended PCP assignment for the correct member and payer relationship. Record the evidence/reference, confirmed provider, assignment effective date, verification date, and verifying staff member. This closes the assignment follow-up; it does not establish that ACO financial accountability ended. |
| Closed — unresolved | Active follow-up stops without payer-confirmed resolution. A reason and supporting context are required, along with the closing staff member and closure timestamp. The record remains searchable and retains prior outreach, evidence, and milestones. |

If the next applicable payer file still shows the old provider, assess whether additional time or another action is needed. Retain an owner and review date while waiting, or return the item to **Action needed**. A new file's arrival, elapsed time, or a missing member row is not proof of resolution.

## Ownership and follow-up timing

| Situation | Approved rule |
| --- | --- |
| New outreach case | Starts unassigned and visible in the shared queue. |
| Coordinator takes the case | That coordinator becomes its owner. |
| Follow-up needed | Require an owner and next action/review date. |
| Member requests a callback | Use the agreed callback date. |
| Other action needed | Suggest seven calendar days; the coordinator may change the date. This is a prototype convenience, not established ACO policy. |
| Awaiting payer update | Coordinator selects a review date based on the expected payer-file cycle. |
| Review date passes | Show as overdue; do not automatically close or reassign. |

Ownership persists across outreach and follow-up until manually reassigned. Waiting for payer evidence must not clear the owner.

## Unresolved closure reasons

Choose a reason, record supporting context, and save who closed the item and when. Closed records remain searchable with their history intact.

| Reason | Meaning |
| --- | --- |
| Member declines further assistance | Member explicitly chooses to stop this assistance. |
| Unable to reach — manual closure | Staff document that the member remains unreachable and choose to stop follow-up, recording the reason and supporting context. No numeric attempt threshold is imposed by the prototype. |
| No longer eligible | Verified coverage or contract changes remove the member from scope. |
| Record corrected or duplicate | Review establishes that this case was erroneous or duplicated. |

Unresolved closure does not create conversion or payer-recognition evidence. Independently documented prior milestones remain in history. The prototype imposes no numeric attempt threshold; staff make and document closure decisions. An unanswered call or count alone must not automatically close the case. Verified ineligibility or a corrected/duplicate case is an administrative closure, not a successful payer correction.

## Reopening

A closed case may be manually reopened with a reason, assigned owner, and next review date. Preserve the previous closure, outreach history, and requests to stop assistance. Reopening does not itself authorize renewed contact or override those requests. New payer files do not automatically reopen closed cases.

## Outreach attempt count

The visible member total counts saved outreach-attempt records across staff and payer relationships. Show it in the queue and member workspace with access to dated history and the recording staff member. Clearly label any count filtered to one payer relationship. Unsaved forms, internal record reviews, and follow-up-date edits are not attempts. There is no minimum or maximum attempt count required for closure and no automatic closure triggered by a count. A future maximum-attempt rule is deferred.

## Funnel milestones

These meanings come from the README. Detailed reporting mappings and denominators remain to be agreed.

| Milestone | Meaning |
| --- | --- |
| Identified | Attribution and utilization data indicate an eligible mismatch. |
| Outreached | An outreach attempt has occurred. |
| Engaged | The member was successfully reached. |
| Committed | The member verbally commits to changing PCP information or scheduling with their attributed provider. |
| Converted | A payer file reflects the provider change, or a qualifying appointment with the attributed provider is completed within the 60-day window. The window anchor and precise provider mapping remain pending. |
| Payer recognized | Authoritative payer evidence confirms the updated assignment. |

An appointment can satisfy conversion while payer-attribution follow-up remains open. A statement of intent is not a submitted request; a member-reported submission is not payer confirmation. Successful assignment closure does not establish that ACO financial accountability ended.

## Rationale and data freshness

**Reason for outreach** briefly explains why the member is listed. **Outreach eligibility rationale** explains the evidence behind eligibility/priority. **Model selection reason** is the source-supplied explanation of provider selection, when available. Do not invent an unprovided model branch. Use templates populated from verified fields rather than an additional runtime AI summary.

| Label | Meaning |
| --- | --- |
| Payer data as of | Date represented by the payer's source data. |
| Model data through | Date through which the model's inputs are represented. |
| Payer file received | When the latest applicable payer file arrived at the agreed receiving system; not proof it was processed or changed this member's assignment. |
| Model run | When the model produced the result; not necessarily the date through which data is available. |
| Import time | When AtReach loaded a delivery; distinct from file arrival or source as-of dates. |
| Last known primary care visit date | Most recent qualifying visit across all available history, separately for in-network and OON care. May precede the count window. |
| Primary care visit count in 24 months | Qualifying visits in the explicitly stated 24-month window, separately for in-network and OON care. Not interchangeable with total qualifying claims. |

Show payer and model source dates separately when they differ. Missing values remain unknown rather than defaulting to zero. Available history may be incomplete; encounter definitions, source completeness, and network timing still need validation.

## Preview reporting

| Group | Approved initial measures |
| --- | --- |
| Workload | Open P1/P2 cases, unassigned cases, and Needs review cases. |
| Activity | Outreach attempt count and cases outreached, engaged, or committed. |
| Follow-up | Action needed, Awaiting payer update, and due/overdue items. |
| Results | Converted, Payer recognized, and Closed — unresolved, broken down by reason. |

Filter by payer, owner, and priority. Case counts and unique member counts must be labeled separately because one member may have multiple payer-related cases. An attempt is an activity record, not another case. Funnel milestone counts overlap and must not be added together. Use counts initially; rates await agreed denominators and mappings. The 60-day anchor and detailed funnel mappings remain pending, not inferred automatically in the preview. Financial and clinical impact reporting awaits validated real data.

**Review checkpoint:** Revisit reporting after the working preview to assess whether the measures and filters support the team's actual decisions.

## Preview requirements checkpoint

The [preview acceptance checklist](provisional-input-contract.md#approved-preview-acceptance-checklist) is approved with a member population larger than the four validation examples. The dataset plan targets approximately 40 synthetic members with at least 20 unique eligible members in active outreach and varied review, follow-up, closed, and excluded cases. The four named examples remain validation anchors rather than the full dataset. Technical setup and implementation are next; reporting will be revisited after the preview.

Keep new feature ideas in [future considerations](future-considerations.md) unless explicitly brought into MVP scope. When a definition changes, update this reference, the governing requirements, and eventual UI/help text together.
