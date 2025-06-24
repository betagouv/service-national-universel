import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { isResponsible } from "snu-lib";

@Injectable()
export class ResponsableGuard implements CanActivate {
    constructor() {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // TODO : request.user mapping
        if (isResponsible({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        return false;
    }
}
