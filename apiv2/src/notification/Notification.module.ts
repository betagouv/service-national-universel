import { QueueModule } from "@infra/Queue.module";
import { Logger, Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "@shared/infra/AllExceptions.filter";
import { SharedModule } from "@shared/Shared.module";
import { ContactGateway } from "@admin/infra/iam/Contact.gateway";
import { NotificationGateway } from "./core/Notification.gateway";
import { ContactProducer } from "./infra/email/Contact.producer";
import { NotificationProducer } from "./infra/Notification.producer";

@Module({
    imports: [SharedModule],
    providers: [
        {
            provide: NotificationGateway,
            useClass: NotificationProducer,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
        {
            provide: ContactGateway,
            useClass: ContactProducer,
        },
        Logger,
    ],
    exports: [NotificationGateway, ContactGateway],
})
export class NotificationModule {}
