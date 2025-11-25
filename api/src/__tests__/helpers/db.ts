import mongoose, { Connection } from "mongoose";
import customMongo from "../../mongo";

const MONGO_URL = "mongodb://localhost:27017/";

let db: Connection | null = null;

const getCleanName = (name: string) => {
  return name.replace(/[^a-zA-Z0-9]/g, "");
};

export const dbConnect = async (customName = "main") => {
  const dbNameSuffix = getCleanName(customName);
  mongoose.Promise = global.Promise;
  db = mongoose.connection;

  const dbName = "snu-test_" + dbNameSuffix;
  mongoose.set("strictQuery", false);
  await mongoose.connect(`${MONGO_URL}${dbName}`, {
    appName: "snu-test",
    directConnection: true,
  });
};

export const useDb = async (customName = "main") => {
  const dbNameSuffix = getCleanName(customName);
  await mongoose.connection.useDb(dbNameSuffix);
};

export const dbClose = async () => {
  await mongoose.disconnect();
};

export const mockTransaction = () => {
  // @ts-ignore
  jest.spyOn(customMongo, "startSession").mockResolvedValue(null);
  jest.spyOn(customMongo, "withTransaction").mockImplementation(async (_, callback) => callback());
  jest.spyOn(customMongo, "endSession").mockResolvedValue(true);
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};
