import { EtablissementProviderDto } from "@/services/gouv.fr/etablissementType";
import { apiEducation } from "@/services/gouv.fr/api-education";

const getDataByUaisFromProvider = async (uais: string[]): Promise<Partial<EtablissementProviderDto>[]> => {
  const filters = [
    {
      key: "uai",
      value: uais,
    },
  ];
  // TODO : pagination vs export ?
  const data = await apiEducation({ filters, page: 0, size: 1000 });
  return data as EtablissementProviderDto[];
};
