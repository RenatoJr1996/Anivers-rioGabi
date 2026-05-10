import { MongoServerError, ObjectId, type Collection } from "mongodb";

import {
  normalizeGuestName,
  summarizeGuests,
  validateGuestName,
  type GuestStatus,
  type GuestSummary,
  type GuestView,
} from "./guest-utils";
import { getMongoDatabase } from "./mongodb";
import { logger } from "./logger";

export type { GuestStatus, GuestSummary, GuestView } from "./guest-utils";

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

export async function confirmGuestByName(guestName: string, sessionId: string | undefined): Promise<GuestMutationResult> {
  logger.info("confirmGuestByName", sessionId, "Starting typed guest confirmation flow");

  const guestNameValidationResult = validateGuestName(guestName);

  if (!guestNameValidationResult.success) {
    logger.debug("confirmGuestByName", sessionId, "Typed guest name validation failed");
    return {
      success: false,
      message: guestNameValidationResult.message,
    };
  }

  await ensureGuestIndexes(sessionId);
  const guestsCollection = await getGuestsCollection();
  const currentDate = new Date();

  logger.debug("confirmGuestByName", sessionId, "Upserting confirmed guest by normalized name");
  await guestsCollection.updateOne(
    { normalizedName: guestNameValidationResult.normalizedGuestName },
    {
      $set: {
        name: guestNameValidationResult.guestName,
        status: "confirmed",
        updatedAt: currentDate,
      },
      $setOnInsert: {
        _id: new ObjectId(),
        normalizedName: guestNameValidationResult.normalizedGuestName,
        createdAt: currentDate,
      },
    },
    { upsert: true },
  );

  logger.info("confirmGuestByName", sessionId, "Typed guest confirmation completed successfully");

  return {
    success: true,
    message: "Presença confirmada. Obrigado!",
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

export async function clearGuests(sessionId: string | undefined): Promise<number> {
  logger.info("clearGuests", sessionId, "Starting guest collection cleanup flow");
  const guestsCollection = await getGuestsCollection();
  const deleteResult = await guestsCollection.deleteMany({});
  logger.debug("clearGuests", sessionId, `Deleted ${deleteResult.deletedCount} guest documents`);
  logger.info("clearGuests", sessionId, "Guest collection cleanup completed successfully");

  return deleteResult.deletedCount;
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
