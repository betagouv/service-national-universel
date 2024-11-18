export interface ClockGateway {
    addDaysToNow(days: number): Date;
}

export const ClockGateway = Symbol("ClockGateway");
