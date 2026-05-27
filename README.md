# GO43 (public codebase)

This repository is a **public snapshot** of the GO43 codebase. It is shared for reference and learning—not a full production deployment with private services, secrets, or backend infrastructure.

GO43 is a cross-platform mobile app (Expo / React Native) for connecting fans and businesses around campaigns and bookings.

## MVC architecture

The app follows a layered **Model–View–Controller** pattern.

| Layer | Role | Location |
|-------|------|----------|
| **View** | UI, navigation, user input | `app/` (Expo Router screens), `components/` |
| **Controller** | Screen flow, wiring views to data | `controllers/orchestrators/` |
| **Controller** | Business rules, validation, mapping | `controllers/services/` |
| **Controller** | HTTP calls to the backend | `controllers/api/` |
| **Model** | Domain types, global app state | `app/types.ts`, `store/` (Zustand) |


1. **View** — A route under `app/` renders UI and calls an orchestrator hook (e.g. `useCampaignOrchestrator()` in `explore.tsx`).
2. **Orchestrator** — Coordinates that screen: local React state, loading/error handling, and calls into services or stores.
3. **Service** — Validates and shapes data (e.g. `CampaignService.fetchCampaigns()`).
4. **API** — Performs `fetch` against `EXPO_PUBLIC_BACKEND_URL` (e.g. `campaignsAPI`).
5. **Model** — Results are held in orchestrator state for the screen, or in Zustand (`authStore`, `businessAuthStore`, `bookingsStore`, `campaignStore`) for session-wide data.

### Examples

- **Fan explore** — `app/(fan)/explore.tsx` → `campaignOrchestrator` → `CampaignService` → `campaignsAPI`
- **Login** — `components/BottomModalLoginFan.tsx` → `loginOrchestrator` → `LoginServices` → `loginAPI` + `authStore`
- **Profile** — `app/profile.tsx` → `profileOrchestrator` → `ProfileService` + `authStore`

Orchestrators are the main “controller” entry point per feature; avoid putting business logic or raw `fetch` calls directly in screen files.

## What’s included

- App screens and navigation under `app/`
- UI components under `components/`
- Client logic under `controllers/` and `store/`
- Tests under `__tests__/`, split by feature
Some integrations may be stubbed, redacted, or omitted compared to the private repository.

## Note

This is not an official product release. Use it as a starting point to explore the architecture and patterns used in GO43.
# Go43-codebase-public
