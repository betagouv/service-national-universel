import { ModifierReferentClasse } from "@admin/core/sejours/cle/classe/useCase/modifierReferentClasse/ModifierReferentClasse";
import { SuperAdminGuard } from "@admin/infra/iam/guard/SuperAdmin.guard";
import { Body, Controller, Get, Logger, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { ClasseModel, ClasseWithReferentsModel } from "../../../../../core/sejours/cle/classe/Classe.model";
import { ClasseService } from "../../../../../core/sejours/cle/classe/Classe.service";
import { VerifierClasse } from "../../../../../core/sejours/cle/classe/useCase/VerifierClasse";
import { ClasseAdminCleGuard } from "../guard/ClasseAdminCle.guard";
import { CLASSE_IMPORT_EN_MASSE_COLUMNS, ClassesRoutes, MIME_TYPES, ModifierReferentDto } from "snu-lib";
import { InscriptionEnMasseValidationPayloadDto, ModifierReferentPayloadDto } from "./Classe.validation";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ValidationInscriptionEnMasseClasse } from "@admin/core/sejours/cle/classe/useCase/ValidationInscriptionEnMasseClasse";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("classe")
export class ClasseController {
    constructor(
        private readonly verifierClasse: VerifierClasse,
        private readonly classeService: ClasseService,
        private readonly modifierReferentClasse: ModifierReferentClasse,
        private readonly validationInscriptionEnMasseClasse: ValidationInscriptionEnMasseClasse,
    ) {}

    // TODO : remove after testing
    @Get("/")
    @UseGuards(SuperAdminGuard)
    findAll(): Promise<ClasseModel[]> {
        return this.classeService.findAll();
    }

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
        if (!file || !file.originalname || file.mimetype !== MIME_TYPES.EXCEL) {
            throw new FunctionalException(FunctionalExceptionCode.INVALID_FILE_FORMAT, "cannot read input file");
        }
        let decodedMapping;
        if (data.mapping) {
            decodedMapping = Object.keys(data.mapping).reduce((acc, key) => {
                acc[decodeURIComponent(key)] = decodeURIComponent(data.mapping[key]);
                return acc;
            }, {}) as any;

            Object.keys(decodedMapping).forEach((key) => {
                if (!Object.values(CLASSE_IMPORT_EN_MASSE_COLUMNS).includes(key as CLASSE_IMPORT_EN_MASSE_COLUMNS)) {
                    throw new FunctionalException(FunctionalExceptionCode.NOT_ENOUGH_DATA, key);
                }
            });
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
        @Param("id") classeId: string,
        @Body() mapping: Record<string, string> | null,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<any> {
        throw new FunctionalException(FunctionalExceptionCode.NOT_IMPLEMENTED_YET);
    }
}
