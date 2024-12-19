import { applyDecorators, Injectable, SetMetadata, UseGuards } from "@nestjs/common";
import { ExecutionContext, Type } from "@nestjs/common/interfaces";
import { CanActivate } from "@nestjs/common/interfaces/features/can-activate.interface";
import { ModuleRef, Reflector } from "@nestjs/core";

export const ANY_GUARD_KEY = "any_guard_key";

@Injectable()
export class AnyGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly moduleRef: ModuleRef,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const guards = this.reflector.get<Type<CanActivate>[]>(ANY_GUARD_KEY, context.getHandler());

        if (!guards) {
            return true;
        }

        const guardsInstances = guards.map((guard) => {
            const instance = this.moduleRef.get(guard, { strict: false });
            return instance;
        });

        for (const guard of guardsInstances) {
            try {
                if (await guard.canActivate(context)) {
                    return true;
                }
            } catch {}
        }

        return false;
    }
}

export function UseAnyGuard(...guards: Type<CanActivate>[]) {
    return applyDecorators(SetMetadata(ANY_GUARD_KEY, guards), UseGuards(AnyGuard));
}
