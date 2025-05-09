import { FeatureFlagName } from "snu-lib";
import { FeatureFlagModel } from "./FeatureFlag.model";
export interface FeatureFlagGateway {
    findAll(): Promise<FeatureFlagModel[]>;
    findById(id: string): Promise<FeatureFlagModel | null>;
    findByName(name: FeatureFlagName): Promise<FeatureFlagModel | null>;
}

export const FeatureFlagGateway = Symbol("FeatureFlagGateway");
