# AtReach local prototype

AtReach is a small local web app for reviewing payer attribution and ACO utilization mismatches, recording manual outreach, and viewing workflow progress. It is a prototype for synthetic data and does not connect to payer, claims, EHR, Azure, or Databricks services.

## Run locally

Requires Python 3.10 or newer. The app uses only the Python standard library.

```powershell
python server.py
```

Then open [http://127.0.0.1:8000](http://127.0.0.1:8000). The server listens on this computer only. Stop it with `Ctrl+C`.

## What the prototype includes

- A review queue of synthetic patients with a mismatch between payer-attributed provider and claims utilization provider.
- Exclusion of patients with zero claims utilization.
- Search and filters for patient, MRN, payer, and work status.
- A patient workspace with attribution, utilization, and fictional contact details.
- Manual outreach logging with date, channel, outcome, verbal provider confirmation, and an operational note.
- SQLite storage for the synthetic patient roster and saved outreach history.
- Basic funnel and outreach reporting.

The sample roster is generated locally on first run and saved in `.atreach/prototype.sqlite3`. Outreach activity remains in that local database across restarts. Delete that database to reset the sample data and activity.

## Prototype assumptions

- All names, identifiers, phone numbers, and email addresses are fictional. Do not enter real patient information.
- Outreach is recorded manually; the app does not send messages or contact patients.
- Funnel status is derived from the latest outreach outcome. `Appointment completed` advances to Converted; `Payer file updated` advances to Payer Recognized.
- Conversion and engagement rates are basic prototype calculations based on saved outreach attempts. Clinical and PMPM outcomes are not modeled.
- No sign-in or role controls are included. The local-only setup is for workflow exploration, not production use.

## Code map

- `server.py` — local HTTP server, SQLite schema, synthetic sample generation, and JSON endpoints.
- `web/index.html` — queue, reporting, and patient workspace layout.
- `web/styles.css` — responsive visual styles.
- `web/app.js` — filters, patient detail, outreach form, and reporting behavior.

## Future integration direction

For a later organization-approved version, replace the local sample-data source and SQLite storage with approved ACO data services, plan Azure-based authentication and access controls, and connect to the Databricks environment. The prototype keeps these integrations out of the local workflow.
