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

export type GuestNameValidationResult =
  | {
      success: true;
      guestName: string;
      normalizedGuestName: string;
    }
  | {
      success: false;
      message: string;
    };

export function normalizeGuestName(guestName: string): string {
  return guestName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function validateGuestName(guestName: string): GuestNameValidationResult {
  const trimmedGuestName = guestName.trim().replace(/\s+/g, " ");

  if (!trimmedGuestName) {
    return {
      success: false,
      message: "Informe seu nome.",
    };
  }

  return {
    success: true,
    guestName: trimmedGuestName,
    normalizedGuestName: normalizeGuestName(trimmedGuestName),
  };
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
