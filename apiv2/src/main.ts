import "./instrument"; // first

import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());

    const configService = app.get(ConfigService);
    const port = configService.getOrThrow("httpServer.port");
    await app.listen(port);
}
bootstrap();
