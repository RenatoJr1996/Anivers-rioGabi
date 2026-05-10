# Birthday Invitation Design

## Context

This project will start as a new Next.js application in an empty directory. The application is a digital birthday invitation for Gabriela's 26th birthday. Guests will open one public page, select their own name, and confirm or cancel their attendance.

The project must keep the implementation simple and consistent with the initial scope. It will use MongoDB for persistence and avoid introducing unnecessary libraries, architecture patterns, or unrelated features.

No git worktree or commit will be created for this design because the user explicitly requested that restriction.

## Goals

- Build a public birthday invitation page inspired by the provided image.
- Allow each invited guest to confirm attendance.
- Allow each invited guest to cancel attendance after confirmation if needed.
- Store every guest as one MongoDB document.
- Seed the initial guest list into MongoDB.
- Provide a password-protected admin page.
- Allow the admin to view attendance totals and add new guests.

## Non-Goals

- No individual invitation links or per-guest tokens in the first version.
- No guest removal or guest editing in the first version.
- No full authentication system or third-party auth provider.
- No automated test suite unless the selected scaffold already includes a local pattern for it.
- No architecture changes beyond what is required to create this new project.

## Public Invitation Experience

The public page will be a single-page invitation matching the reference image as closely as practical in a responsive web UI. The visual direction is:

- Cream background.
- Thin gold border and gold accent details.
- Dark green primary text and decorative areas.
- Birthday, pizza, and foliage theme.
- Typography that approximates the reference image using web-safe or framework-supported fonts.

The invitation content will use the confirmed event details:

- Age: 26 years.
- Date: May 24.
- Time: 19h.
- Location: Pizzaria Tomatelli.
- Main message: the guest is invited to celebrate the birthday, with pizza and good company.

The RSVP area will let the user select their name from the full guest list. After selecting a guest, the page will show actions based on the guest's current status:

- Pending or cancelled guests can confirm attendance.
- Confirmed guests can cancel attendance.

After each action, the page will show a clear success or error message.

## Admin Experience

The admin page will live at `/admin`.

The admin login will use a password stored in an environment variable named `ADMIN_PASSWORD`. When the password is valid, the server will set an HTTP-only cookie that marks the current browser as authenticated for admin access.

The authenticated admin view will include:

- Total registered guests.
- Total confirmed guests.
- Total cancelled guests.
- Total pending guests.
- Guest list with name and attendance status.
- Form to add a new guest by name.
- Logout action that clears the admin cookie.

Adding a guest will create a new document with `pending` status. Duplicate guest names will be rejected using a normalized name comparison.

## Data Model

MongoDB will use a `guests` collection. Each guest will be stored as one document:

```ts
{
  _id: ObjectId,
  name: string,
  normalizedName: string,
  status: "pending" | "confirmed" | "cancelled",
  createdAt: Date,
  updatedAt: Date
}
```

`normalizedName` will be derived from `name` by trimming, lowercasing, and removing accent marks with Unicode normalization. This field exists to prevent duplicates such as `Natalia` and `Natália` from being treated as different people unless intentionally changed later.

The initial seed list is:

- Marilza
- Renato Jr
- Geovana
- Fernando
- Janaina
- Rafael
- Bianca
- Ivo
- Zenilda
- Luis
- Daniela
- Ricardo
- Gisele
- Arthur
- Isabela
- Higor
- Lilian
- Thiago
- Juliana
- Fernando Vespoli
- Simone
- Marcos
- Isabella
- Jean
- Beatriz Caldeira
- Beatriz Pereira
- Natália
- Namorada do Marcos
- Esposa do Jean

## Environment Variables

The MongoDB connection string will be stored in `.env.local` as `MONGODB_URI`. It must not be hardcoded in source files.

The admin password will be stored in `.env.local` as `ADMIN_PASSWORD`.

The admin cookie value will be a server-side session marker derived from `ADMIN_PASSWORD`. The raw password must never be written to the cookie.

## Architecture

The recommended implementation is a Next.js App Router project using server actions and direct MongoDB access from server-only modules.

Expected structure:

```text
app/
  page.tsx
  admin/
    page.tsx
  actions/
    admin.ts
    guests.ts
lib/
  mongodb.ts
  guests.ts
  logger.ts
scripts/
  seed-guests.ts
proxy.ts
```

Responsibilities:

- `app/page.tsx`: render the public invitation and RSVP form.
- `app/admin/page.tsx`: render login or authenticated admin dashboard.
- `app/actions/guests.ts`: handle RSVP status changes.
- `app/actions/admin.ts`: handle admin login, logout, and guest creation.
- `lib/mongodb.ts`: create and reuse the MongoDB client connection.
- `lib/guests.ts`: read and write guest documents.
- `lib/logger.ts`: centralize info and debug log formatting.
- `scripts/seed-guests.ts`: insert initial guests into MongoDB.
- `proxy.ts`: create a session id cookie for request logs.

Business logic will stay in `lib/guests.ts` and server actions will orchestrate request-level behavior. UI components will not connect directly to MongoDB.

## Logging

Relevant server flows will include `info` and `debug` logs in English. When a `sessionId` is available, logs will include it.

Required format:

```text
[actionName / ${sessionId}] - description
```

Examples:

```text
[confirmAttendance / ${sessionId}] - Starting attendance confirmation flow
[confirmAttendance / ${sessionId}] - Guest selection validated successfully
[confirmAttendance / ${sessionId}] - Updating guest attendance status
[confirmAttendance / ${sessionId}] - Guest attendance status updated successfully
```

Flows requiring logs:

- Loading public guest data.
- Confirming attendance.
- Cancelling attendance.
- Admin login.
- Admin logout.
- Loading admin dashboard data.
- Adding a new guest.
- Seeding initial guests.

## Error Handling

The public page will handle:

- Missing guest selection.
- Guest not found.
- Failed database operations.

The admin page will handle:

- Invalid password.
- Missing guest name.
- Duplicate guest name.
- Failed database operations.

User-facing errors will be short and friendly. Internal details will be logged on the server.

## Verification

Before considering implementation complete, run the available project checks created by the Next.js scaffold, expected to include:

- Lint.
- Production build.

Manual verification will cover:

- Public page loads with the invitation visual.
- Initial guests appear in the RSVP selector.
- A pending guest can confirm attendance.
- A confirmed guest can cancel attendance.
- Admin login rejects an invalid password.
- Admin login accepts the configured password.
- Admin dashboard shows accurate totals.
- Admin can add a new guest.
- Duplicate guest names are rejected.
- Seed script inserts one document per initial guest without creating duplicates.

## Implementation Decisions

- The project will use the current stable Next.js scaffold available at implementation time, with App Router and TypeScript enabled.
- The UI will use the provided image as a visual reference and will extract the event text and details from it. The implementation will recreate the layout with responsive HTML/CSS and static visual assets instead of embedding the raw text-heavy image as the whole page.
- The provided MongoDB URI will be placed in `.env.local` during implementation and excluded from committed source files if the project becomes a git repository later.
