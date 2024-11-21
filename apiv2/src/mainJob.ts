import "./instrument"; // first

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MainJobModule } from "./MainJob.module";

async function bootstrap() {
    await NestFactory.createApplicationContext(MainJobModule);
    Logger.log(`Job started`, "bootstrap mainJob");
    // TODO: handle logs error here ?
    //     process.on("uncaughtException", (error) => {
    //         // Use same format as : AllExceptionsFilter.processLog
    //         logger.error(`UncaughtException: ${error.message}`, error.stack);
    //     });
}
bootstrap();
