# Future considerations

These are ideas to evaluate in later iterations, not additions to the agreed prototype scope.

## Outreach attempt thresholds

The MVP displays recorded outreach counts and history without enforcing a minimum or maximum attempt count for manual closure. Evaluate a proposed maximum-outreach or outreach-to-close rule later using operational feedback and the ACO's approved practices. No three-attempt rule is approved for the prototype.

## Clinical-only attribution mismatches with zero qualifying claims

The user explicitly retained the zero-claims exclusion for the MVP, including cases like Taylor where clinical records support an OON PCP relationship. Keep two outreach priority tiers; incomplete-evidence cases such as Casey remain in Needs review rather than a third outreach tier.

In a later iteration, evaluate whether verified clinical evidence justifies outreach when qualifying claims are zero. Assess case volume, confirmed mismatches, coordinator time per case, and documented resolution rates before changing eligibility or priority. Validate clinical encounter definitions, observation completeness, and claims-lag handling with the source owner. Retain these records under the agreed retention policy so the population can be evaluated; this does not authorize real-data ingestion or new pilot analytics work now.

## OON PCP confirmation when attribution sources agree

**Scenario:** The member remains under ACO financial risk, but payer attribution and the ACO model both identify the same outside-network provider. Agreement between provider fields alone does not establish that ACO risk accountability or the outside-network care issue has been resolved.

**Proposed future capability:** Explicitly identify these cases and help the ACO attribution coordinator/outreacher confirm the member's actual PCP and guide the member through communicating that information to the payer using the appropriate payer process.

The model's selection is evidence for review; the member must confirm their actual PCP and preference. Preserve the distinction between member confirmation, communication to the payer, and payer-recognized changes. Communication alone does not prove an attribution update or release of ACO financial accountability.

Before implementation, validate case-identification rules, payer-specific procedures, required evidence, and closure criteria with the attribution team and contracting. The README already describes supporting members who prefer outside-network care; this idea adds explicit identification and guidance for the source-agreement scenario. It does not authorize portal submission automation. The current prototype includes prioritized OON and in-network attribution mismatches; this future idea concerns agreement on the same OON provider, rather than a mismatch.
