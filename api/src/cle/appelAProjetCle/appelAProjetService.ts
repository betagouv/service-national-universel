import { getClassesAndEtablissementsFromAppelAProjets } from "../../providers/demarcheSimplifiee/demarcheSimplifieeProvider";
import { IReferent } from "../../models/referentType";
import { IEtablissement } from "../../models/cle/etablissementType";
import { IClasse } from "../../models/cle/classeType";
import { CleClasseModel, CleEtablissementModel, ReferentModel } from "../../models";
import { apiEducation } from "../../services/gouv.fr/api-education";
import { etablissementMapper } from "../etablissement/etablissementMapper";
import { buildUniqueClasseId, findClasseByUniqueKeyAndUniqueId } from "../classe/classeService";
import { IAppelAProjet } from "./appelAProjetType";
import { ROLES, SUB_ROLES, ClasseSchoolYear, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import { EtablissementProviderDto } from "../../services/gouv.fr/etablissementType";

export class AppelAProjetService {
  referentsToCreate: Partial<IReferent>[] = [];
  referentsAlreadyExisting: Partial<IReferent>[] = [];
  etablissementsToCreate: IEtablissement[] = [];
  etablissementsToUpdate: IEtablissement[] = [];
  etablissementsErrors: { error: string; uai?: string | null; email?: string | null }[] = [];
  classesToCreate: Partial<IClasse>[] = [];
  classesAlreadyExisting: Record<string, string | undefined>[] = [];

  public sync = async (save: boolean = false) => {
    const appelAProjets = await getClassesAndEtablissementsFromAppelAProjets();

    const uais = [...new Set(appelAProjets.map((AAP) => AAP.etablissement?.uai).filter(Boolean))];
    console.log("AppelAProjetService.sync() - uais.length: ", uais.length);
    const etablissements = await apiEducation({
      filters: [{ key: "uai", value: uais }],
      page: 0,
      size: -1,
    });

    for (const appelAProjet of appelAProjets) {
      let referentEtablissementId = await this.processReferentEtablissement(appelAProjet, save);
      let savedEtablissement = await this.processEtablissement(appelAProjet, etablissements, referentEtablissementId, save);
      if (!savedEtablissement) {
        continue;
      }
      let referentClasseId = await this.processReferentClasse(appelAProjet, referentEtablissementId, save);
      await this.processClasses(appelAProjet, savedEtablissement, referentClasseId, save);
    }
    return [
      { name: "etablissementsToCreate", data: this.etablissementsToCreate },
      { name: "etablissementsToUpdate", data: this.etablissementsToUpdate },
      { name: "etablissementsErrors", data: this.etablissementsErrors },
      { name: "classesAlreadyExisting", data: this.classesAlreadyExisting },
      { name: "classesToCreate", data: this.classesToCreate },
      { name: "referentsToCreate", data: this.referentsToCreate },
      { name: "referentsAlreadyExisting", data: this.referentsAlreadyExisting },
    ];
  };

  async processReferentEtablissement(appelAProjet: IAppelAProjet, save: boolean) {
    const referentEtablissement = await ReferentModel.findOne({ email: appelAProjet.referentEtablissement.email });
    let referentEtablissementId = referentEtablissement?.id;

    if (referentEtablissement) {
      this.referentsAlreadyExisting.push({ _id: referentEtablissement.id, email: referentEtablissement.email, role: referentEtablissement.role });
    } else {
      if (save) {
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // TODO : check if it should be ADMINISTRATEUR_CLE
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        const createdReferent = await ReferentModel.create({
          ...appelAProjet.referentEtablissement,
          role: ROLES.ADMINISTRATEUR_CLE,
          subRole: SUB_ROLES.referent_etablissement,
        });
        referentEtablissementId = createdReferent.id;
      }
      this.referentsToCreate.push({ ...appelAProjet.referentClasse, id: referentEtablissementId });
    }
    return referentEtablissementId;
  }

  async processEtablissement(appelAProjet: IAppelAProjet, etablissements: EtablissementProviderDto[], referentEtablissementId, save: boolean) {
    const uai = appelAProjet.etablissement?.uai;
    if (!uai) {
      this.etablissementsErrors.push({
        error: "No UAI provided",
        uai: null,
        email: appelAProjet.referentEtablissement.email,
      });
      return;
    }

    if ([...this.etablissementsToCreate, ...this.etablissementsToUpdate].map((etablissement) => etablissement.uai).includes(uai)) {
      this.etablissementsErrors.push({
        error: "UAI already processed",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.referentEtablissement.email,
      });
      return;
    }

    const etablissementFromAnnuaire = etablissements.find((etablissement) => etablissement.identifiant_de_l_etablissement === uai);

    if (!etablissementFromAnnuaire) {
      this.etablissementsErrors.push({
        error: "Etablissement not found",
        uai: appelAProjet.etablissement.uai,
        email: appelAProjet.referentEtablissement.email,
      });
      return;
    }

    const formattedEtablissement = etablissementMapper(etablissementFromAnnuaire, [referentEtablissementId]);

    // TODO: handle schoolYears array
    const foundEtablissement = await CleEtablissementModel.findOne({ uai });
    let savedEtablissement;
    if (foundEtablissement) {
      this.etablissementsToUpdate.push(formattedEtablissement);
      if (save) {
        const referentEtablissementIds = [...new Set([...foundEtablissement.referentEtablissementIds, referentEtablissementId])];
        savedEtablissement = await foundEtablissement.save({ ...foundEtablissement, ...formattedEtablissement, referentEtablissementIds: referentEtablissementIds });
      }
    } else {
      this.etablissementsToCreate.push(formattedEtablissement);
      if (save) {
        savedEtablissement = await CleEtablissementModel.create(formattedEtablissement);
      }
    }
    return savedEtablissement || formattedEtablissement;
  }

  async processReferentClasse(appelAProjet: IAppelAProjet, referentEtablissementId, save: boolean) {
    const referentClasse = await ReferentModel.findOne({ email: appelAProjet.referentClasse.email });
    let referentClasseId = referentEtablissementId;
    if (referentClasse) {
      this.referentsAlreadyExisting.push({ _id: referentClasse.id, email: referentClasse.email, role: referentClasse.role });
    } else {
      this.referentsToCreate.push(appelAProjet.referentClasse);
      if (save) {
        const createdReferent = await ReferentModel.create({ ...appelAProjet.referentClasse, role: ROLES.REFERENT_CLASSE });
        referentClasseId = createdReferent.id;
      }
    }
    return referentClasseId;
  }

  async processClasses(appelAProjet: IAppelAProjet, savedEtablissement: IEtablissement, referentClasseId, save: boolean) {
    const uniqueClasseId = buildUniqueClasseId(appelAProjet.etablissement, {
      name: appelAProjet.classe.name || "",
      coloration: appelAProjet.classe.coloration,
    });
    let formattedClasse: Partial<IClasse>;
    const classeFound = await findClasseByUniqueKeyAndUniqueId(appelAProjet.etablissement?.uai, uniqueClasseId);
    if (classeFound) {
      this.classesAlreadyExisting.push({
        "nom de la classe": classeFound?.name,
        "cle de la classe": classeFound?.uniqueKey,
        "id de la classe": classeFound?.uniqueId,
        "id technique de la classe existante": classeFound?._id,
        "raison ": "classe existe",
      });
    } else {
      formattedClasse = this.mapAppelAProjetToClasse(appelAProjet.classe, savedEtablissement, uniqueClasseId, [referentClasseId]);
      this.classesToCreate.push(formattedClasse);
      if (save) {
        await CleClasseModel.create(formattedClasse);
      }
    }
  }

  mapAppelAProjetToClasse = (classeFromAppelAProjet: IAppelAProjet["classe"], etablissement: IEtablissement, uniqueClasseId: string, referentClasseIds: string[]): IClasse => {
    return {
      academy: etablissement.academy,
      department: etablissement.department,
      region: etablissement.region,
      status: STATUS_CLASSE.CREATED,
      statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION,
      totalSeats: 0,
      name: classeFromAppelAProjet.name,
      coloration: classeFromAppelAProjet.coloration,
      uniqueId: uniqueClasseId,
      uniqueKey: etablissement.uai,
      uniqueKeyAndId: `${etablissement.uai}-${uniqueClasseId}`,
      schoolYear: ClasseSchoolYear.YEAR_2024_2025,
      referentClasseIds: referentClasseIds,
      etablissementId: etablissement._id!,
      cohort: "test_cohort",
      estimatedSeats: classeFromAppelAProjet.estimatedSeats,
    };
  };
}
