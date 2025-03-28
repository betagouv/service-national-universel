import { Inject, Injectable } from "@nestjs/common";
import { YoungType } from "snu-lib";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";

@Injectable()
export class CampagneDataFetcherService {
    constructor(
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(CentreGateway) private readonly centreGateway: CentreGateway,
        @Inject(SegmentDeLigneGateway) private readonly segmentDeLigneGateway: SegmentDeLigneGateway,
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
    ) {}

    async fetchRelatedData(youngs: YoungType[]) {
        const classeIds = new Set<string>();
        const meetingPointIds = new Set<string>();
        const cohesionCenterIds = new Set<string>();
        const ligneIds = new Set<string>();

        for (const young of youngs) {
            if (young.classeId) classeIds.add(young.classeId);
            if (young.meetingPointId) meetingPointIds.add(young.meetingPointId);
            if (young.ligneId) ligneIds.add(young.ligneId);
            if (young.cohesionCenterId) cohesionCenterIds.add(young.cohesionCenterId);
        }
        const classes = (await this.classeGateway.findByIds([...classeIds])) || [];
        const referentClasseIds = await this.classeGateway.findReferentIdsByClasseIds([...classeIds]);
        const referentsClasse = await this.referentGateway.findByIds(referentClasseIds);

        // Fetch establishment data
        const etablissementIds = new Set<string>();
        for (const classe of classes) {
            etablissementIds.add(classe.etablissementId);
        }
        const etablissements = (await this.etablissementGateway.findByIds([...etablissementIds])) || [];

        // Fetch establishment referents
        const chefEtablissementIds = new Set<string>();
        const coordinateurCleIds = new Set<string>();
        for (const etablissement of etablissements) {
            etablissement.referentEtablissementIds.forEach((id) => chefEtablissementIds.add(id));
            if (etablissement.coordinateurIds) {
                etablissement.coordinateurIds.forEach((id) => coordinateurCleIds.add(id));
            }
        }
        const chefsEtablissement = (await this.referentGateway.findByIds([...chefEtablissementIds])) || [];
        const coordinateursCle = (await this.referentGateway.findByIds([...coordinateurCleIds])) || [];

        // Fetch center data
        const sejourIds = new Set<string>();
        for (const classe of classes) {
            if (classe.sejourId) sejourIds.add(classe.sejourId);
        }
        const sejours = (await this.sejourGateway.findByIds([...sejourIds])) || [];

        // Fetch center chiefs
        const chefDeCentreIds = new Set<string>();
        for (const sejour of sejours) {
            if (sejour.chefDeCentreReferentId) chefDeCentreIds.add(sejour.chefDeCentreReferentId);
        }
        const chefsDeCentre = (await this.referentGateway.findByIds([...chefDeCentreIds])) || [];

        // Fetch other related data
        const pointDeRassemblements = await this.pointDeRassemblementGateway.findByIds([...meetingPointIds]);
        const lignes = await this.ligneDeBusGateway.findByIds([...ligneIds]);
        const centres = await this.centreGateway.findByIds([...cohesionCenterIds]);
        const segmentDeLignes = await this.segmentDeLigneGateway.findByLigneDeBusIds([...ligneIds]);

        return {
            classes,
            referentsClasse,
            etablissements,
            chefsEtablissement,
            coordinateursCle,
            sejours,
            chefsDeCentre,
            pointDeRassemblements,
            lignes,
            centres,
            segmentDeLignes,
        };
    }
}
