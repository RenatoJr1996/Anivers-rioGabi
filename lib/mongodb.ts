import { MongoClient, type Db } from "mongodb";

const mongodbUri = process.env.MONGODB_URI;
const mongodbDatabaseName = process.env.MONGODB_DATABASE ?? "aniversarioGabriela";

if (!mongodbUri) {
  throw new Error("MONGODB_URI environment variable is required.");
}

const configuredMongodbUri = mongodbUri;

const globalWithMongo = globalThis as typeof globalThis & {
  mongoClientPromise?: Promise<MongoClient>;
};

function createMongoClientPromise(): Promise<MongoClient> {
  const mongoClient = new MongoClient(configuredMongodbUri);

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

export async function closeMongoClient(): Promise<void> {
  if (!globalWithMongo.mongoClientPromise) {
    return;
  }

  const mongoClient = await globalWithMongo.mongoClientPromise;
  await mongoClient.close();
  globalWithMongo.mongoClientPromise = undefined;
}
