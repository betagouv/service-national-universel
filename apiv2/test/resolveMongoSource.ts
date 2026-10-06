import { randomBytes } from "crypto";

export type MongoSource = { kind: "container" } | { kind: "external"; uri: string };

export const resolveMongoSource = (env: Record<string, string | undefined>): MongoSource => {
    const uri = env.TEST_MONGO_URI?.trim();
    return uri ? { kind: "external", uri } : { kind: "container" };
};

export const uniqueTestDatabaseName = (): string => `snu_test_${randomBytes(8).toString("hex")}`;
