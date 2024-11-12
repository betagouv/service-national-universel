import { DATABASE_CONNECTION } from "@infra/Database.provider";
import mongoose from "mongoose";
import { getSharedConnectionString, startMongodbTestContainer } from "./initMongoContainer";

export const testDatabaseProviders = (newContainer: boolean) => ({
    provide: DATABASE_CONNECTION,
    useFactory: async (): Promise<typeof mongoose> => {
        let connectionString = getSharedConnectionString();
        if (newContainer) {
            const mongodbContainer = await startMongodbTestContainer();
            connectionString = mongodbContainer.getConnectionString();
        }
        return mongoose.connect(connectionString, { directConnection: true });
    },
});
