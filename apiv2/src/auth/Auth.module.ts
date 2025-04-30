import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClsModule } from "nestjs-cls";

import { DatabaseModule } from "@infra/Database.module";
import { RoleGateway } from "./core/Role.gateway";
import { PermissionGateway } from "./core/Permission.gateway";
import { RoleRepository } from "./infra/repository/Role.repository";
import { PermissionRepository } from "./infra/repository/Permission.repository";
import { roleMongoProviders } from "./infra/provider/Role.provider";
import { permissionMongoProviders } from "./infra/provider/Permission.provider";
import { PermissionService } from "./core/Permission.service";

@Module({
    imports: [DatabaseModule, ConfigModule, ClsModule],
    providers: [
        Logger,
        PermissionService,
        { provide: RoleGateway, useClass: RoleRepository },
        { provide: PermissionGateway, useClass: PermissionRepository },
        ...roleMongoProviders,
        ...permissionMongoProviders,
    ],
    exports: [PermissionService, PermissionGateway, RoleGateway],
})
export class AuthModule {}
