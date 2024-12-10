export type RegionAcademiqueModel = {
  id: string;
  code: string;
  libelle: string;
  zone: string;
  dateDerniereModificationSI: Date;
};

export type CreateRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;
