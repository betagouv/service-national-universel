import { ConfigService } from "@nestjs/config";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./App.module";
import { initializeSentry } from "./instrument";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const config = app.get(ConfigService);
    initializeSentry(config);
    app.enableCors({
        origin: [config.getOrThrow("urls.admin"), config.getOrThrow("urls.app")],
    });
    const port = config.getOrThrow("httpServer.port");
    if (config.getOrThrow("urls.apiv2").endsWith("/v2")) {
        app.setGlobalPrefix("v2", {
            exclude: [{ path: "/", method: RequestMethod.GET }],
        });
    }
    await app.listen(port);
}
bootstrap();
