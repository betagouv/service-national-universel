import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { NotificationQueueType } from "@notification/infra/Notification";

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
    ],
    exports: [BullModule],
})
export class QueueModule {}
