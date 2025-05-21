import { Inject, Injectable } from "@nestjs/common";
import { FeatureFlagName } from "snu-lib";
import { ClockGateway } from "../Clock.gateway";
import { FeatureFlagGateway } from "./FeatureFlag.gateway";

@Injectable()
export class FeatureFlagService {
    constructor(
        @Inject(FeatureFlagGateway)
        private readonly featureFlagGateway: FeatureFlagGateway,
        @Inject(ClockGateway)
        private readonly clockGateway: ClockGateway,
    ) {}

    async isFeatureFlagEnabled(featureFlagName: FeatureFlagName): Promise<boolean> {
        const featureFlag = await this.featureFlagGateway.findByName(featureFlagName);
        const now = this.clockGateway.now();
        return (
            (featureFlag?.enabled ||
                (featureFlag?.date?.from &&
                    featureFlag?.date?.to &&
                    now >= featureFlag?.date?.from &&
                    now <= featureFlag?.date?.to)) === true
        );
    }
}
