import api from "@/services/api";
import { User } from "@/types";
import { ClasseSchoolYear, isCle, SENDINBLUE_TEMPLATES, YOUNG_PHASE, YOUNG_STATUS, YoungType } from "snu-lib";

export const getClasses = async (etablissementId: string) => {
  if (!etablissementId) return [];

  const query = {
    filters: {
      etablissementId: [etablissementId],
    },
    page: 0,
    size: 100,
  };

  const { responses } = await api.post(`/elasticsearch/cle/classe/search`, query);
  return responses[0].hits.hits
    .filter((hit) => hit._source.seatsTaken < hit._source.totalSeats && hit._source.schoolYear === ClasseSchoolYear.YEAR_2024_2025)
    .map((hit) => {
      const label = `${hit._source.uniqueKeyAndId} - ${hit._source.name ?? "(Nom à renseigner)"}`;
      return { value: hit._source, _id: hit._id, label, classe: { ...hit._source, _id: hit._id, label } };
    });
};

export const searchEtablissement = async (user: User, q?: string) => {
  if (!q) q = "Lycée";

  const query = {
    filters: {
      searchbar: [q],
      region: user.region ? [user.region] : [],
      department: user.department ? user.department : [],
    },
    sort: {
      filed: "name.keyword",
      order: "asc",
    },
    page: 0,
    size: 10,
  };

  const { responses } = await api.post(`/elasticsearch/cle/etablissement/search`, query);
  return responses[0].hits.hits.map((hit) => {
    const label = hit._source.name + (hit._source.city ? ` (${hit._source.city})` : "");
    return { value: hit._source, _id: hit._id, label, etablissement: { ...hit._source, _id: hit._id } };
  });
};

export async function updateYoung(youngId: string, payload: any): Promise<YoungType> {
  const { ok, data, code } = await api.put(`/referent/young/${youngId}`, payload);
  if (!ok) throw new Error(code);
  return data;
}

// TODO: move to api
export async function notifyYoungStatusChanged(young: YoungType, prevStatus: string) {
  const validationTemplate = isCle(young) ? SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED_CLE : SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED;

  if (young.status === YOUNG_STATUS.VALIDATED && young.phase === YOUNG_PHASE.INSCRIPTION) {
    if (prevStatus === "WITHDRAWN") await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_REACTIVATED}`);
    else await api.post(`/young/${young._id}/email/${validationTemplate}`);
  }
  if (young.status === YOUNG_STATUS.WAITING_LIST) {
    await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_LIST}`);
  }
}
