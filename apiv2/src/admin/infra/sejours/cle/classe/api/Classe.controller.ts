import { ModifierReferentClasse } from "@admin/core/sejours/cle/classe/useCase/modifierReferentClasse/ModifierReferentClasse";
import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Post,
    Request,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { ClasseWithReferentsModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseService } from "../../../../../core/sejours/cle/classe/Classe.service";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";
import { ClassesRoutes, FeatureFlagName, MIME_TYPES, ModifierReferentDto } from "snu-lib";
import {
    InscriptionEnMasseImportPayloadDto,
    InscriptionEnMasseValidationPayloadDto,
    ModifierReferentPayloadDto,
} from "./Classe.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ValidationInscriptionEnMasseClasse } from "@admin/core/sejours/cle/classe/useCase/ValidationInscriptionEnMasseClasse";
import { FileInterceptor } from "@nestjs/platform-express";
import { FeatureFlagService } from "@shared/core/featureFlag/FeatureFlag.service";
import { ClasseImportService } from "@admin/core/sejours/cle/classe/importEnMasse/ClasseImportEnMasse.service";
import { CustomRequest } from "@shared/infra/CustomRequest";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { FileGateway } from "@shared/core/File.gateway";
import { TaskMapper } from "@task/infra/Task.mapper";
import { TaskModel } from "@task/core/Task.model";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly classeService: ClasseService,
        private readonly modifierReferentClasse: ModifierReferentClasse,
        private readonly validationInscriptionEnMasseClasse: ValidationInscriptionEnMasseClasse,
        private readonly featureFlagService: FeatureFlagService,
        private readonly classeImportService: ClasseImportService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
    ) {}

    @Post(":id/verify")
    @UseGuards(ClasseAdminCleGuard)
    verify(@Param("id") id: string): Promise<ClasseWithReferentsModel> {
        return this.verifierClasse.execute(id);
    }

    @Post(":id/referent/modifier-ou-creer")
    @UseGuards(ClasseAdminCleGuard)
    async modifierReferent(
        @Param("id") classeId: string,
        @Body() modifierReferentClasse: ModifierReferentPayloadDto,
    ): Promise<ModifierReferentDto> {
        const referent = await this.modifierReferentClasse.execute(classeId, modifierReferentClasse);
        return {
            id: referent.id,
            email: referent.email,
            prenom: referent.prenom,
            nom: referent.nom,
        };
    }

    @Post(":id/inscription-en-masse/valider")
    @UseGuards(ClasseAdminCleGuard)
    @UseInterceptors(FileInterceptor("file"))
    async inscriptionEnMasseValidate(
        @Param("id") classeId: string,
        @Body("data") data: InscriptionEnMasseValidationPayloadDto,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<ClassesRoutes["InscriptionEnMasseValider"]["response"]> {
        const isInscriptionEnMasseEnabled = await this.featureFlagService.isFeatureFlagEnabled(
            FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE,
        );
        if (!isInscriptionEnMasseEnabled) {
            throw new FunctionalException(
                FunctionalExceptionCode.FEATURE_FLAG_NOT_ENABLED,
                "Inscription en masse is not enabled",
            );
        }
        if (!file || !file.originalname || file.mimetype !== MIME_TYPES.EXCEL) {
            throw new FunctionalException(FunctionalExceptionCode.INVALID_FILE_FORMAT, "cannot read input file");
        }
        let decodedMapping;
        if (data && data.mapping) {
            // TODO : in a multipart form, utf-8 is not applied
            decodedMapping = Object.keys(data.mapping).reduce((acc, key) => {
                acc[decodeURIComponent(key)] = decodeURIComponent(data.mapping[key]);
                return acc;
            }, {}) as any;

            this.classeService.checkImportMapping(decodedMapping);
        }

        return this.validationInscriptionEnMasseClasse.execute(classeId, decodedMapping, {
            fileName: file.originalname,
            buffer: file.buffer,
            mimetype: file.mimetype,
        });
    }

    @Post(":id/inscription-en-masse/importer")
    @UseGuards(ClasseAdminCleGuard)
    async inscriptionEnMasseImport(
        @Request() request: CustomRequest,
        @Param("id") classeId: string,
        @Body() data: InscriptionEnMasseImportPayloadDto,
    ): Promise<ClassesRoutes["InscriptionEnMasseImporter"]["response"]> {
        if (data?.mapping) {
            this.classeService.checkImportMapping(data.mapping);
        }

        const fileExists = await this.fileGateway.remoteFileExists(data.fileKey);
        if (!fileExists) {
            throw new FunctionalException(FunctionalExceptionCode.FILE_NOT_FOUND, data.fileKey);
        }

        const auteur: Partial<ReferentModel> = {
            id: request.user.id,
            prenom: request.user.prenom,
            nom: request.user.nom,
            role: request.user.role,
            sousRole: request.user.sousRole,
            email: request.user.email,
        };

        const task = (await this.classeImportService.importClasse(
            classeId,
            data.mapping,
            data.fileKey,
            auteur,
        )) as TaskModel;
        return TaskMapper.toDto(task);
    }

    @Get(":id/inscription-en-masse")
    @UseGuards(ClasseAdminCleGuard)
    async inscriptionEnMasseStatus(
        @Param("id") classeId: string,
    ): Promise<ClassesRoutes["InscriptionEnMasseStatut"]["response"]> {
        const statut = await this.classeService.getStatusImportInscriptionEnMasse(classeId);
        return {
            status: statut.status,
            statusDate: statut.statusDate.toISOString(),
            lastCompletedAt: statut.lastCompletedAt?.toISOString(),
        };
    }
}
