import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose, { Connection } from "mongoose";
import { getSharedConnectionString, startMongodbTestContainer } from "./initMongoContainer";

export const testDatabaseProviders = (newContainer: boolean) => ({
    provide: DATABASE_CONNECTION,
    useFactory: async (): Promise<Connection> => {
        let connectionString = getSharedConnectionString();
        if (newContainer) {
            const mongodbContainer = await startMongodbTestContainer();
            connectionString = mongodbContainer.getConnectionString();
        }
        return (await mongoose.connect(connectionString, { directConnection: true })).connection;
    },
});
