import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isAdmin, isAdminCle } from "snu-lib";

@Injectable()
export class AdminCleGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isAdminCle({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
