import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { isSuperAdmin } from "snu-lib";

@Injectable()
export class BrevoIpGuard implements CanActivate {
    private readonly IP_PATTERN = /^1\.179\.(11[2-9]|12[0-7])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();

        if (isSuperAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        const clientIp = request.ip;
        if (!clientIp) {
            return false;
        }
        return this.IP_PATTERN.test(clientIp);
    }
}
