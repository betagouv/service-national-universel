export type RegionAcademiqueModel = {
  id: string;
  code: string;
  libelle: string;
  zone: string;
  dateDerniereModificationSI: Date;
};

export type ImportRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;
export type CreateRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;

export interface RegionAcademiqueRapport {}
export interface RegionAcademiqueImportRapport extends ImportRegionAcademiqueModel, RegionAcademiqueRapport {
    result: "success" | "error";
    error?: string;
    updated?: string;
}
