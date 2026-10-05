import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection } from "mongoose";
import { getSharedConnectionString, startMongodbTestContainer } from "./initMongoContainer";
import { resolveMongoSource, uniqueTestDatabaseName } from "./resolveMongoSource";

export const testDatabaseProviders = (newContainer: boolean) => ({
    provide: DATABASE_CONNECTION,
    useFactory: async (): Promise<Connection> => {
        let connectionString = getSharedConnectionString();
        let dbName: string | undefined;
        if (newContainer) {
            if (resolveMongoSource(process.env).kind === "external") {
                dbName = uniqueTestDatabaseName();
            } else {
                const mongodbContainer = await startMongodbTestContainer();
                connectionString = mongodbContainer.getConnectionString();
            }
        }
        return (await mongoose.connect(connectionString, { directConnection: true, ...(dbName && { dbName }) }))
            .connection;
    },
});
