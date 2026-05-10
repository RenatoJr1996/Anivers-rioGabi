import { seedInitialGuests } from "../lib/guests";
import { logger } from "../lib/logger";
import { closeMongoClient } from "../lib/mongodb";

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

main()
  .catch((seedError: unknown) => {
    logger.info("seedGuestsScript", SEED_SESSION_ID, "Seed script failed");
    console.error(seedError);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeMongoClient();
  });
