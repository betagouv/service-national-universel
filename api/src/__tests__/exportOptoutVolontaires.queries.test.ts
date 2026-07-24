import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel, ApplicationModel, MissionModel } from "../models";
import getNewMissionFixture from "./fixtures/mission";
import { findYoungsByEmails, findApplicationsByYoungIds, findMissionsByIds, findClassesByIds } from "../scripts/exportOptoutVolontaires.queries";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(dbClose);

describe("queries export opt-out (lecture seule)", () => {
  it("findYoungsByEmails matche par email normalisé et projette les champs voulus", async () => {
    const y = await YoungModel.create({ email: "Case@B.fr", firstName: "Léa", parent1Email: "p1@b.fr", lastName: "SECRET" });
    const res = await findYoungsByEmails(["case@b.fr"], 1000);
    expect(res).toHaveLength(1);
    expect(res[0].firstName).toBe("Léa");
    expect(res[0].parent1Email).toBeUndefined(); // parents non projetés (RGPD : représentants non exportés)
    expect(res[0].lastName).toBeUndefined(); // hors projection -> non lu
    await YoungModel.deleteOne({ _id: y._id });
  });

  it("findApplicationsByYoungIds retourne les candidatures liées", async () => {
    const y = await YoungModel.create({ email: "app@b.fr", firstName: "Tom" });
    const a = await ApplicationModel.create({ youngId: String(y._id), youngEmail: "app@b.fr", missionId: "MID1", status: "WAITING_VALIDATION" });
    const res = await findApplicationsByYoungIds([String(y._id)], 1000);
    expect(res.map((r: any) => r.missionId)).toContain("MID1");
    await ApplicationModel.deleteOne({ _id: a._id });
    await YoungModel.deleteOne({ _id: y._id });
  });

  // Régression : en prod, missionId/classeId/etablissementId/apiEngagementId sont typés String
  // et contiennent des valeurs non-ObjectId (legacy/JVA/vides). Sans garde-fou, un tel id dans un
  // `_id: { $in }` lève une CastError Mongoose qui rejette TOUTE la requête (crash phase B).
  it("findMissionsByIds ignore les ids non-ObjectId (garde-fou CastError) et conserve les valides", async () => {
    const m = await MissionModel.create({ ...getNewMissionFixture(), name: "Mission RO" });
    const res = await findMissionsByIds([String(m._id), "MID1", "", "not-an-objectid"], 1000);
    expect(res.map((r: any) => String(r._id))).toEqual([String(m._id)]);
    await MissionModel.deleteOne({ _id: m._id });
  });

  it("findClassesByIds ne lève pas sur des ids non-ObjectId (renvoie [])", async () => {
    await expect(findClassesByIds(["not-an-objectid", "MID1"], 1000)).resolves.toEqual([]);
  });
});
