export type MongoSource = { kind: "container" } | { kind: "external"; uri: string };

export const resolveMongoSource = (_env: Record<string, string | undefined>): MongoSource => ({ kind: "container" });

export const uniqueTestDatabaseName = (): string => "snu_test_";
