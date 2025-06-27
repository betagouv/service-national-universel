import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { MainJobModule } from "./MainJob.module";

async function bootstrap() {
    const app = await NestFactory.create(MainJobModule);
    const config = app.get(ConfigService);

    const port = config.getOrThrow("httpServer.port");

    await app.listen(port);
}
bootstrap();
