import { Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { add } from "date-fns";

@Injectable()
export class ClockProvider implements ClockGateway {
    addDaysToNow(days: number): Date {
        return add(new Date(), { days });
    }
}
