import configuration from "@config/configuration";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ContactConsumer } from "./infra/email/Contact.consumer";
import { EmailConsumer } from "./infra/email/Email.consumer";
import { contactFactory, emailFactory } from "./infra/email/brevo/EmailContact.factory";
import { FileGateway } from "@shared/core/File.gateway";
import { FileProvider } from "@shared/infra/File.provider";
import { NotificationModule } from "./Notification.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        NotificationModule,
    ],
    providers: [
        Logger,
        EmailConsumer,
        ContactConsumer,
        emailFactory,
        contactFactory,
        {
            provide: FileGateway,
            useClass: FileProvider,
        },
    ],
})
export class NotificationJobModule {
    constructor(private logger: Logger) {
        this.logger.log("NotificationJobModule has started", "NotificationJobModule");
    }
}
