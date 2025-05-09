export interface FeatureFlagModel {
    name: string;
    description: string;
    enabled?: boolean;
    date?: {
        from?: Date;
        to?: Date;
    };
}
