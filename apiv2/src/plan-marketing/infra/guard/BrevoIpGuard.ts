import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { isSuperAdmin } from "snu-lib";

@Injectable()
export class BrevoIpGuard implements CanActivate {
    private readonly IP_PATTERN = /^1\.179\.(11[2-9]|12[0-7])\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])$/;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<CustomRequest>();

        if (request.user?.role && isSuperAdmin({ role: request.user.role, subRole: request.user.sousRole })) {
            return true;
        }

        const clientIp = this.getClientIp(request);
        if (!clientIp) {
            return false;
        }
        return this.IP_PATTERN.test(clientIp);
    }

    private getClientIp(request: CustomRequest): string | undefined {
        const forwardedFor = request.headers["x-forwarded-for"];
        if (forwardedFor) {
            const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(",")[0].trim();

            return ips;
        }
        return request.ip;
    }
}
