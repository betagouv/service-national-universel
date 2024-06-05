const request = require("supertest");
const getAppHelper = require("./helpers/app");
const { createClasse } = require("./helpers/classe");
const { ROLES } = require("snu-lib");
const passport = require("passport");
const { dbConnect, dbClose } = require("./helpers/db");
const { ObjectId } = require("mongoose").Types;

beforeAll(dbConnect);
afterAll(dbClose);

describe("DELETE /cle/classe/:id", () => {
  it("should return 400 when id is invalid", async () => {
    console.log("test");
    const res = await request(getAppHelper()).delete("/cle/classe/invalidId?type=delete");
    expect(res.status).toBe(400);
  });

  it("should return 400 when type is invalid", async () => {
    const classeId = new ObjectId();
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "invalidType" }).send();
    expect(res.status).toBe(400);
  });

  it("should return 403 when type is withdraw and user cannot withdraw classes", async () => {
    const classeId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 403 when type is delete and user cannot delete classes", async () => {
    const classeId = new ObjectId();
    passport.user.role = ROLES.RESPONSIBLE;
    const res = await request(getAppHelper()).delete(`/cle/classe/${classeId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(403);
    passport.user.role = ROLES.ADMIN;
  });

  it("should return 404 when class is not found", async () => {
    const nonExistingId = "104a49ba503555e4d8853003";
    const res = await request(getAppHelper()).delete(`/cle/classe/${nonExistingId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(404);
  });

  it("should return 200 when class is deleted successfully", async () => {
    const validId = (
      await createClasse({
        referentClasseIds: [],
        seatsTaken: 4,
        cohort: "CLE mai 2024",
        uniqueId: "1212",
        uniqueKey: "0720033V",
        etablissementId: "657994fb3562859787f6ff7b",
        status: "VALIDATED",
        statusPhase1: "WAITING_AFFECTATION",
        uniqueKeyAndId: "0720033V_1212",
        coloration: "SPORT",
        filiere: "Générale et technologique",
        grade: "4eme",
        name: "Douze",
        totalSeats: 4,
        department: "Sarthe",
        region: "Pays de la Loire",
      })
    )._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "delete" }).send();
    expect(res.status).toBe(200);
  });

  it("should return 200 when class is withdrawn successfully", async () => {
    const validId = (
      await createClasse({
        referentClasseIds: [],
        seatsTaken: 4,
        cohort: "CLE mai 2024",
        uniqueId: "1212",
        uniqueKey: "0720033V",
        etablissementId: "657994fb3562859787f6ff7b",
        status: "VALIDATED",
        statusPhase1: "WAITING_AFFECTATION",
        uniqueKeyAndId: "0720033V_1212",
        coloration: "SPORT",
        filiere: "Générale et technologique",
        grade: "4eme",
        name: "Douze",
        totalSeats: 4,
        department: "Sarthe",
        region: "Pays de la Loire",
      })
    )._id;
    const res = await request(getAppHelper()).delete(`/cle/classe/${validId}`).query({ type: "withdraw" }).send();
    expect(res.status).toBe(200);
  });
});
