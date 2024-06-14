import { EtablissementProviderDto } from "@/services/gouv.fr/etablissementType";
import { apiEducation } from "@/services/gouv.fr/api-education";

const getEtablissementByUaiFromProvider = async (uai: string): Promise<Partial<EtablissementProviderDto>> => {
  const data = await getEtablissementByUaisFromProvider([uai]);
  return data[0];
};

const getEtablissementByUaisFromProvider = async (uais: string[]): Promise<Partial<EtablissementProviderDto>[]> => {
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
