import "./instrument"; // first

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App.module";
import { MainJobModule } from "./MainJob.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const config = app.get(ConfigService);
    app.enableCors({
        origin: [config.getOrThrow("urls.admin"), config.getOrThrow("urls.app")],
    });
    const port = config.getOrThrow("httpServer.port");
    if (config.getOrThrow("urls.apiv2").endsWith("/v2")) {
        app.setGlobalPrefix("v2");
    }
    await app.listen(port);

    await NestFactory.createApplicationContext(MainJobModule);
    Logger.log(`Job started`, "bootstrap mainJob");
}
bootstrap();
