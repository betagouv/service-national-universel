import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { NotificationQueueType } from "@notification/infra/Notification";
import { QueueType } from "@shared/infra/Queue";

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    url: configService.getOrThrow("broker.url"),
                },
            }),
        }),
        BullModule.registerQueue({
            name: NotificationQueueType.EMAIL,
        }),
        BullModule.registerQueue({
            name: NotificationQueueType.CONTACT,
        }),
        BullModule.registerQueue({
            name: QueueType.ADMIN_TASK,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
