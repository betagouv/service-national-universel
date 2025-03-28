import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { DestinataireListeDiffusion } from "snu-lib";
import { FileGateway } from "@shared/core/File.gateway";
import { COLUMN_CSV_HEADERS, ColumnCsvName, ColumnType } from "../ListeDiffusion.model";
import { CampagneContactBuilderService } from "../service/CampagneContactBuilder.service";
import { CampagneDataFetcherService } from "../service/CampagneDataFetcher.service";
import { CampagneProcessorService } from "../service/CampagneProcessor.service";

@Injectable()
export class CreerListeDiffusion implements UseCase<string> {
    private readonly logger: Logger = new Logger(CreerListeDiffusion.name);

    constructor(
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        private readonly contactBuilderService: CampagneContactBuilderService,
        private readonly dataFetcherService: CampagneDataFetcherService,
        private readonly campaignProcessorService: CampagneProcessorService,
    ) {}

    async execute(campagneId: string): Promise<string> {
        const { destinataires, youngs } = await this.campaignProcessorService.validateAndProcessCampaign(campagneId);

        if (youngs.hits.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NO_CONTACTS);
        }

        const relatedData = await this.dataFetcherService.fetchRelatedData(youngs.hits);
        const contactsForListeDiffusion: ColumnCsvName[] = [];

        // Build contacts for youngs
        youngs.hits.forEach((young) => {
            const baseRow = this.contactBuilderService.buildYoungContactRow(
                young,
                relatedData.centres,
                relatedData.pointDeRassemblements,
                relatedData.lignes,
                relatedData.segmentDeLignes,
            );

            if (destinataires.includes(DestinataireListeDiffusion.JEUNES)) {
                contactsForListeDiffusion.push(baseRow);
            }

            if (destinataires.includes(DestinataireListeDiffusion.REPRESENTANTS_LEGAUX)) {
                contactsForListeDiffusion.push(
                    this.contactBuilderService.buildParentContactRow(baseRow, young, true),
                    this.contactBuilderService.buildParentContactRow(baseRow, young, false),
                );
            }
        });
        this.logger.log(
            `Jeunes : ${contactsForListeDiffusion.filter((contact) => contact.type === ColumnType.jeunes)?.length}`,
        );
        this.logger.log(
            `Representants legaux : ${contactsForListeDiffusion.filter(
                (contact) => contact.type === ColumnType.representants,
            )?.length}`,
        );

        // Build contacts for referents
        if (destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            this.logger.log(`Cas REFERENTS_CLASSES, campagne: ${campagneId}`);
            const referentsClasse = relatedData.referentsClasse.map((referent) => {
                const classe = relatedData.classes.find((classe) => classe.referentClasseIds.includes(referent.id));
                const young = youngs.hits.find((young) => young.classeId === classe?.id);
                if (young) {
                    const baseRow = this.contactBuilderService.buildYoungContactRow(
                        young,
                        relatedData.centres,
                        relatedData.pointDeRassemblements,
                        relatedData.lignes,
                        relatedData.segmentDeLignes,
                    );
                    return this.contactBuilderService.buildReferentContactRow(baseRow, referent, ColumnType.referents);
                }
                return this.contactBuilderService.buildReferentContactRow(
                    {} as ColumnCsvName,
                    referent,
                    ColumnType.referents,
                );
            });
            this.logger.log(`Referents classe: ${referentsClasse.length}`);

            contactsForListeDiffusion.push(...referentsClasse);
        }

        // Build contacts for establishment chiefs
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_ETABLISSEMENT)) {
            this.logger.log(`Cas CHEFS_ETABLISSEMENT, campagne: ${campagneId}`);
            const chefsEtablissement = relatedData.chefsEtablissement.map((chefEtablissement) => {
                const etablissement = relatedData.etablissements.find((etablissement) =>
                    etablissement.referentEtablissementIds.includes(chefEtablissement.id),
                );
                const classe = relatedData.classes.find((classe) => classe.etablissementId === etablissement?.id);
                const young = youngs.hits.find((young) => young.classeId === classe?.id);
                if (young) {
                    const baseRow = this.contactBuilderService.buildYoungContactRow(
                        young,
                        relatedData.centres,
                        relatedData.pointDeRassemblements,
                        relatedData.lignes,
                        relatedData.segmentDeLignes,
                    );
                    return this.contactBuilderService.buildChefEtablissementContactRow(baseRow, chefEtablissement);
                }
                return this.contactBuilderService.buildChefEtablissementContactRow(
                    {} as ColumnCsvName,
                    chefEtablissement,
                );
            });
            this.logger.log(`Chefs d'établissement: ${chefsEtablissement.length}`);

            contactsForListeDiffusion.push(...chefsEtablissement);
        }

        // Build contacts for center chiefs
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            this.logger.log(`Cas CHEFS_CENTRES, campagne: ${campagneId}`);
            const chefsDeCentre = relatedData.chefsDeCentre.map((chefDeCentre) => {
                const sejour = relatedData.sejours.find((sejour) => sejour.chefDeCentreReferentId === chefDeCentre.id);
                const classe = relatedData.classes.find((classe) => classe.sejourId === sejour?.id);
                const young = youngs.hits.find((young) => young.classeId === classe?.id);
                if (young) {
                    const baseRow = this.contactBuilderService.buildYoungContactRow(
                        young,
                        relatedData.centres,
                        relatedData.pointDeRassemblements,
                        relatedData.lignes,
                        relatedData.segmentDeLignes,
                    );
                    return this.contactBuilderService.buildChefCentreContactRow(baseRow, chefDeCentre);
                }
                return this.contactBuilderService.buildChefCentreContactRow({} as ColumnCsvName, chefDeCentre);
            });
            this.logger.log(`Chefs de centre: ${chefsDeCentre.length}`);
            contactsForListeDiffusion.push(...chefsDeCentre);
        }

        // Build contacts for CLE coordinators
        if (destinataires.includes(DestinataireListeDiffusion.COORDINATEURS_CLE)) {
            this.logger.log(`Cas COORDINATEURS_CLE, campagne: ${campagneId}`);
            const coordinateursCle = relatedData.coordinateursCle.map((coordinateurCle) => {
                const etablissement = relatedData.etablissements.find((etablissement) =>
                    etablissement.coordinateurIds.includes(coordinateurCle.id),
                );
                const classe = relatedData.classes.find((classe) => classe.etablissementId === etablissement?.id);
                const young = youngs.hits.find((young) => young.classeId === classe?.id);
                if (young) {
                    const baseRow = this.contactBuilderService.buildYoungContactRow(
                        young,
                        relatedData.centres,
                        relatedData.pointDeRassemblements,
                        relatedData.lignes,
                        relatedData.segmentDeLignes,
                    );
                    return this.contactBuilderService.buildCoordinateurCleContactRow(baseRow, coordinateurCle);
                }
                return this.contactBuilderService.buildCoordinateurCleContactRow({} as ColumnCsvName, coordinateurCle);
            });
            this.logger.log(`Coordinateurs CLE: ${coordinateursCle.length}`);
            contactsForListeDiffusion.push(...coordinateursCle);
        }

        if (contactsForListeDiffusion.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NO_CONTACTS);
        }
        return this.fileGateway.generateCSV(contactsForListeDiffusion, {
            headers: COLUMN_CSV_HEADERS,
            delimiter: ";",
        });
    }
}
