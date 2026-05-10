import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeGuestName, summarizeGuests, validateGuestName } from "../lib/guest-utils";

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

test("validateGuestName rejects empty names", () => {
  assert.deepEqual(validateGuestName("   "), {
    success: false,
    message: "Informe seu nome.",
  });
});

test("validateGuestName accepts a typed guest name with normalized form", () => {
  assert.deepEqual(validateGuestName("  Natália   Pereira  "), {
    success: true,
    guestName: "Natália Pereira",
    normalizedGuestName: "natalia pereira",
  });
});
