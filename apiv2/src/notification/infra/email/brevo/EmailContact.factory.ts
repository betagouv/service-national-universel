import { ConfigService } from "@nestjs/config";
import { EmailProvider } from "../Email.provider";
import { EmailBrevoProvider } from "./EmailBrevo.provider";
import { EmailBrevoMockProvider } from "./EmailBrevoMock.provider";
import { ContactProvider } from "../Contact.provider";
import { Logger } from "@nestjs/common";
import { EmailBrevoCatcherProvider } from "./EmailBrevoCatcher.provider";
import { FileGateway } from "@shared/core/File.gateway";

export const emailFactory = {
    provide: EmailProvider,
    inject: [ConfigService, FileGateway],
    useFactory: (configService: ConfigService, fileGateway: FileGateway) => customFactory(configService, fileGateway),
};

export const contactFactory = {
    provide: ContactProvider,
    inject: [ConfigService],
    useFactory: (configService: ConfigService, fileGateway: FileGateway) => customFactory(configService, fileGateway),
};

const customFactory = (config: ConfigService, fileGateway: FileGateway) => {
    const emailProvider = config.getOrThrow("email.provider");
    Logger.log(`Provider used : ${emailProvider}`, "EmailContactFactory");
    if (emailProvider === "brevo") {
        return new EmailBrevoProvider(config, fileGateway);
    }
    if (emailProvider === "mock") {
        return new EmailBrevoMockProvider();
    }
    if (emailProvider === "mailcatcher") {
        return new EmailBrevoCatcherProvider(config, fileGateway);
    }
    throw new Error("Invalid email provider");
};
