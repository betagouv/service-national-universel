export enum MatchingPattern {
    CORE = "..core..",
    INFRA = "..infra..",
    GATEWAY_SUFFIX = ".gateway.ts",
    REPOSITORY_SUFFIX = ".repository.ts",
    CONTROLLER_SUFFIX = ".controller.ts",
    CONSUMER_SUFFIX = ".consumer.ts",
    PROVIDER_SUFFIX = ".provider.ts",
    FACTORY_SUFFIX = ".factory.ts",
    PRODUCER_SUFFIX = ".producer.ts",
    JOB_MODULE_SUFFIX = "Job.module.ts",

    ADMIN_CORE = "src.admin.core..",
    ADMIN_USECASE = "src.admin..core..useCase..",
    ADMIN_INFRA = "src.admin..infra..",
    ADMIN_REPOSITORY = "src.admin..infra..repository..",

    NOTIFICATION_CORE = "src.notification.core..",

    TASK_CORE = "..task.core..",
    SHARED_CORE = "..shared.core..",

    NESTJS_COMMON = "@nestjs.common",
    NESTJS_CONFIG = "@nestjs.config",
    NESTJS_TESTING = "@nestjs.testing",
    NESTJS_BULLMQ = "@nestjs.bullmq",

    SNU_LIB = "packages",
}
