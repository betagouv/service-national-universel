import "./instrument"; // first

import { NestFactory } from "@nestjs/core";
import { NotificationJobModule } from "./notification/NotificationJob.module";
import { Logger } from "@nestjs/common";
import { AdminJobModule } from "./admin/AdminJob.module";

async function bootstrap() {
    await NestFactory.createApplicationContext(NotificationJobModule);
    await NestFactory.createApplicationContext(AdminJobModule);
    Logger.log(`Job started`, "bootstrap mainJob");
    // TODO: handle logs error here ?
    //     process.on("uncaughtException", (error) => {
    //         // Use same format as : AllExceptionsFilter.processLog
    //         logger.error(`UncaughtException: ${error.message}`, error.stack);
    //     });
}
bootstrap();
