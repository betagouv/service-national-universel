import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS, EXPORT_MODELS } from "../scripts/exportOptoutVolontaires.fields";

describe("exportOptoutVolontaires.fields", () => {
  it("couvre exactement les 7 modèles liés, sans area ni importplandetransport", () => {
    expect(EXPORT_MODELS).toEqual(["young", "application", "missionEquivalence", "mission", "etablissement", "classe", "missionAPI"]);
    expect(Object.keys(MODEL_FIELDS).sort()).toEqual([...EXPORT_MODELS].sort());
    expect(EXPORT_MODELS).not.toContain("area");
    expect(EXPORT_MODELS).not.toContain("importplandetransport");
  });

  it("a le bon nombre de champs par modèle (verrou dico sans lignes jaunes)", () => {
    expect(MODEL_FIELDS.young).toHaveLength(11);
    expect(MODEL_FIELDS.application).toHaveLength(17);
    expect(MODEL_FIELDS.missionEquivalence).toHaveLength(14);
    expect(MODEL_FIELDS.mission).toHaveLength(40);
    expect(MODEL_FIELDS.etablissement).toHaveLength(7);
    expect(MODEL_FIELDS.classe).toHaveLength(5);
    expect(MODEL_FIELDS.missionAPI).toHaveLength(26);
  });

  it("expose les 4 champs représentants légaux", () => {
    expect(YOUNG_REPRESENTATIVE_FIELDS).toEqual(["parent1Email", "parent1FirstName", "parent2Email", "parent2FirstName"]);
  });
});
