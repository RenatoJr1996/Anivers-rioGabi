# Birthday Invitation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js birthday invitation app with MongoDB-backed RSVP, an admin dashboard, and initial guest seeding.

**Architecture:** Use Next.js App Router with TypeScript, server actions, and server-only MongoDB modules. Keep persistence in `lib/guests.ts`, request orchestration in `app/actions/*`, admin session handling in `lib/admin-auth.ts`, and UI in focused app components.

**Tech Stack:** Next.js 16.2.6 scaffold, React, TypeScript, MongoDB Node driver, npm, CSS in `app/globals.css`.

**Project Constraint:** Do not create a git worktree and do not create commits for this project. Replace version-control checkpoints with local verification checkpoints.

---

## File Structure

- Create: `app/actions/admin.ts` for admin login, logout, and add-guest server actions.
- Create: `app/actions/guests.ts` for public RSVP server actions.
- Create: `app/admin/page.tsx` for the protected admin page.
- Create: `app/components/AddGuestForm.tsx` for the admin guest creation form.
- Create: `app/components/AdminLoginForm.tsx` for the admin login form.
- Create: `app/components/LogoutButton.tsx` for admin logout.
- Create: `app/components/RsvpForm.tsx` for public RSVP interaction.
- Create: `lib/admin-auth.ts` for admin cookie validation.
- Create: `lib/guests.ts` for MongoDB guest operations.
- Create: `lib/guest-utils.ts` for tested pure guest helpers.
- Create: `lib/logger.ts` for required info/debug log format.
- Create: `lib/mongodb.ts` for MongoDB connection reuse.
- Create: `lib/session.ts` for session cookie reads.
- Create: `proxy.ts` for creating a session id cookie.
- Create: `public/olive-branch.svg` for foliage decoration.
- Create: `public/pizza.svg` for pizza decoration.
- Create: `scripts/seed-guests.ts` for initial guest insertion.
- Create: `tests/guest-utils.test.ts` for pure guest helper behavior.
- Modify: `app/globals.css` for the invitation and admin visual design.
- Modify: `app/layout.tsx` for page metadata.
- Modify: `app/page.tsx` for the public invitation page.
- Modify: `package.json` for the seed script.
- Create: `.env.local` with local runtime secrets.

---

### Task 1: Scaffold the Next.js Project

**Files:**
- Create: scaffold-generated project files in `/home/rcorrea/Renato/aniversarioGabi`
- Modify: `package.json`

- [ ] **Step 1: Verify the target directory only contains planning files**

Run:

```bash
find . -maxdepth 2 -type f | sort
```

Expected: only files under `docs/superpowers/` are present.

- [ ] **Step 2: Scaffold the app without initializing git**

Run:

```bash
cd /home/rcorrea/Renato
rm -rf aniversario-gabi-scaffold
npx create-next-app@latest aniversario-gabi-scaffold --ts --eslint --app --import-alias "@/*" --use-npm --yes --disable-git
cp -a aniversario-gabi-scaffold/. /home/rcorrea/Renato/aniversarioGabi/
rm -rf aniversario-gabi-scaffold
```

Expected: the command creates a Next.js app in the current project directory and does not create `.git`. The temporary lowercase directory is needed because npm package names cannot contain uppercase letters from `aniversarioGabi`.

- [ ] **Step 3: Install project dependencies**

Run:

```bash
npm install mongodb
npm install -D tsx
```

Expected: `package.json` contains `mongodb` in dependencies and `tsx` in dev dependencies.

- [ ] **Step 4: Add the seed script**

Modify `package.json` scripts so they include this entry alongside the scaffold defaults:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "node --import tsx --test tests/**/*.test.ts",
    "seed:guests": "node --env-file=.env.local --import tsx scripts/seed-guests.ts"
  }
}
```

- [ ] **Step 5: Run the scaffold checks**

Run:

```bash
npm run lint
```

Expected: lint passes before custom code is added.

---

### Task 2: Add Environment Configuration

**Files:**
- Create: `.env.local`
- Verify: `.gitignore`

- [ ] **Step 1: Create local environment variables**

Create `.env.local` with these keys:

Set `MONGODB_URI` to the MongoDB URI supplied in the user request, set `MONGODB_DATABASE` to `aniversarioGabriela`, and set `ADMIN_PASSWORD` to a private password before running the app.

The MongoDB URI and admin password must stay in `.env.local`; they must not be hardcoded in TypeScript files.

- [ ] **Step 2: Verify local secrets are ignored**

Run:

```bash
rg -n "^\\.env" .gitignore
```

Expected: `.gitignore` includes `.env*` or an equivalent rule that ignores `.env.local`.

---

### Task 3: Add Logging, Session, Admin Auth, and MongoDB Infrastructure

**Files:**
- Create: `lib/logger.ts`
- Create: `lib/session.ts`
- Create: `lib/admin-auth.ts`
- Create: `lib/mongodb.ts`
- Create: `proxy.ts`

- [ ] **Step 1: Create the logger**

Create `lib/logger.ts`:

```ts
type LogLevel = "debug" | "info";

function formatLogMessage(actionName: string, sessionId: string | undefined, description: string): string {
  return `[${actionName} / ${sessionId ?? "no-session"}] - ${description}`;
}

function writeLog(logLevel: LogLevel, actionName: string, sessionId: string | undefined, description: string): void {
  const formattedMessage = formatLogMessage(actionName, sessionId, description);

  if (logLevel === "debug") {
    console.debug(formattedMessage);
    return;
  }

  console.info(formattedMessage);
}

export const logger = {
  debug(actionName: string, sessionId: string | undefined, description: string): void {
    writeLog("debug", actionName, sessionId, description);
  },
  info(actionName: string, sessionId: string | undefined, description: string): void {
    writeLog("info", actionName, sessionId, description);
  },
};
```

- [ ] **Step 2: Create the session helper**

Create `lib/session.ts`:

```ts
export const SESSION_COOKIE_NAME = "birthday_session_id";

export async function getSessionId(): Promise<string | undefined> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}
```

- [ ] **Step 3: Create proxy to assign session ids**

Create `proxy.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "./lib/session";

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const currentSessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!currentSessionId) {
    response.cookies.set(SESSION_COOKIE_NAME, crypto.randomUUID(), {
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 4: Create admin auth helpers**

Create `lib/admin-auth.ts`:

```ts
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "birthday_admin_session";

const ADMIN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8;

function getAdminPassword(): string {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD environment variable is required.");
  }

  return adminPassword;
}

function createAdminSessionValue(): string {
  return crypto.createHash("sha256").update(`birthday-admin:${getAdminPassword()}`).digest("hex");
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return adminSessionCookie === createAdminSessionValue();
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: ADMIN_COOKIE_MAX_AGE_SECONDS,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function isValidAdminPassword(password: string): boolean {
  return password === getAdminPassword();
}
```

- [ ] **Step 5: Create MongoDB connection reuse**

Create `lib/mongodb.ts`:

```ts
import { MongoClient, type Db } from "mongodb";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDatabaseName = process.env.MONGODB_DATABASE ?? "aniversarioGabriela";

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is required.");
}

const globalWithMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function createMongoClientPromise(): Promise<MongoClient> {
  const mongoClient = new MongoClient(mongodbUri);
  return mongoClient.connect();
}

export function getMongoClient(): Promise<MongoClient> {
  if (!globalWithMongo.mongoClientPromise) {
    globalWithMongo.mongoClientPromise = createMongoClientPromise();
  }

  return globalWithMongo.mongoClientPromise;
}

export async function getMongoDatabase(): Promise<Db> {
  const mongoClient = await getMongoClient();
  return mongoClient.db(mongodbDatabaseName);
}
```

- [ ] **Step 6: Run TypeScript/lint verification**

Run:

```bash
npm run lint
```

Expected: lint passes.

---

### Task 4: Add Tested Guest Helpers, Persistence, and Seed Script

**Files:**
- Create: `tests/guest-utils.test.ts`
- Create: `lib/guest-utils.ts`
- Create: `lib/guests.ts`
- Create: `scripts/seed-guests.ts`

- [ ] **Step 1: Write failing tests for pure guest helpers**

Create `tests/guest-utils.test.ts`:

```ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeGuestName, summarizeGuests } from "../lib/guest-utils";

test("normalizeGuestName trims lowercases collapses spaces and removes accents", () => {
  assert.equal(normalizeGuestName("  Natália   Pereira  "), "natalia pereira");
});

test("summarizeGuests counts each attendance status", () => {
  const guestSummary = summarizeGuests([
    { id: "1", name: "Marilza", status: "pending" },
    { id: "2", name: "Renato Jr", status: "confirmed" },
    { id: "3", name: "Geovana", status: "confirmed" },
    { id: "4", name: "Fernando", status: "cancelled" },
  ]);

  assert.deepEqual(guestSummary, {
    totalGuests: 4,
    confirmedGuests: 2,
    cancelledGuests: 1,
    pendingGuests: 1,
  });
});
```

- [ ] **Step 2: Run tests and verify they fail because helper module is not implemented**

Run:

```bash
npm test
```

Expected: test run fails because `../lib/guest-utils` does not exist yet.

- [ ] **Step 3: Create guest helper implementation**

Create `lib/guest-utils.ts`:

```ts
export type GuestStatus = "pending" | "confirmed" | "cancelled";

export type GuestView = {
  id: string;
  name: string;
  status: GuestStatus;
};

export type GuestSummary = {
  totalGuests: number;
  confirmedGuests: number;
  cancelledGuests: number;
  pendingGuests: number;
};

export function normalizeGuestName(guestName: string): string {
  return guestName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function summarizeGuests(guests: GuestView[]): GuestSummary {
  return guests.reduce<GuestSummary>(
    (currentSummary, guest) => ({
      totalGuests: currentSummary.totalGuests + 1,
      confirmedGuests: currentSummary.confirmedGuests + (guest.status === "confirmed" ? 1 : 0),
      cancelledGuests: currentSummary.cancelledGuests + (guest.status === "cancelled" ? 1 : 0),
      pendingGuests: currentSummary.pendingGuests + (guest.status === "pending" ? 1 : 0),
    }),
    {
      totalGuests: 0,
      confirmedGuests: 0,
      cancelledGuests: 0,
      pendingGuests: 0,
    },
  );
}
```

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
npm test
```

Expected: both guest helper tests pass.

- [ ] **Step 5: Create guest persistence functions**

Create `lib/guests.ts`:

```ts
import { MongoServerError, ObjectId, type Collection } from "mongodb";

import { normalizeGuestName, summarizeGuests, type GuestStatus, type GuestSummary, type GuestView } from "./guest-utils";
import { getMongoDatabase } from "./mongodb";
import { logger } from "./logger";

export type GuestDashboard = {
  guests: GuestView[];
  summary: GuestSummary;
};

export type GuestMutationResult = {
  success: boolean;
  message: string;
};

type GuestDocument = {
  _id: ObjectId;
  name: string;
  normalizedName: string;
  status: GuestStatus;
  createdAt: Date;
  updatedAt: Date;
};

const GUESTS_COLLECTION_NAME = "guests";

export const INITIAL_GUEST_NAMES = [
  "Marilza",
  "Renato Jr",
  "Geovana",
  "Fernando",
  "Janaina",
  "Rafael",
  "Bianca",
  "Ivo",
  "Zenilda",
  "Luis",
  "Daniela",
  "Ricardo",
  "Gisele",
  "Arthur",
  "Isabela",
  "Higor",
  "Lilian",
  "Thiago",
  "Juliana",
  "Fernando Vespoli",
  "Simone",
  "Marcos",
  "Isabella",
  "Jean",
  "Beatriz Caldeira",
  "Beatriz Pereira",
  "Natália",
  "Namorada do Marcos",
  "Esposa do Jean",
] as const;

let indexesEnsured = false;

function mapGuestDocumentToView(guestDocument: GuestDocument): GuestView {
  return {
    id: guestDocument._id.toString(),
    name: guestDocument.name,
    status: guestDocument.status,
  };
}

async function getGuestsCollection(): Promise<Collection<GuestDocument>> {
  const mongoDatabase = await getMongoDatabase();
  return mongoDatabase.collection<GuestDocument>(GUESTS_COLLECTION_NAME);
}

async function ensureGuestIndexes(sessionId: string | undefined): Promise<void> {
  if (indexesEnsured) {
    return;
  }

  logger.debug("ensureGuestIndexes", sessionId, "Creating guest indexes");
  const guestsCollection = await getGuestsCollection();
  await guestsCollection.createIndex({ normalizedName: 1 }, { unique: true });
  indexesEnsured = true;
  logger.info("ensureGuestIndexes", sessionId, "Guest indexes are ready");
}

export async function listGuests(sessionId: string | undefined): Promise<GuestView[]> {
  logger.info("listGuests", sessionId, "Starting guest list loading flow");
  await ensureGuestIndexes(sessionId);

  const guestsCollection = await getGuestsCollection();
  const guestDocuments = await guestsCollection.find({}).sort({ name: 1 }).toArray();

  logger.debug("listGuests", sessionId, `Loaded ${guestDocuments.length} guests from database`);
  logger.info("listGuests", sessionId, "Guest list loaded successfully");

  return guestDocuments.map(mapGuestDocumentToView);
}

export async function getGuestDashboard(sessionId: string | undefined): Promise<GuestDashboard> {
  logger.info("getGuestDashboard", sessionId, "Starting admin dashboard data loading flow");
  const guests = await listGuests(sessionId);

  const summary = summarizeGuests(guests);

  logger.debug("getGuestDashboard", sessionId, "Admin dashboard totals calculated successfully");
  logger.info("getGuestDashboard", sessionId, "Admin dashboard data loaded successfully");

  return {
    guests,
    summary,
  };
}

export async function updateGuestStatus(
  guestId: string,
  nextGuestStatus: GuestStatus,
  sessionId: string | undefined,
): Promise<GuestMutationResult> {
  logger.info("updateGuestStatus", sessionId, "Starting guest attendance status update flow");

  if (!ObjectId.isValid(guestId)) {
    logger.debug("updateGuestStatus", sessionId, "Guest id validation failed");
    return {
      success: false,
      message: "Convidado não encontrado.",
    };
  }

  await ensureGuestIndexes(sessionId);
  const guestsCollection = await getGuestsCollection();
  logger.debug("updateGuestStatus", sessionId, "Updating guest attendance status in database");
  const updateResult = await guestsCollection.updateOne(
    { _id: new ObjectId(guestId) },
    {
      $set: {
        status: nextGuestStatus,
        updatedAt: new Date(),
      },
    },
  );

  if (updateResult.matchedCount === 0) {
    logger.debug("updateGuestStatus", sessionId, "No guest matched the provided id");
    return {
      success: false,
      message: "Convidado não encontrado.",
    };
  }

  logger.info("updateGuestStatus", sessionId, "Guest attendance status updated successfully");

  return {
    success: true,
    message: nextGuestStatus === "confirmed" ? "Presença confirmada." : "Presença cancelada.",
  };
}

export async function addGuest(guestName: string, sessionId: string | undefined): Promise<GuestMutationResult> {
  logger.info("addGuest", sessionId, "Starting guest creation flow");

  const trimmedGuestName = guestName.trim();

  if (!trimmedGuestName) {
    logger.debug("addGuest", sessionId, "Guest name validation failed");
    return {
      success: false,
      message: "Informe o nome do convidado.",
    };
  }

  const normalizedGuestName = normalizeGuestName(trimmedGuestName);
  await ensureGuestIndexes(sessionId);
  const guestsCollection = await getGuestsCollection();
  const existingGuest = await guestsCollection.findOne({ normalizedName: normalizedGuestName });

  if (existingGuest) {
    logger.debug("addGuest", sessionId, "Duplicate guest name rejected");
    return {
      success: false,
      message: "Este convidado já está na lista.",
    };
  }

  const currentDate = new Date();

  try {
    await guestsCollection.insertOne({
      _id: new ObjectId(),
      name: trimmedGuestName,
      normalizedName: normalizedGuestName,
      status: "pending",
      createdAt: currentDate,
      updatedAt: currentDate,
    });
  } catch (guestCreationError) {
    if (guestCreationError instanceof MongoServerError && guestCreationError.code === 11000) {
      logger.debug("addGuest", sessionId, "Duplicate guest name rejected by unique index");
      return {
        success: false,
        message: "Este convidado já está na lista.",
      };
    }

    throw guestCreationError;
  }

  logger.info("addGuest", sessionId, "Guest created successfully");

  return {
    success: true,
    message: "Convidado adicionado.",
  };
}

export async function seedInitialGuests(sessionId: string | undefined): Promise<GuestSummary> {
  logger.info("seedInitialGuests", sessionId, "Starting initial guest seed flow");
  await ensureGuestIndexes(sessionId);

  for (const guestName of INITIAL_GUEST_NAMES) {
    logger.debug("seedInitialGuests", sessionId, `Seeding guest ${guestName}`);
    await addGuest(guestName, sessionId);
  }

  const guestDashboard = await getGuestDashboard(sessionId);
  logger.info("seedInitialGuests", sessionId, "Initial guest seed flow finished");

  return guestDashboard.summary;
}
```

- [ ] **Step 6: Create the seed script**

Create `scripts/seed-guests.ts`:

```ts
import { seedInitialGuests } from "../lib/guests";
import { logger } from "../lib/logger";

const SEED_SESSION_ID = "seed-guests-script";

async function main(): Promise<void> {
  logger.info("seedGuestsScript", SEED_SESSION_ID, "Starting seed script");
  const guestSummary = await seedInitialGuests(SEED_SESSION_ID);
  logger.info(
    "seedGuestsScript",
    SEED_SESSION_ID,
    `Seed script completed with ${guestSummary.totalGuests} guests registered`,
  );
}

main().catch((seedError: unknown) => {
  logger.info("seedGuestsScript", SEED_SESSION_ID, "Seed script failed");
  console.error(seedError);
  process.exit(1);
});
```

- [ ] **Step 7: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

- [ ] **Step 8: Run the seed script**

Run:

```bash
npm run seed:guests
```

Expected: the script exits with code `0` and logs that 29 guests are registered.

- [ ] **Step 9: Run the seed script again to verify duplicate safety**

Run:

```bash
npm run seed:guests
```

Expected: the script exits with code `0`, duplicate guest attempts are rejected in logs, and the final total remains 29.

---

### Task 5: Add Server Actions

**Files:**
- Create: `app/actions/guests.ts`
- Create: `app/actions/admin.ts`

- [ ] **Step 1: Create public RSVP action**

Create `app/actions/guests.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { updateGuestStatus, type GuestStatus } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export type RsvpActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
};

export const initialRsvpActionState: RsvpActionState = {
  status: "idle",
  message: "",
  submittedAt: 0,
};

function getGuestStatusFromIntent(intent: FormDataEntryValue | null): GuestStatus | undefined {
  if (intent === "confirm") {
    return "confirmed";
  }

  if (intent === "cancel") {
    return "cancelled";
  }

  return undefined;
}

export async function updateAttendanceAction(
  _previousState: RsvpActionState,
  formData: FormData,
): Promise<RsvpActionState> {
  const sessionId = await getSessionId();
  logger.info("updateAttendanceAction", sessionId, "Starting RSVP action flow");

  const guestId = formData.get("guestId")?.toString() ?? "";
  const nextGuestStatus = getGuestStatusFromIntent(formData.get("intent"));

  if (!guestId || !nextGuestStatus) {
    logger.debug("updateAttendanceAction", sessionId, "RSVP payload validation failed");
    return {
      status: "error",
      message: "Selecione seu nome antes de continuar.",
      submittedAt: Date.now(),
    };
  }

  logger.debug("updateAttendanceAction", sessionId, "RSVP payload validated successfully");
  const guestMutationResult = await updateGuestStatus(guestId, nextGuestStatus, sessionId);

  if (!guestMutationResult.success) {
    logger.debug("updateAttendanceAction", sessionId, "RSVP update returned a business error");
    return {
      status: "error",
      message: guestMutationResult.message,
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/");
  logger.info("updateAttendanceAction", sessionId, "RSVP action flow completed successfully");

  return {
    status: "success",
    message: guestMutationResult.message,
    submittedAt: Date.now(),
  };
}
```

- [ ] **Step 2: Create admin actions**

Create `app/actions/admin.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { addGuest } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
  submittedAt: 0,
};

export async function loginAdminAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const sessionId = await getSessionId();
  logger.info("loginAdminAction", sessionId, "Starting admin login flow");

  const adminPassword = formData.get("adminPassword")?.toString() ?? "";

  if (!isValidAdminPassword(adminPassword)) {
    logger.debug("loginAdminAction", sessionId, "Admin password validation failed");
    return {
      status: "error",
      message: "Senha inválida.",
      submittedAt: Date.now(),
    };
  }

  await setAdminSessionCookie();
  logger.info("loginAdminAction", sessionId, "Admin login completed successfully");
  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  const sessionId = await getSessionId();
  logger.info("logoutAdminAction", sessionId, "Starting admin logout flow");
  await clearAdminSessionCookie();
  logger.info("logoutAdminAction", sessionId, "Admin logout completed successfully");
  redirect("/admin");
}

export async function addGuestAction(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const sessionId = await getSessionId();
  logger.info("addGuestAction", sessionId, "Starting admin guest creation action");

  const adminAuthenticated = await isAdminAuthenticated();

  if (!adminAuthenticated) {
    logger.debug("addGuestAction", sessionId, "Guest creation blocked because admin is not authenticated");
    return {
      status: "error",
      message: "Acesso administrativo necessário.",
      submittedAt: Date.now(),
    };
  }

  const guestName = formData.get("guestName")?.toString() ?? "";
  const guestMutationResult = await addGuest(guestName, sessionId);

  if (!guestMutationResult.success) {
    logger.debug("addGuestAction", sessionId, "Guest creation returned a business error");
    return {
      status: "error",
      message: guestMutationResult.message,
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  logger.info("addGuestAction", sessionId, "Admin guest creation action completed successfully");

  return {
    status: "success",
    message: guestMutationResult.message,
    submittedAt: Date.now(),
  };
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

---

### Task 6: Build Public Invitation UI

**Files:**
- Create: `app/components/RsvpForm.tsx`
- Create: `public/olive-branch.svg`
- Create: `public/pizza.svg`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create the RSVP client component**

Create `app/components/RsvpForm.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";

import {
  initialRsvpActionState,
  updateAttendanceAction,
} from "@/app/actions/guests";
import type { GuestView } from "@/lib/guests";

type RsvpFormProps = {
  guests: GuestView[];
};

export function RsvpForm({ guests }: RsvpFormProps) {
  const router = useRouter();
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [actionState, formAction, isPending] = useActionState(updateAttendanceAction, initialRsvpActionState);

  const selectedGuest = useMemo(
    () => guests.find((guest) => guest.id === selectedGuestId),
    [guests, selectedGuestId],
  );

  useEffect(() => {
    if (actionState.status === "success") {
      router.refresh();
    }
  }, [actionState.submittedAt, actionState.status, router]);

  return (
    <section className="rsvp-panel" aria-labelledby="rsvp-title">
      <p className="section-kicker">confirme sua presença</p>
      <h2 id="rsvp-title">Vai comemorar comigo?</h2>
      <form action={formAction} className="rsvp-form">
        <label htmlFor="guestId">Selecione seu nome</label>
        <select
          id="guestId"
          name="guestId"
          value={selectedGuestId}
          onChange={(event) => setSelectedGuestId(event.target.value)}
        >
          <option value="">Escolha na lista</option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.name} - {guest.status === "confirmed" ? "confirmado" : guest.status === "cancelled" ? "cancelado" : "pendente"}
            </option>
          ))}
        </select>

        <div className="rsvp-actions">
          <button type="submit" name="intent" value="confirm" disabled={isPending || !selectedGuestId}>
            Confirmar presença
          </button>
          {selectedGuest?.status === "confirmed" ? (
            <button
              className="secondary-button"
              type="submit"
              name="intent"
              value="cancel"
              disabled={isPending || !selectedGuestId}
            >
              Cancelar presença
            </button>
          ) : null}
        </div>
      </form>

      {actionState.message ? (
        <p className={`form-message ${actionState.status === "error" ? "form-message-error" : "form-message-success"}`}>
          {actionState.message}
        </p>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 2: Add local visual assets**

Create `public/olive-branch.svg`:

```svg
<svg width="220" height="320" viewBox="0 0 220 320" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Olive branch">
  <path d="M120 12C86 92 96 178 52 306" stroke="#183c2c" stroke-width="7" stroke-linecap="round"/>
  <path d="M104 56C61 42 35 50 18 82C56 93 84 84 104 56Z" fill="#49633a"/>
  <path d="M113 96C157 77 187 83 206 114C166 130 136 123 113 96Z" fill="#607a44"/>
  <path d="M89 132C48 118 24 128 10 159C48 169 74 160 89 132Z" fill="#385b34"/>
  <path d="M101 178C144 160 174 168 193 198C153 213 124 207 101 178Z" fill="#526f3c"/>
  <path d="M73 220C36 207 15 216 2 244C37 254 61 247 73 220Z" fill="#31502f"/>
  <path d="M86 260C123 243 150 249 168 276C134 291 107 286 86 260Z" fill="#66804a"/>
</svg>
```

Create `public/pizza.svg`:

```svg
<svg width="340" height="260" viewBox="0 0 340 260" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pizza">
  <path d="M20 244C52 106 164 22 324 20C270 126 165 208 20 244Z" fill="#f2c879"/>
  <path d="M20 244C52 106 164 22 324 20" stroke="#8f4a1b" stroke-width="22" stroke-linecap="round"/>
  <path d="M66 211C101 112 186 59 284 45C240 112 168 177 66 211Z" fill="#fff1bf"/>
  <circle cx="148" cy="139" r="19" fill="#b83224"/>
  <circle cx="214" cy="88" r="16" fill="#b83224"/>
  <circle cx="103" cy="185" r="17" fill="#b83224"/>
  <circle cx="185" cy="163" r="13" fill="#b83224"/>
  <path d="M132 112C146 96 164 92 185 101" stroke="#31502f" stroke-width="9" stroke-linecap="round"/>
  <path d="M221 137C239 130 255 133 268 147" stroke="#31502f" stroke-width="8" stroke-linecap="round"/>
  <path d="M90 149C105 138 119 137 133 147" stroke="#31502f" stroke-width="8" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 3: Update metadata**

Modify `app/layout.tsx` to keep the scaffold structure and set metadata:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aniversário Gabriela",
  description: "Convite de aniversário com confirmação de presença.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Build the public page**

Modify `app/page.tsx`:

```tsx
import Image from "next/image";

import { RsvpForm } from "@/app/components/RsvpForm";
import { listGuests } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export default async function Home() {
  const sessionId = await getSessionId();
  logger.info("homePage", sessionId, "Starting public invitation page loading flow");
  const guests = await listGuests(sessionId);
  logger.info("homePage", sessionId, "Public invitation page loaded successfully");

  return (
    <main className="public-page">
      <section className="invitation-card" aria-label="Convite de aniversário">
        <Image className="olive olive-top" src="/olive-branch.svg" alt="" width={220} height={320} priority />
        <Image className="olive olive-bottom" src="/olive-branch.svg" alt="" width={220} height={320} />
        <Image className="pizza-art" src="/pizza.svg" alt="" width={340} height={260} priority />

        <div className="gold-frame">
          <p className="invitation-overline">Você é meu convidado para comemorar meu</p>
          <div className="ornament" aria-hidden="true">
            <span />
            <strong>♥</strong>
            <span />
          </div>
          <h1>Aniversário!</h1>
          <p className="age-line">26 anos</p>
          <p className="invitation-copy">
            Vai ser uma noite especial com boa companhia, boas conversas e, é claro,
            <strong> muita pizza!</strong>
          </p>

          <div className="event-grid" aria-label="Detalhes do evento">
            <div>
              <span className="detail-icon" aria-hidden="true">▣</span>
              <p>Dia</p>
              <strong>24</strong>
              <small>de maio</small>
            </div>
            <div>
              <span className="detail-icon" aria-hidden="true">◷</span>
              <p>Horário</p>
              <strong>19h</strong>
            </div>
            <div>
              <span className="detail-icon" aria-hidden="true">⌂</span>
              <p>Local</p>
              <strong className="place-name">Pizzaria Tomatelli</strong>
            </div>
          </div>

          <div className="presence-banner">
            <p>Sua presença torna tudo</p>
            <strong>mais especial!</strong>
          </div>
        </div>
      </section>

      <RsvpForm guests={guests} />
    </main>
  );
}
```

- [ ] **Step 5: Add public and shared CSS**

Replace the scaffold content in `app/globals.css` with the full CSS from Task 7 Step 4 after admin styles are added. If implementing Task 6 before Task 7, include the public-page, invitation-card, rsvp-panel, form, button, and responsive sections from that CSS first.

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

---

### Task 7: Build Admin UI and Complete CSS

**Files:**
- Create: `app/components/AdminLoginForm.tsx`
- Create: `app/components/AddGuestForm.tsx`
- Create: `app/components/LogoutButton.tsx`
- Modify: `app/admin/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create admin login form**

Create `app/components/AdminLoginForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";

import { initialAdminActionState, loginAdminAction } from "@/app/actions/admin";

export function AdminLoginForm() {
  const [actionState, formAction, isPending] = useActionState(loginAdminAction, initialAdminActionState);

  return (
    <form action={formAction} className="admin-form">
      <label htmlFor="adminPassword">Senha do admin</label>
      <input id="adminPassword" name="adminPassword" type="password" autoComplete="current-password" />
      <button type="submit" disabled={isPending}>
        Entrar
      </button>
      {actionState.message ? <p className="form-message form-message-error">{actionState.message}</p> : null}
    </form>
  );
}
```

- [ ] **Step 2: Create add guest form**

Create `app/components/AddGuestForm.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { addGuestAction, initialAdminActionState } from "@/app/actions/admin";

export function AddGuestForm() {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(addGuestAction, initialAdminActionState);

  useEffect(() => {
    if (actionState.status === "success") {
      router.refresh();
    }
  }, [actionState.status, actionState.submittedAt, router]);

  return (
    <form action={formAction} className="admin-form add-guest-form">
      <label htmlFor="guestName">Novo convidado</label>
      <div className="inline-form-row">
        <input id="guestName" name="guestName" type="text" autoComplete="off" />
        <button type="submit" disabled={isPending}>
          Adicionar
        </button>
      </div>
      {actionState.message ? (
        <p className={`form-message ${actionState.status === "error" ? "form-message-error" : "form-message-success"}`}>
          {actionState.message}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 3: Create logout button**

Create `app/components/LogoutButton.tsx`:

```tsx
import { logoutAdminAction } from "@/app/actions/admin";

export function LogoutButton() {
  return (
    <form action={logoutAdminAction}>
      <button className="secondary-button" type="submit">
        Sair
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create admin page**

Create `app/admin/page.tsx`:

```tsx
import { AddGuestForm } from "@/app/components/AddGuestForm";
import { AdminLoginForm } from "@/app/components/AdminLoginForm";
import { LogoutButton } from "@/app/components/LogoutButton";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getGuestDashboard } from "@/lib/guests";
import { logger } from "@/lib/logger";
import { getSessionId } from "@/lib/session";

export default async function AdminPage() {
  const sessionId = await getSessionId();
  logger.info("adminPage", sessionId, "Starting admin page loading flow");
  const adminAuthenticated = await isAdminAuthenticated();

  if (!adminAuthenticated) {
    logger.debug("adminPage", sessionId, "Rendering admin login view");
    return (
      <main className="admin-page admin-login-page">
        <section className="admin-panel admin-login-panel">
          <p className="section-kicker">admin</p>
          <h1>Controle de presença</h1>
          <AdminLoginForm />
        </section>
      </main>
    );
  }

  const guestDashboard = await getGuestDashboard(sessionId);
  logger.info("adminPage", sessionId, "Admin page loaded successfully");

  return (
    <main className="admin-page">
      <section className="admin-panel">
        <div className="admin-header">
          <div>
            <p className="section-kicker">admin</p>
            <h1>Controle de presença</h1>
          </div>
          <LogoutButton />
        </div>

        <div className="summary-grid" aria-label="Resumo de confirmações">
          <div>
            <span>Total</span>
            <strong>{guestDashboard.summary.totalGuests}</strong>
          </div>
          <div>
            <span>Confirmados</span>
            <strong>{guestDashboard.summary.confirmedGuests}</strong>
          </div>
          <div>
            <span>Cancelados</span>
            <strong>{guestDashboard.summary.cancelledGuests}</strong>
          </div>
          <div>
            <span>Pendentes</span>
            <strong>{guestDashboard.summary.pendingGuests}</strong>
          </div>
        </div>

        <AddGuestForm />

        <div className="guest-table-wrap">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {guestDashboard.guests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.name}</td>
                  <td>
                    <span className={`status-pill status-${guest.status}`}>
                      {guest.status === "confirmed" ? "confirmado" : guest.status === "cancelled" ? "cancelado" : "pendente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 5: Replace global CSS**

Replace `app/globals.css`:

```css
:root {
  --background: #f6eddd;
  --paper: #fff8ea;
  --green: #143927;
  --green-soft: #214a35;
  --gold: #b98422;
  --gold-soft: #d6b66e;
  --ink: #1c2b22;
  --muted: #6e6454;
  --danger: #9f2f26;
  --success: #1f6a42;
  --line: rgba(185, 132, 34, 0.42);
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--background);
}

body {
  min-height: 100vh;
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(185, 132, 34, 0.14), transparent 32rem),
    linear-gradient(180deg, #fbf3e5 0%, var(--background) 100%);
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
}

button,
input,
select {
  font: inherit;
}

button {
  min-height: 2.75rem;
  border: 0;
  border-radius: 6px;
  background: var(--green);
  color: #fff8ea;
  cursor: pointer;
  font-weight: 700;
  padding: 0.75rem 1.1rem;
  transition: transform 160ms ease, background-color 160ms ease;
}

button:hover:not(:disabled) {
  background: var(--green-soft);
  transform: translateY(-1px);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

input,
select {
  min-height: 2.75rem;
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 6px;
  background: #fffdf7;
  color: var(--ink);
  padding: 0.72rem 0.85rem;
}

label {
  color: var(--green);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.public-page {
  display: grid;
  gap: 1.5rem;
  margin: 0 auto;
  max-width: 58rem;
  min-height: 100vh;
  padding: 1rem;
}

.invitation-card {
  min-height: 48rem;
  overflow: hidden;
  position: relative;
}

.gold-frame {
  min-height: 48rem;
  border: 3px solid var(--gold);
  border-radius: 8px;
  background:
    radial-gradient(circle at 14% 11%, rgba(185, 132, 34, 0.18) 0 0.1rem, transparent 0.15rem),
    radial-gradient(circle at 88% 31%, rgba(185, 132, 34, 0.18) 0 0.12rem, transparent 0.17rem),
    var(--paper);
  padding: 4.8rem 2rem 2rem;
  position: relative;
  text-align: center;
}

.olive,
.pizza-art {
  pointer-events: none;
  position: absolute;
  z-index: 2;
}

.olive-top {
  left: -3.5rem;
  top: -3.2rem;
  transform: rotate(18deg);
}

.olive-bottom {
  bottom: -2rem;
  right: -4rem;
  transform: rotate(212deg);
}

.pizza-art {
  bottom: -1rem;
  left: -2.5rem;
  width: min(42vw, 20rem);
  height: auto;
}

.invitation-overline,
.section-kicker {
  color: var(--green);
  font-size: clamp(0.8rem, 2.4vw, 1.25rem);
  font-weight: 700;
  letter-spacing: 0.18rem;
  line-height: 1.8;
  margin: 0 auto;
  max-width: 40rem;
  text-transform: uppercase;
}

.ornament {
  align-items: center;
  color: var(--gold);
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0 0.2rem;
}

.ornament span {
  background: var(--gold);
  height: 1px;
  width: 7rem;
}

.ornament strong {
  font-size: 1.2rem;
}

h1,
h2,
p {
  margin-top: 0;
}

.invitation-card h1 {
  color: var(--green);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(4.2rem, 14vw, 8.5rem);
  font-style: italic;
  font-weight: 500;
  line-height: 0.95;
  margin: 0.4rem 0 1.1rem;
}

.age-line {
  color: var(--gold);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.3rem, 7vw, 4.2rem);
  font-weight: 700;
  margin-bottom: 1.8rem;
  text-transform: uppercase;
}

.invitation-copy {
  color: var(--ink);
  font-size: clamp(1rem, 2.5vw, 1.35rem);
  font-weight: 700;
  letter-spacing: 0.08rem;
  line-height: 1.7;
  margin: 0 auto 2rem;
  max-width: 40rem;
  text-transform: uppercase;
}

.invitation-copy strong {
  color: var(--gold);
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 6vw, 3.5rem);
  font-style: italic;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: lowercase;
}

.event-grid {
  display: grid;
  gap: 0;
  grid-template-columns: repeat(3, 1fr);
  margin: 0 auto;
  max-width: 43rem;
}

.event-grid > div {
  border-left: 1px solid var(--line);
  min-height: 10rem;
  padding: 0.4rem 1rem;
}

.event-grid > div:first-child {
  border-left: 0;
}

.detail-icon {
  color: var(--green);
  display: block;
  font-size: 2.8rem;
  line-height: 1;
  margin-bottom: 0.9rem;
}

.event-grid p {
  color: var(--green);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.14rem;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.event-grid strong {
  color: var(--green);
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2.5rem, 8vw, 4rem);
  line-height: 1;
}

.event-grid small {
  color: var(--green);
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 1.6rem;
  font-weight: 700;
  margin-top: 0.25rem;
  text-transform: uppercase;
}

.place-name {
  font-size: clamp(1.9rem, 5vw, 3rem) !important;
  font-style: italic;
}

.presence-banner {
  background: var(--green);
  color: #fff8ea;
  margin: 2.1rem auto 0;
  max-width: 33rem;
  padding: 1.5rem 1.25rem;
  position: relative;
}

.presence-banner p {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.16rem;
  line-height: 1.6;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.presence-banner strong {
  color: var(--gold-soft);
  display: block;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 6vw, 3rem);
  font-style: italic;
  font-weight: 500;
}

.rsvp-panel,
.admin-panel {
  background: rgba(255, 248, 234, 0.94);
  border: 1px solid var(--line);
  border-radius: 8px;
  box-shadow: 0 18px 50px rgba(20, 57, 39, 0.12);
  padding: 1.5rem;
}

.rsvp-panel {
  margin-bottom: 2rem;
}

.rsvp-panel h2,
.admin-panel h1 {
  color: var(--green);
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 600;
  line-height: 1.05;
  margin-bottom: 1.2rem;
}

.rsvp-form,
.admin-form {
  display: grid;
  gap: 0.8rem;
}

.rsvp-actions,
.inline-form-row,
.admin-header {
  display: flex;
  gap: 0.75rem;
}

.rsvp-actions {
  flex-wrap: wrap;
}

.secondary-button {
  background: transparent;
  border: 1px solid var(--green);
  color: var(--green);
}

.secondary-button:hover:not(:disabled) {
  background: rgba(20, 57, 39, 0.08);
}

.form-message {
  border-radius: 6px;
  font-weight: 700;
  margin: 0.7rem 0 0;
  padding: 0.8rem;
}

.form-message-success {
  background: rgba(31, 106, 66, 0.12);
  color: var(--success);
}

.form-message-error {
  background: rgba(159, 47, 38, 0.12);
  color: var(--danger);
}

.admin-page {
  margin: 0 auto;
  max-width: 68rem;
  min-height: 100vh;
  padding: 1rem;
}

.admin-login-page {
  align-items: center;
  display: flex;
  justify-content: center;
}

.admin-login-panel {
  max-width: 28rem;
  width: 100%;
}

.admin-header {
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.2rem;
}

.summary-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1.25rem;
}

.summary-grid div {
  background: #fffdf7;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 1rem;
}

.summary-grid span {
  color: var(--muted);
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
  text-transform: uppercase;
}

.summary-grid strong {
  color: var(--green);
  display: block;
  font-size: 2rem;
}

.add-guest-form {
  border-bottom: 1px solid var(--line);
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
}

.inline-form-row {
  align-items: center;
}

.guest-table-wrap {
  overflow-x: auto;
}

.guest-table {
  border-collapse: collapse;
  width: 100%;
}

.guest-table th,
.guest-table td {
  border-bottom: 1px solid var(--line);
  padding: 0.85rem;
  text-align: left;
}

.guest-table th {
  color: var(--green);
  font-size: 0.82rem;
  letter-spacing: 0.08rem;
  text-transform: uppercase;
}

.status-pill {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.35rem 0.65rem;
  text-transform: uppercase;
}

.status-confirmed {
  background: rgba(31, 106, 66, 0.12);
  color: var(--success);
}

.status-cancelled {
  background: rgba(159, 47, 38, 0.12);
  color: var(--danger);
}

.status-pending {
  background: rgba(185, 132, 34, 0.16);
  color: #77510f;
}

@media (max-width: 720px) {
  .public-page,
  .admin-page {
    padding: 0.65rem;
  }

  .gold-frame {
    padding: 4.2rem 1rem 1rem;
  }

  .olive-top {
    left: -5rem;
  }

  .olive-bottom {
    right: -5.5rem;
  }

  .event-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .event-grid > div {
    border-left: 0;
    border-top: 1px solid var(--line);
    min-height: auto;
    padding: 1.25rem 0;
  }

  .event-grid > div:first-child {
    border-top: 0;
  }

  .pizza-art {
    opacity: 0.78;
    width: 13rem;
  }

  .rsvp-actions,
  .inline-form-row,
  .admin-header {
    flex-direction: column;
  }

  .inline-form-row button,
  .rsvp-actions button {
    width: 100%;
  }
}
```

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

---

### Task 8: Final Verification

**Files:**
- Verify: all implementation files
- Verify: MongoDB `guests` collection

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: lint passes.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: the production build completes successfully.

- [ ] **Step 3: Start the local development server**

Run:

```bash
npm run dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 4: Verify public RSVP manually**

Open the local URL and verify:

- The invitation page resembles the provided reference image.
- The page shows age 26, date May 24, time 19h, and Pizzaria Tomatelli.
- The RSVP select contains the seeded guests.
- Selecting a pending guest and clicking `Confirmar presença` shows `Presença confirmada.`
- Refreshing the page shows that guest as confirmed.
- Selecting the same guest and clicking `Cancelar presença` shows `Presença cancelada.`

- [ ] **Step 5: Verify admin manually**

Open `/admin` and verify:

- A wrong password shows `Senha inválida.`
- The configured `ADMIN_PASSWORD` opens the dashboard.
- Totals match the seeded collection.
- Adding a new guest shows `Convidado adicionado.`
- Adding the same guest again shows `Este convidado já está na lista.`
- Clicking `Sair` returns to the login view.

- [ ] **Step 6: Stop the local server**

Stop the running `npm run dev` process with `Ctrl+C`.

- [ ] **Step 7: Check for hardcoded secrets**

Run:

```bash
rg -n "mongodb\\+srv|ADMIN_PASSWORD=|MONGODB_URI=" --glob '!node_modules/**' --glob '!.env.local'
```

Expected: no source files contain the raw MongoDB URI or local admin password.

- [ ] **Step 8: Confirm no git operations were performed**

Run:

```bash
test ! -d .git && echo "No git repository initialized"
```

Expected: `No git repository initialized`.
