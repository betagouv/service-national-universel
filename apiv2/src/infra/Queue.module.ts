import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { QueueName } from "@shared/infra/Queue";

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                connection: {
                    url: config.getOrThrow("broker.url"),
                },
                prefix: config.getOrThrow("broker.queuePrefix"),
                lockDuration: 1000 * 60 * 5, // 5 minutes
            }),
        }),
        BullModule.registerQueue({
            name: QueueName.EMAIL,
        }),
        BullModule.registerQueue({
            name: QueueName.CONTACT,
        }),
        BullModule.registerQueue({
            name: QueueName.ADMIN_TASK,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
