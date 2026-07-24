import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel, ApplicationModel } from "../models";
import { findYoungsByEmails, findApplicationsByYoungIds } from "../scripts/exportOptoutVolontaires.queries";

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
    expect(res[0].parent1Email).toBe("p1@b.fr");
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
});
