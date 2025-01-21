import { Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { add } from "date-fns";

@Injectable()
export class ClockProvider implements ClockGateway {
    getNowSafeIsoDate(): string {
        return `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;
    }
    addDaysToNow(days: number): Date {
        return add(new Date(), { days });
    }

    now() {
        return new Date();
    }
}
