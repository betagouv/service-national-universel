import { ConfigService } from "@nestjs/config";
import mongoose from "mongoose";

export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export const databaseProviders = [
    {
        inject: [ConfigService],
        provide: DATABASE_CONNECTION,
        useFactory: async (config: ConfigService): Promise<typeof mongoose> => {
            mongoose.set("transactionAsyncLocalStorage", true);
            return await mongoose.connect(config.getOrThrow("database.url"));
        },
    },
];
