import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { parseursSansDecompression } from "./infra/security/ParseursCorps";
import { MainJobModule } from "./MainJob.module";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(MainJobModule, { bodyParser: false });
    parseursSansDecompression(app);
    const config = app.get(ConfigService);

    const port = config.getOrThrow("httpServer.port");

    await app.listen(port);
}
bootstrap();
