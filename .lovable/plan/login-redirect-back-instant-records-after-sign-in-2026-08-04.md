# Login redirect-back + instant records after sign-in

Right now a protected page (`/dashboard`) sends signed-out users to `/auth`, but the blocked URL is forgotten: after login everyone lands on `/dashboard`, even if they were trying to open another protected page. This plan makes login return you to exactly where you were, and makes your saved records appear immediately after sign-in.

## What changes for the student

1. Open a protected page while signed out → you go to the login page, and after a successful login (email or Google) you land back on that same page.
2. If you came to login directly, you still land on the dashboard as before.
3. Right after login, plan + progress + download history + submissions load immediately — no stale empty state, no manual refresh.

## Technical details

**Redirect capture (`src/routes/_authenticated/route.tsx`)**
- In `beforeLoad`, throw `redirect({ to: "/auth", search: { redirect: location.href } })` so the blocked URL is preserved in the URL.

**Login page (`src/routes/auth.tsx`)**
- Add `validateSearch` for an optional `redirect` string; accept only same-origin app paths starting with `/` (and not `//`), else fall back to `/dashboard`.
- Replace the current hardcoded `navigate({ to: "/dashboard" })` in both the already-signed-in check and the `onAuthStateChange` handler with navigation to the validated target.
- Google OAuth: keep `redirect_uri: window.location.origin` (same-origin requirement) and stash the intended path in `sessionStorage` before starting OAuth; on mount, if a session exists and a stashed path is present, consume it and navigate there. This keeps OAuth working while still returning the user to the original page.

**Fresh records after login (`src/routes/_authenticated/dashboard.tsx`)**
- Set the `my-records` query to refetch on mount (`staleTime: 0` / `refetchOnMount: "always"`) so a fresh sign-in never renders another session's cached or empty data.
- Ensure the auth listener in the root route invalidates cached queries on `SIGNED_IN` so records refetch as soon as the session lands.

No database or backend changes are needed — existing record server functions already return everything the dashboard shows.
