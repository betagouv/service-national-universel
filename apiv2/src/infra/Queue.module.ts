import { ConfigModule, ConfigService } from "@nestjs/config";

import { BullModule } from "@nestjs/bullmq";
import { Global, Module } from "@nestjs/common";
import { QueueName } from "@shared/infra/Queue";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";

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
        BullBoardModule.forRoot({
            route: "/queues",
            adapter: ExpressAdapter, // Or FastifyAdapter from `@bull-board/fastify`
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
        BullBoardModule.forFeature({
            name: QueueName.EMAIL,
            adapter: BullMQAdapter,
        }),
    ],
    exports: [BullModule],
})
export class QueueModule {}
