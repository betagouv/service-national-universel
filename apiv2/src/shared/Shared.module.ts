import { Global, Logger, Module } from "@nestjs/common";
import { AllExceptionsFilter } from "./infra/AllExceptions.filter";
import { ClockGateway } from "./core/Clock.gateway";
import { ClockProvider } from "./infra/Clock.provider";

@Global()
@Module({
    providers: [
        AllExceptionsFilter,
        Logger,
        {
            provide: ClockGateway,
            useClass: ClockProvider,
        },
    ],
    exports: [AllExceptionsFilter, ClockGateway],
})
export class SharedModule {}
