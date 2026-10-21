# Çağrımatik

A bilingual, responsive React demo for an AI voice assistant platform. The four industry scenarios run entirely in the browser with deterministic sample data. No phone call, reservation, payment, CRM record, or external integration is created.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. To enable the contact form's email draft action, copy `.env.example` to `.env.local` and set `VITE_CONTACT_EMAIL`. Without an address, the form copies the request instead. The form never submits to a backend.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Demo boundaries

- Legal: only the fixed `DEMO-01` identity unlocks a fictional case.
- Hotel: sample dates, occupancy, room rates, and weekend pricing produce a deterministic quote. Confirmation creates a local sample request only.
- Sales: a local sample lead is created only after explicit consent.
- E-commerce: `ORD-1001`, `ORD-1002`, and `ORD-1003` return fictional order timelines.
- Agent transfer produces an on-screen simulation and summary. No human agent is contacted.
- Browser speech recognition and synthesis are optional. Availability, voices, and recognition handling depend on the browser. Text entry always remains available.

Theme and language choices are stored in localStorage. Conversation state remains in memory for the active page session.
