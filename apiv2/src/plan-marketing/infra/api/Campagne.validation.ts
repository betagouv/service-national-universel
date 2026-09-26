import {
    CreateCampagneGeneriqueModel,
    CampagneGeneriqueModel,
    CreateCampagneSpecifiqueModelWithRef,
    CreateCampagneSpecifiqueModelWithoutRef,
    CampagneEnvoi,
} from "@plan-marketing/core/Campagne.model";
import { CampagneJeuneType, DestinataireListeDiffusion, PlanMarketingRoutes } from "snu-lib";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";
import { CampagneProgrammation } from "@plan-marketing/core/Programmation.model";
import { ParseBoolPipe, ValidationPipe } from "@nestjs/common";

class BaseCampagneDto {
    @IsString()
    @IsNotEmpty()
    nom: string;

    @IsString()
    @IsNotEmpty()
    objet: string;

    @IsString()
    @IsOptional()
    contexte?: string;

    @IsNumber()
    @IsNotEmpty()
    templateId: number;

    @IsString()
    @IsNotEmpty()
    listeDiffusionId: string;

    @IsNotEmpty()
    @IsArray()
    destinataires: DestinataireListeDiffusion[];

    @IsEnum(CampagneJeuneType)
    @IsNotEmpty()
    type: CampagneJeuneType;

    @IsBoolean()
    @IsNotEmpty()
    isProgrammationActive: boolean = false;

    @IsBoolean()
    @IsOptional()
    isArchived?: boolean = false;
}

export class CreateCampagneGeneriqueDto extends BaseCampagneDto implements CreateCampagneGeneriqueModel {
    @IsBoolean()
    @IsNotEmpty()
    generic: true = true;

    @IsArray()
    @IsNotEmpty()
    programmations: CampagneProgrammation[];
}

export class CreateCampagneSpecifiqueWithoutRefDto
    extends BaseCampagneDto
    implements CreateCampagneSpecifiqueModelWithoutRef
{
    @IsBoolean()
    @IsNotEmpty()
    generic: false = false;

    @IsString()
    @IsNotEmpty()
    cohortId: string;

    @IsArray()
    @IsNotEmpty()
    programmations: CampagneProgrammation[];
}

export class CreateCampagneSpecifiqueWithRefDto implements CreateCampagneSpecifiqueModelWithRef {
    @IsBoolean()
    @IsNotEmpty()
    generic: false = false;

    @IsString()
    @IsNotEmpty()
    cohortId: string;

    @IsString()
    @IsNotEmpty()
    campagneGeneriqueId: string;

    @IsBoolean()
    @IsNotEmpty()
    isProgrammationActive: boolean = false;

    // Non-optionnel en TS (le modèle `CreateCampagneSpecifiqueModelWithRef` exige
    // `programmations: CreateCampagneProgrammation[]`, sans `undefined`) : la valeur par défaut
    // couvre l'import d'une campagne générique dans une session, qui n'envoie jamais ce champ
    // (`toEntityCreate` de la branche "with-ref" l'ignore de toute façon, cf. Campagne.mapper.ts).
    @IsOptional()
    @IsArray()
    programmations: CampagneProgrammation[] = [];
}

export class UpdateCampagneGeneriqueDto
    extends CreateCampagneGeneriqueDto
    implements Omit<CampagneGeneriqueModel, "envois">
{
    @IsString()
    @IsNotEmpty()
    id: string;

    // Typés `Date` pour rester assignables à `CampagneGeneriqueModel` (implémenté ci-dessus), mais
    // ce que le front envoie réellement sur le fil est une chaîne ISO (JSON n'a pas de type Date) :
    // on valide donc avec `@IsString()`. Ni l'un ni l'autre champ n'est relu en aval
    // (`Campagne.mapper.ts#toEntity` a pour type de retour `Omit<CampagneType, "createdAt" | "updatedAt">`).
    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;

    @IsOptional()
    @IsArray()
    envois?: CampagneEnvoi[];
}

export class UpdateCampagneSpecifiqueWithoutRefDto extends CreateCampagneSpecifiqueWithoutRefDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    // Cf. UpdateCampagneGeneriqueDto ci-dessus : typés `Date` pour rester assignables à
    // `CampagneModel` (le contrôleur passe ce DTO à `mettreAJourCampagne.execute`), mais validés
    // comme chaîne (JSON n'a pas de type Date). Non relus en aval.
    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;

    @IsOptional()
    @IsArray()
    envois?: CampagneEnvoi[];
}

export class UpdateCampagneSpecifiqueWithRefDto extends CreateCampagneSpecifiqueWithRefDto {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsOptional()
    @IsString()
    createdAt?: Date;

    @IsOptional()
    @IsString()
    updatedAt?: Date;

    @IsOptional()
    @IsArray()
    envois?: CampagneEnvoi[];
}

export class EnvoyerCampagneDto {
    @IsBoolean()
    @IsOptional()
    isProgrammationActive?: boolean;
}

export type CreateCampagneDto =
    | CreateCampagneGeneriqueDto
    | CreateCampagneSpecifiqueWithoutRefDto
    | CreateCampagneSpecifiqueWithRefDto;
export type UpdateCampagneDto =
    | UpdateCampagneGeneriqueDto
    | UpdateCampagneSpecifiqueWithoutRefDto
    | UpdateCampagneSpecifiqueWithRefDto;

const pipeStrict = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

const estCorpsGenerique = (corps: Record<string, unknown>): boolean => corps.generic === true;
const aReferenceCampagneGenerique = (corps: Record<string, unknown>): boolean =>
    typeof corps.campagneGeneriqueId === "string" && corps.campagneGeneriqueId.length > 0;

/**
 * `CreateCampagneDto`/`UpdateCampagneDto` sont des unions de classes : TypeScript les réfléchit en
 * `Object` (`design:paramtypes`), donc le `ValidationPipe` global — basé sur ce métatype — ne les
 * valide jamais (GOO-90, même cause racine que PC1). On choisit la classe concrète à la main sur
 * le discriminant `generic`/`campagneGeneriqueId`, puis on rejoue une config stricte indépendante
 * du pipe global.
 */
export const validerCorpsCampagneCreation = (corps: unknown): Promise<CreateCampagneDto> => {
    const brut = (corps ?? {}) as Record<string, unknown>;
    const Classe = estCorpsGenerique(brut)
        ? CreateCampagneGeneriqueDto
        : aReferenceCampagneGenerique(brut)
          ? CreateCampagneSpecifiqueWithRefDto
          : CreateCampagneSpecifiqueWithoutRefDto;
    return pipeStrict.transform(corps, { type: "body", metatype: Classe }) as Promise<CreateCampagneDto>;
};

export const validerCorpsCampagneMiseAJour = (corps: unknown): Promise<UpdateCampagneDto> => {
    const brut = (corps ?? {}) as Record<string, unknown>;
    const Classe = estCorpsGenerique(brut)
        ? UpdateCampagneGeneriqueDto
        : aReferenceCampagneGenerique(brut)
          ? UpdateCampagneSpecifiqueWithRefDto
          : UpdateCampagneSpecifiqueWithoutRefDto;
    return pipeStrict.transform(corps, { type: "body", metatype: Classe }) as Promise<UpdateCampagneDto>;
};
