# RSVP Free Name Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public guest selector with a free-name confirmation flow and use the supplied invitation background image as the visual base.

**Architecture:** Keep the existing Next.js App Router, server actions, MongoDB helper module, logger, and admin dashboard. Add pure guest-name validation in `lib/guest-utils.ts`, add a MongoDB upsert flow in `lib/guests.ts`, and simplify the public page so it no longer loads guests.

**Tech Stack:** Next.js 16.2.6, React, TypeScript, MongoDB Node driver, Node test runner, CSS.

**Project Constraint:** Do not create a git worktree and do not create commits.

---

## Tasks

### Task 1: Add Tested Name Validation

- Create failing tests for free-name RSVP validation in `tests/guest-utils.test.ts`.
- Add `validateGuestName()` to `lib/guest-utils.ts`.
- Run `npm test` and `npm run lint`.

### Task 2: Add Free-Name Persistence

- Add `confirmGuestByName()` to `lib/guests.ts`.
- Add `clearGuests()` for the requested cleanup.
- Update public server action in `app/actions/guests.ts` to read `guestName` and call `confirmGuestByName()`.
- Keep logs in English and include `sessionId`.

### Task 3: Simplify Public RSVP UI

- Update `app/components/RsvpForm.tsx` to render a text input and one confirmation button.
- Update `app/page.tsx` to stop loading guests for the public page.
- Keep admin data loading unchanged.

### Task 4: Replace Invitation Visual

- Add `public/invitation-background.svg` as a fallback background.
- Update `app/globals.css` so `.invitation-card` uses `url("/invitation-background.png")` first and falls back to SVG.
- Remove separate olive/pizza placement from the public page.
- Improve desktop and mobile layout spacing.

### Task 5: Clear Seeded MongoDB Documents

- Add `scripts/clear-guests.ts`.
- Add `clear:guests` script to `package.json`.
- Run `npm run clear:guests`.
- Verify admin summary starts at zero.

### Task 6: Verify

- Run `npm test`.
- Run `npm run lint`.
- Run `npm run build`.
- Verify `/` and `/admin` return HTTP 200 locally.
- Verify raw MongoDB URI is only present in `.env.local`.
