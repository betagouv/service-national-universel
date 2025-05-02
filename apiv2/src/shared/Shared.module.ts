import { Global, Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AllExceptionsFilter } from "./infra/AllExceptions.filter";
import { ClockGateway } from "./core/Clock.gateway";
import { ClockProvider } from "./infra/Clock.provider";
import { FileProvider } from "./infra/File.provider";
import { FileController } from "./infra/File.controller";
import { FileGateway } from "./core/File.gateway";
import { DatabaseModule } from "@infra/Database.module";
import { CryptoGateway } from "./core/Crypto.gateway";
import { CryptoProvider } from "./infra/Crypto.provider";
import { FeatureFlagService } from "./core/featureFlag/FeatureFlag.Service";
import { featureFlagMongoProviders } from "./infra/featureFlag/FeatureFlag.provider";
import { FeatureFlagGateway } from "./core/featureFlag/FeatureFlag.gateway";
import { FeatureFlagMongoRepository } from "./infra/featureFlag/FeatureFlagMongo.repository";
@Global()
@Module({
    imports: [DatabaseModule, ConfigModule],
    providers: [
        AllExceptionsFilter,
        Logger,
        FileProvider,
        // TODO: à déplacer dans le module "file"
        {
            provide: FileGateway,
            useClass: FileProvider,
        },
        {
            provide: ClockGateway,
            useClass: ClockProvider,
        },
        {
            provide: CryptoGateway,
            useClass: CryptoProvider,
        },
        {
            provide: FeatureFlagGateway,
            useClass: FeatureFlagMongoRepository,
        },
        FeatureFlagService,
        ...featureFlagMongoProviders,
    ],
    controllers: [FileController],
    exports: [AllExceptionsFilter, ClockGateway, CryptoGateway],
})
export class SharedModule {}
