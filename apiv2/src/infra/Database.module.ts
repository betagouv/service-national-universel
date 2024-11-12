import { ConfigModule } from "@nestjs/config";
import { databaseProviders } from "./Database.provider";

import { Module } from "@nestjs/common";

@Module({
    imports: [ConfigModule],
    providers: databaseProviders,
    exports: databaseProviders,
})
export class DatabaseModule {}
