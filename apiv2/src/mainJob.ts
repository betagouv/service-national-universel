import "./instrument"; // first

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NotificationJobModule } from "./notification/NotificationJob.module";
import { EmailConsumer } from "./notification/infra/email/Email.consumer";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(NotificationJobModule);
    const notificationConsumer = app.get(EmailConsumer);
    const logger = new Logger("bootstrap mainJob");
    Logger.log(`Job from class ${notificationConsumer.constructor?.name} started`, "bootstrap mainJob");
    // TODO: handle logs error here ?
    //     process.on("uncaughtException", (error) => {
    //         // Use same format as : AllExceptionsFilter.processLog
    //         logger.error(`UncaughtException: ${error.message}`, error.stack);
    //     });
}
bootstrap();
