# AtReach

AtReach helps the THN ACO identify and resolve payer-attribution mismatches: patients listed under the ACO's risk who receive care outside its provider network. By giving the attribution team a focused work queue and the context needed for outreach, the initiative aims to improve care continuity, quality performance, and value-based contract outcomes.

## The problem

Payer attribution and the provider actually delivering a patient's care can differ, particularly in managed Medicaid plans that automatically assign a PCP when the patient has not selected one. The ACO may therefore be financially accountable for patients whose care, utilization, and care gaps it cannot influence.

This mismatch also means health centers may not receive appropriate credit for care-gap closure and may miss key information about transitions of care, care management, utilization management, and shared savings.

AtReach focuses on patients who are using care outside the ACO—not patients who are entirely lost to care. Patients with zero claims utilization are out of scope.

## Goals

- Reduce per-member-per-month (PMPM) costs.
- Improve quality STAR performance.
- Align payer attribution with where patients receive primary care.
- Create a repeatable, compliant process for attribution outreach and resolution.

## Process funnel

1. **Identified** — attribution and utilization data indicate an eligible mismatch.
2. **Outreached** — the patient has received an outreach attempt.
3. **Engaged** — the patient was successfully reached.
4. **Committed** — the patient verbally commits to changing PCP information or scheduling with their attributed provider.
5. **Converted** — the payer file reflects the provider change, or the patient completes an appointment with their attributed provider within 60 days.
6. **Payer recognized** — the payer confirms the updated attribution.

## How it works

AtReach compares the THN attribution/utilization model with payer attribution data to surface actionable mismatches. Eligible patients appear in a work queue where authorized users can review context, conduct outreach, and document the result.

During outreach, the team confirms the patient's preferred PCP and can help the patient:

- Schedule with their attributed provider.
- Change PCP information through the payer's portal or designated process.
- Reinstate an appropriate in-network relationship when eligible.

Each managed Medicaid organization may have its own PCP-change form or procedure. The workflow should support those plan-specific requirements.

## Users

| User group | Primary use |
| --- | --- |
| THN attribution team | Day-to-day patient review, outreach, and outcome documentation. |
| THN, Quality, VBC, and Finance leaders | Monitor the problem and performance; engage payers strategically. |
| Population Health teams | Refer eligible patients into the work queue. |

## Key performance indicators

### Process KPIs

- Number of patients not attributed to a THN ACO provider according to the THN Attribution Model.
- **Conversion rate:** patients with a payer-file provider change or an appointment completed with the attributed provider within 60 days, divided by outreaches.
- **Leading conversion rate:** patients with a documented verbal commitment to change provider or schedule an appointment, divided by outreaches.
- **Engagement rate:** patients reached, divided by outreaches.

### Outcome KPIs

- Network PMPM.
- Network A1C control rate (A1C <7%).
- Network blood-pressure control rate (definition TBD).
- Network statin medication adherence.

## Measurement plan

Compare the total ACO population with patients not attributed to a THN ACO provider under the THN Attribution Model. Track:

- PMPM costs
- A1C control rate (<7%)
- Blood-pressure control rate (TBD)
- Prior full-year statin medication adherence
- Patient count

## V1 scope

V1 must:

- Identify eligible patients.
- Produce a contactable patient list with the context needed for outreach:
  - MRN
  - Name
  - Date of birth
  - Preferred communication preference
  - Phone number
  - Email address
- Allow users to record outreach completion, outreach outcome, and verbal provider confirmation.

Bulk/worklist outreach (such as SMS, MyChart, email, or agent phone calls) is a possible future enhancement and is not in V1.

## Access and security

- Access requires a valid, active THN EID.
- Authentication and authorization will use Microsoft Entra ID and Azure controls.
- The workflow must protect PHI and comply with HIPAA.
- Outreach scripts and practices must follow payer, legal, and FCC requirements.

## Dependencies

- THN Attribution Team
- THN strategic alignment and sponsorship
- Analytics and HDI, including the THN Attribution Model and payer-data pipeline

## Strategic alignment

**Strategic priority:** Achieve Fiscal Resilience & Smart Growth  
**Strategic initiative:** Value-based care performance management

AtReach supports operational and clinical levers that affect financial performance in value- and risk-based contracts, including revenue cycle/coding, risk adjustment, risk stratification, and utilization management.

## Future direction

V2 and later phases may add follow-up flags, operational dispositions, bulk outreach capabilities, and additional workflow automation.
