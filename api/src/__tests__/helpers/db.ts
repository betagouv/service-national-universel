import mongoose, { Connection } from "mongoose";
import customMongo from "../../mongo";

const MONGO_URL = "mongodb://localhost:27017/qwer";

let db: Connection | null = null;

const dbConnect = async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(MONGO_URL, {
    appName: "TestSnu",
    maxPoolSize: 500,
    minPoolSize: 50,
    waitQueueTimeoutMS: 30_000,
    serverSelectionTimeoutMS: 1000,
  });

  mongoose.Promise = global.Promise;
  db = mongoose.connection;
};

const dbClose = async () => {
  return await mongoose.connection.close();
};

const mockTransaction = () => {
  // @ts-ignore
  jest.spyOn(customMongo, "startSession").mockResolvedValue(null);
  jest.spyOn(customMongo, "withTransaction").mockImplementation(async (_, callback) => callback());
  jest.spyOn(customMongo, "endSession").mockResolvedValue(true);
};

export { dbConnect, dbClose, mockTransaction };
