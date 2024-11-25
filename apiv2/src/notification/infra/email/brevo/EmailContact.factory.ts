import { ConfigService } from "@nestjs/config";
import { EmailProvider } from "../Email.provider";
import { EmailBrevoProvider } from "./EmailBrevo.provider";
import { MockEmailBrevoProvider } from "./MockEmailBrevo.provider";
import { ContactProvider } from "../Contact.provider";
import { Logger } from "@nestjs/common";

export const emailFactory = {
    provide: EmailProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => customFactory(configService),
};

export const contactFactory = {
    provide: ContactProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => customFactory(configService),
};

const customFactory = (config: ConfigService) => {
    const emailProvider = config.getOrThrow("email.provider");
    Logger.log(`Provider used : ${emailProvider}`, "EmailContactFactory");
    if (emailProvider === "brevo") {
        return new EmailBrevoProvider(config);
    }
    if (emailProvider === "mock") {
        return new MockEmailBrevoProvider();
    }
    throw new Error("Invalid email provider");
};
