import "./instrument"; // first

import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const config = app.get(ConfigService);
    app.enableCors({
        origin: [config.getOrThrow("urls.admin"), config.getOrThrow("urls.app")],
    });
    const port = config.getOrThrow("httpServer.port");
    if (process.env.ENVIRONMENT === "production") {
        app.setGlobalPrefix("v2");
    }
    await app.listen(port);
}
bootstrap();
