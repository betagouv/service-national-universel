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
            useFactory: (configService: ConfigService) => ({
                connection: {
                    url: configService.getOrThrow("broker.url"),
                },
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
