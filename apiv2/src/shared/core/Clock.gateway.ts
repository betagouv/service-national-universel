export interface ClockGateway {
    addDaysToNow(days: number): Date;
    now(): Date;
    getNowSafeIsoDate(): string;
    isValidDate(date: Date): boolean;
}

export const ClockGateway = Symbol("ClockGateway");
