export type BoxProps = {
    summary: {
        capacity: number;
        intradepartmental: number;
        intradepartmentalAssigned: number;
        centers: number;
        assigned: number;
        total: number;
        toRegions: Array<{ name: string; departments: Array<{name:string}> }>;
    };
    className?: string;
    loading?: boolean;
    };