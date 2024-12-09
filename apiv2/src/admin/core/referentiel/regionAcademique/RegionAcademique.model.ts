export type RegionAcademiqueModel = {
  id: string;
  code: string;
  libelle: string;
  zone: string;
  dateCreationSI: Date;
  dateDerniereModificationSI: Date;
};

export type CreateRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;
