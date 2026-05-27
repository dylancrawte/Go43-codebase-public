# GO43 (public codebase)

A **public snapshot** of the GO43 mobile app (Expo / React Native) for connecting fans and businesses around campaigns and bookings. Not a production version: backend, secrets, and some integrations are omitted or require your own configuration.

## MVC architecture

| Layer | Role | Location |
|-------|------|----------|
| **View** | UI, navigation, user input | `app/`, `components/` |
| **Controller** | Screen flow | `controllers/orchestrators/` |
| **Controller** | Business rules, validation | `controllers/services/` |
| **Controller** | HTTP to backend | `controllers/api/` |
| **Model** | Types, session state | `app/types.ts`, `store/` |

**Flow:** Screen → orchestrator hook → service → API → backend. Shared auth/bookings state lives in Zustand stores.

**Examples**

- Explore — `app/(fan)/explore.tsx` → `useCampaignOrchestrator` → `CampaignService` → `campaignsAPI`
- Login — `BottomModalLoginFan` → `useLoginOrchestrator` → `LoginServices` → `loginAPI` + `authStore`
- Profile — `app/profile.tsx` → `useProfileOrchestrator` → `ProfileService`

Keep screens thin; orchestrators coordinate, services validate, APIs only fetch.

## Project layout

```
app/              Routes (Expo Router)
components/       Reusable UI
controllers/
  orchestrators/  Per-screen coordination
  services/       Domain logic
  api/            HTTP clients
store/            Zustand (auth, bookings, campaigns)
utility/          Shared helpers (crypto, gestures, config)
```

## What’s included

- Fan and business flows (explore, bookings, campaigns, profile, TikTok linking)
- MVC layering as above
- `app/dev-test.tsx` — minimal local sandbox screen

Omitted or simplified vs private repo: backend server, integration tests, unused utilities, and production-only dependencies.

