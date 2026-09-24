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
        // L'admin s'authentifie par le cookie httpOnly `jwt_ref` (FM16) : sans credentials, le
        // navigateur ne l'enverrait pas. Le middleware ne le lit que pour l'origine admin.
        credentials: true,
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
