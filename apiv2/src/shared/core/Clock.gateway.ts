export interface ClockGateway {
    addDaysToNow(days: number): Date;
    now(): Date;
}

export const ClockGateway = Symbol("ClockGateway");
