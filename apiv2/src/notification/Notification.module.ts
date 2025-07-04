import { Logger, Module } from "@nestjs/common";
import { SharedModule } from "@shared/Shared.module";
import { ContactGateway } from "@admin/infra/iam/Contact.gateway";
import { NotificationGateway } from "./core/Notification.gateway";
import { ContactProducer } from "./infra/email/Contact.producer";
import { NotificationProducer } from "./infra/Notification.producer";

@Module({
    imports: [],
    providers: [
        {
            provide: NotificationGateway,
            useClass: NotificationProducer,
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
