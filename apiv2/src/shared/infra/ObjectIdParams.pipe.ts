import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform, ValidationPipe } from "@nestjs/common";

/** `:id`, `:sessionId`, `:taskId`, `:centreId`… : tous désignent un document MongoDB. */
const PARAM_IDENTIFIANT = /^(id|[a-zA-Z]+Id)$/;
const OBJECT_ID = /^[0-9a-fA-F]{24}$/;

/**
 * Rejette en 400 un paramètre de route identifiant qui n'est pas un ObjectId.
 * Sans ce contrôle, `/v2/phase1/simulations/abc` levait un CastError mongoose : 500
 * et événement Sentry à la demande, pour n'importe quel utilisateur authentifié.
 */
@Injectable()
export class ObjectIdParamsPipe implements PipeTransform {
    transform(value: unknown, metadata: ArgumentMetadata) {
        if (metadata.type !== "param" || !metadata.data || !PARAM_IDENTIFIANT.test(metadata.data)) {
            return value;
        }
        // Pas `isValidObjectId` de mongoose : il accepte toute chaîne de 12 caractères.
        if (typeof value !== "string" || !OBJECT_ID.test(value)) {
            throw new BadRequestException(`Paramètre ${metadata.data} invalide`);
        }
        return value;
    }
}

/** Pipes appliqués à toutes les routes, partagés par le bootstrap et les applications de test. */
export const pipesGlobaux = () => [
    new ObjectIdParamsPipe(),
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
];
