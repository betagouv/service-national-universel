import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { isSuperAdmin } from "snu-lib";

@Injectable()
export class SuperAdminGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isSuperAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
