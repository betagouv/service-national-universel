import { ConfigService } from "@nestjs/config";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { Request } from "express";
import helmet = require("helmet");
import { AppModule } from "./App.module";
import { AuthProvider } from "./admin/infra/iam/auth/Auth.provider";
import { hostGuard, hotesAutorises } from "./infra/security/HostGuard";
import { RATE_LIMITS, estRouteCouteuse, rateLimitStoreFactory, rateLimiter } from "./infra/security/RateLimit";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    const config = app.get(ConfigService);

    // Avant les gardes : un 421 ou un 429 doit rester lisible par le navigateur.
    app.enableCors({
        origin: [config.getOrThrow("urls.admin"), config.getOrThrow("urls.app")],
    });
    // Requis pour que req.ip désigne le client réel (rate limiting, liste d'IP de Bull Board).
    app.set("trust proxy", config.getOrThrow("httpServer.trustProxyHops"));
    if (config.getOrThrow<boolean>("httpServer.enforceHost")) {
        app.use(
            hostGuard(hotesAutorises(config.getOrThrow("urls.apiv2"), config.get("httpServer.allowedHosts") ?? "")),
        );
    }
    // Bull Board sert une page dont le CSP par défaut de helmet bloquerait les ressources.
    const helmetApi = helmet();
    const helmetBullBoard = helmet({ contentSecurityPolicy: false });
    app.use((req, res, next) => (/\/queues(\/|$)/.test(req.path) ? helmetBullBoard : helmetApi)(req, res, next));

    const authProvider = app.get<AuthProvider>(AuthProvider, { strict: false });
    const store = rateLimitStoreFactory(config.getOrThrow("environment"), config.getOrThrow("broker.url"));
    // Clé de comptage : l'utilisateur si son jeton est valide (quota par personne, même derrière
    // une IP partagée), l'IP sinon. Le jeton est vérifié : un id forgé ne peut pas épuiser le
    // quota d'un autre.
    const cleUtilisateurOuIp = async (req: Request): Promise<string> => {
        const token = req.headers.authorization?.split(" ")?.[1];
        if (token) {
            try {
                const { id } = await authProvider.parseToken(token);
                if (id) {
                    return `user:${id}`;
                }
            } catch {
                // jeton invalide : compté sur l'IP
            }
        }
        return `ip:${req.ip}`;
    };
    app.use(rateLimiter({ store: store("global"), ...RATE_LIMITS.global, keyGenerator: cleUtilisateurOuIp }));
    app.use(
        rateLimiter({
            store: store("couteux"),
            ...RATE_LIMITS.couteux,
            keyGenerator: cleUtilisateurOuIp,
            skip: (req) => !estRouteCouteuse(req),
        }),
    );

    const port = config.getOrThrow("httpServer.port");
    if (config.getOrThrow("urls.apiv2").endsWith("/v2")) {
        app.setGlobalPrefix("v2", {
            exclude: [{ path: "/", method: RequestMethod.GET }],
        });
    }
    await app.listen(port);
}
bootstrap();
