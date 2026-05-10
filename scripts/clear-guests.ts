import { clearGuests } from "../lib/guests";
import { logger } from "../lib/logger";
import { closeMongoClient } from "../lib/mongodb";

const CLEAR_SESSION_ID = "clear-guests-script";

async function main(): Promise<void> {
  logger.info("clearGuestsScript", CLEAR_SESSION_ID, "Starting clear guests script");
  const deletedGuestCount = await clearGuests(CLEAR_SESSION_ID);
  logger.info(
    "clearGuestsScript",
    CLEAR_SESSION_ID,
    `Clear guests script completed with ${deletedGuestCount} documents deleted`,
  );
}

main()
  .catch((clearGuestsError: unknown) => {
    logger.info("clearGuestsScript", CLEAR_SESSION_ID, "Clear guests script failed");
    console.error(clearGuestsError);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongoClient();
  });
