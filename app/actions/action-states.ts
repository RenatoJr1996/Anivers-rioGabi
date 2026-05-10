export type RsvpActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
};

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
};

export const initialRsvpActionState: RsvpActionState = {
  status: "idle",
  message: "",
  submittedAt: 0,
};

export const initialAdminActionState: AdminActionState = {
  status: "idle",
  message: "",
  submittedAt: 0,
};
