import { DatabaseModule } from "@infra/Database.module"; // TO REMOVE ?
import { JwtAuthModule } from "@infra/JwtAuth.module";
import { ConfigModule } from "@nestjs/config";
// import { databaseProviders } from "@infra/Database.provider"; // TO REMOVE ?
import { BullModule } from "@nestjs/bullmq";
import { Logger, MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { ContactProducer } from "@notification/infra/email/Contact.producer";
import { NotificationQueueType } from "@notification/infra/Notification";
import { NotificationProducer } from "@notification/infra/Notification.producer";
import { NotificationModule } from "@notification/Notification.module";
import { ClsMiddleware, ClsModule } from "nestjs-cls";
import { SigninReferent } from "./core/iam/useCase/SigninReferent";
import { ClasseService } from "./core/sejours/cle/classe/Classe.service";
import { AuthController } from "./infra/iam/api/Auth.controller";
import { AddUserToRequestMiddleware } from "./infra/iam/auth/AddUserToRequest.middleware";
import { AuthProvider } from "./infra/iam/auth/Auth.provider";
import { JwtTokenService } from "./infra/iam/auth/JwtToken.service";
import { ContactGateway } from "./infra/iam/Contact.gateway";
import { referentMongoProviders } from "./infra/iam/provider/ReferentMongo.provider";
import { ClasseController } from "./infra/sejours/cle/classe/api/Classe.controller";
import { classeMongoProviders } from "./infra/sejours/cle/classe/provider/ClasseMongo.provider";
import { etablissementMongoProviders } from "./infra/sejours/cle/etablissement/provider/EtablissementMongo.provider";
import { gatewayProviders } from "./infra/sejours/cle/initProvider/gateway";
import { guardProviders } from "./infra/sejours/cle/initProvider/guard";
import { useCaseProvider as useCaseProviders } from "./infra/sejours/cle/initProvider/useCase";
import { TaskModule } from "@task/Task.module";
import { AdminTaskRepository } from "./infra/task/AdminTaskMongo.repository";
import { QueueType } from "@shared/infra/Queue";
import { taskMongoProviders } from "@task/infra/TaskMongo.provider";
import { AdminTaskController } from "./infra/task/api/AdminTask.controller";
import { QueueModule } from "@infra/Queue.module";
import { TaskGateway } from "@task/core/Task.gateway";

@Module({
    imports: [ClsModule.forRoot({}), DatabaseModule, JwtAuthModule, NotificationModule, QueueModule, TaskModule],
    controllers: [ClasseController, AuthController, AdminTaskController],
    providers: [
        ClasseService,
        { provide: AuthProvider, useClass: JwtTokenService },
        ...classeMongoProviders,
        ...referentMongoProviders,
        ...etablissementMongoProviders,
        ...guardProviders,
        ...taskMongoProviders,
        Logger,
        SigninReferent,
        { provide: NotificationGateway, useClass: NotificationProducer },
        { provide: ContactGateway, useClass: ContactProducer },
        { provide: TaskGateway, useClass: AdminTaskRepository },
        ...useCaseProviders,
        ...gatewayProviders,
    ],
})
export class AdminModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ClsMiddleware).forRoutes("*");
        consumer
            .apply(AddUserToRequestMiddleware)
            .exclude({ path: "/referent/signin", method: RequestMethod.POST })
            .exclude({ path: "/classe/public/:id", method: RequestMethod.GET })
            .forRoutes("*");
    }
}
