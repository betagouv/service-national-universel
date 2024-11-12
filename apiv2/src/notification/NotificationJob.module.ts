import configuration from "@config/configuration";
import { QueueModule } from "@infra/Queue.module";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ContactConsumer } from "./infra/email/Contact.consumer";
import { EmailConsumer } from "./infra/email/Email.consumer";
import { contactFactory, emailFactory } from "./infra/email/brevo/EmailContact.factory";

@Module({
    imports: [
        ConfigModule.forRoot({
            load: [configuration],
        }),
        QueueModule,
    ],
    providers: [Logger, EmailConsumer, ContactConsumer, emailFactory, contactFactory],
})
export class NotificationJobModule {}
