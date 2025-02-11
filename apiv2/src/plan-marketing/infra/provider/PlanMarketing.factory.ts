import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";
import { PlanMarketingBrevoProvider } from "./PlanMarketingBrevo.provider";
import { PlanMarketingMockProvider } from "./PlanMarketingMock.provider";

export const planMarketingFactory = {
    provide: PlanMarketingGateway,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const provider = configService.get("email.provider");
        Logger.log(`Provider used : ${provider}`, "ListeDiffusionFactory");

        switch (provider) {
            case "brevo":
                return new PlanMarketingBrevoProvider(configService);
            case "mock":
            case "mailcatcher":
                return new PlanMarketingMockProvider();
            default:
                throw new Error("Invalid liste diffusion provider");
        }
    },
};
