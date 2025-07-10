export interface ClockGateway {
    addDaysToNow(days: number): Date;
    now(options?: { timeZone: string }): Date;
    getZonedDate(date: Date, timeZone?: string);
    isValidDate(date: Date): boolean;
    isValidDateFormat(date: string, format: string): boolean;
    formatShort(date: Date): string;
    formatDateTime(date: Date): string;
    formatSafeDateTime(date: Date): string;
    isAfter(dateA: Date, dateB: Date);
    isBefore(dateA: Date, dateB: Date);
    isWithinInterval(date: Date, params: { start: Date; end: Date });
    computeAge(dateNaissance: Date);
    addHours(date: Date, hours: number): Date;
    addDays(date: Date, days: number): Date;
    addMonths(date: Date, months: number): Date;
    endOfDay(date: Date): Date;
    startOfDay(date: Date): Date;
    parseDate(date: string, format: string): Date;
    parseDateNaissance(date: string): Date;
    isValidFrenchDate(date: string): boolean;
}

export const ClockGateway = Symbol("ClockGateway");
