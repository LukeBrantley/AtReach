# Example member validation

All members and providers are synthetic. These are business walkthroughs for the provisional input contract, not executed application tests. Review one scenario at a time; confirmation of one does not approve later scenarios.

## Example 1: Clear outreach candidate

**Status: User validated** that the member belongs in the queue and that the information provides enough context to explain why.

| Input | Value |
| --- | --- |
| Member / payer relationship | Alex Example, `SYN-001` / Example Medicaid Plan, `REL-A` |
| Coverage / ACO accountability | Active; confirmed under an eligible ACO risk arrangement |
| Payer-attributed provider | Synthetic Provider A, in network |
| Model-selected provider | Synthetic Provider B, out of network, PCP |
| Model source / flag | Claims / Out of Network |
| Count window | November 1, 2024–October 31, 2026 |
| Last known in-network / OON primary care visits | September 10, 2024 / September 15, 2026 |
| In-network / OON primary care visit counts in window | 0 / 4 |
| Qualifying claims utilization | 8; sufficient source coverage assumed for this synthetic example |
| Contact information | Phone available; phone preferred |
| Payer data as of / model data through | October 31, 2026 / October 31, 2026 |
| Payer file received / model run | November 5, 2026 / November 6, 2026 |
| Model scope | Explicitly payer-relationship-scoped to `REL-A` for this example only |

**Expected decision:** Eligible for outreach, **Priority 1 — OON mismatch**. The ACO bears risk and claims-supported outside-network primary care differs from the payer's in-network assignment. Under the approved two-tier ordering, Alex appears above Priority 2 cases such as Jordan.

**Reason for outreach:** Payer PCP in network; model-selected PCP OON.

**Outreach eligibility rationale:** ACO risk confirmed. Payer assigns Provider A; model selects OON Provider B based on claims. Past 24 months: 0 in-network and 4 OON primary care visits.

**Freshness:** Data through October 31; payer file received November 5; model run November 6, 2026. The older in-network visit remains visible despite falling outside the count window.

Outreach confirms the member's actual PCP and preference. This scenario does not establish member preference, conversion, or payer recognition.

## Example 2: Different providers, both in network

**Status: User validated as eligible at the secondary priority**, superseding the earlier proposed exclusion. The user explicitly included in-network mismatches while retaining higher priority for OON mismatches.

| Input | Value |
| --- | --- |
| Member / payer relationship | Jordan Example, `SYN-002` / Example Medicaid Plan, `REL-C` |
| Coverage / ACO accountability | Active; confirmed under an eligible ACO risk arrangement |
| Payer-attributed provider | Synthetic Provider A, in network |
| Model-selected provider | Synthetic Provider C, in network, PCP |
| Model source / flag | Claims / none |
| Count window | November 1, 2024–October 31, 2026 |
| Last known in-network / OON primary care visits | September 20, 2026 / June 15, 2023 |
| In-network / OON primary care visit counts in window | 4 / 0 |
| Qualifying claims utilization | 6; sufficient source coverage assumed for this synthetic example |
| Payer data as of / model data through | October 31, 2026 / October 31, 2026 |
| Payer file received / model run | November 5, 2026 / November 6, 2026 |
| Model scope | Explicitly payer-relationship-scoped to `REL-C` for this example only |

**Expected decision:** Eligible for outreach, **Priority 2 — In-network mismatch**. Provider identities differ and both providers are in network. Jordan appears after Priority 1 OON cases such as Alex. The old OON visit does not elevate Jordan to Priority 1 because the model-supported PCP relationship is in network.

**Reason for outreach:** Payer and model select different in-network PCPs.

**Outreach eligibility rationale:** ACO risk confirmed. Payer assigns Provider A; model selects in-network Provider C based on claims. Both providers are in network, so outreach follows OON mismatches in priority.

**Freshness:** Data through October 31; payer file received November 5; model run November 6, 2026.

Outreach confirms the member's actual PCP and preference. The priority tier does not itself change payer attribution or establish member confirmation, conversion, or payer recognition.

## Example 3: Possible mismatch with incomplete evidence

**Status: User validated as “Needs review,” visible separately from the prioritized outreach list.**

| Input | Value |
| --- | --- |
| Member | Casey Example, `SYN-003` |
| ACO accountability | Confirmed under an eligible arrangement |
| Payer-attributed provider | Synthetic Provider A, in network |
| Model-selected provider | Synthetic Provider D, PCP; network status unknown |
| In-network / OON primary care visit counts in window | Unknown / unknown |
| Qualifying claims utilization | Unknown; claims feed incomplete |
| Count window | Intended November 1, 2024–October 31, 2026; evidence insufficient to populate counts |
| Payer data as of / model data through | October 31, 2026 / September 30, 2026 |
| Payer file received / model run | November 5, 2026 / November 6, 2026 |

**Expected decision:** Needs review. Do not assume zero claims, eligibility, or an outreach priority. Display Casey in the separate Needs review view.

**Rationale:** Different PCP assignments identified. Claims evidence is incomplete and the model-selected provider's network status is unknown; outreach eligibility and priority need review.

**Freshness:** Payer data through October 31; model data through September 30; payer file received November 5; model run November 6, 2026. Display both source dates because they differ.

## Example 4: Confirmed zero claims despite clinical evidence

**Status: User validated as excluded under the MVP's zero-claims rule, including when clinical records support an OON PCP relationship.**

| Input | Value |
| --- | --- |
| Member | Taylor Example, `SYN-004` |
| ACO accountability | Confirmed under an eligible arrangement |
| Payer-attributed provider | Synthetic Provider A, in network |
| Model-selected provider | Synthetic Provider E, out of network, PCP |
| Model source | Clinical encounters, not claims |
| In-network / OON primary care visit counts in window | 0 / 3, supported by clinical records |
| Qualifying claims utilization | Verified 0, with sufficient claims source coverage assumed for this synthetic example |
| Count window | November 1, 2024–October 31, 2026 |

**Expected decision under the current README:** Excluded from outreach because of the explicit zero-claims rule. Clinical encounter counts and qualifying claims utilization are distinct measures. The example intentionally supplies clinical evidence of care while establishing verified zero qualifying claims; it is not a claim about how common this pattern is in production.

**Rationale:** Provider mismatch identified, but verified zero qualifying claims in the reporting window; excluded under the current prototype rule.

Missing or incomplete claims evidence instead requires review, as in Example 3. The user confirmed retaining two outreach priorities, keeping Casey in Needs review, and excluding Taylor for the MVP. The exclusion is a scope choice, not a determination that clinical-only cases lack outreach value.
