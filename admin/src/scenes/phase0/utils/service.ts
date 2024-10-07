import api from "@/services/api";
import { User } from "@/types";
import { STATUS_CLASSE } from "snu-lib";

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
    .filter((hit) => [STATUS_CLASSE.OPEN].includes(hit._source.status))
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
