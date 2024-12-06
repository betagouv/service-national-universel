import "./instrument"; // first

import { ConfigService } from "@nestjs/config";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
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
    if (config.getOrThrow("environment") === "production") {
        app.setGlobalPrefix("v2", {
            exclude: [{ path: "/", method: RequestMethod.GET }],
        });
    }
    await app.listen(port);
}
bootstrap();
