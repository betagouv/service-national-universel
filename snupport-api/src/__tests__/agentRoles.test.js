const fs = require("fs");
const path = require("path");

const MODELS_DIR = path.join(__dirname, "..", "models");
const modelFiles = fs
  .readdirSync(MODELS_DIR)
  .filter((f) => f.endsWith(".js"))
  .sort();

function enumPaths(schema, prefix = "") {
  return Object.keys(schema.paths).flatMap((key) => {
    const type = schema.path(key);
    const here = type.enumValues && type.enumValues.length ? [[`${prefix}${key}`, type.enumValues]] : [];
    return type.schema ? [...here, ...enumPaths(type.schema, `${prefix}${key}.`)] : here;
  });
}

describe("agent roles", () => {
  it("declares the four remaining roles on the agent model", () => {
    const AgentModel = require("../models/agent");
    expect(AgentModel.schema.path("role").enumValues).toEqual(["AGENT", "REFERENT_DEPARTMENT", "REFERENT_REGION", "DG"]);
  });

  // Le rôle ADMIN a été supprimé du produit : il n'ouvrait aucun droit nulle part et
  // faisait planter GET /agent. Aucun schéma ne doit plus l'accepter, y compris un
  // modèle ajouté plus tard qui recopierait l'ancienne liste.
  it.each(modelFiles)("has no ADMIN value in any enum of %s", (file) => {
    const model = require(path.join(MODELS_DIR, file));
    const offenders = enumPaths(model.schema).filter(([, values]) => values.includes("ADMIN"));
    expect(offenders).toEqual([]);
  });
});
