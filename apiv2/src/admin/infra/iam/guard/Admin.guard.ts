import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isAdmin } from "snu-lib";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        // if (isAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
        return true;
        // }

        // return false;
    }
}
