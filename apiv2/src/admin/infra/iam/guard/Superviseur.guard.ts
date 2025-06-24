import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isSupervisor } from "snu-lib";

@Injectable()
export class SupervisorGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isSupervisor({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
