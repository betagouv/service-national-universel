import passport from "passport";
import request from "supertest";
import { dbConnect, dbClose } from "../../__tests__/helpers/db";
import getAppHelper from "../../__tests__/helpers/app";
import getNewLigneBusFixture from "../../__tests__/fixtures/PlanDeTransport/ligneBus";
import { LigneBusModel, PlanTransportModel } from "../../models";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(() => {
  jest.clearAllMocks();
});

const busFindById = jest.spyOn(LigneBusModel, "findById");
const pdtFindOne = jest.spyOn(PlanTransportModel, "findOne");

describe("ligneDeBusController", () => {
  it("should return updated mergedBusIds when adding merged line", async () => {
    jest.clearAllMocks();
    const user = { _id: "123", role: "admin" };
    const previous = passport.user;
    passport.user = user;
    const ligneBus = await LigneBusModel.create(
      getNewLigneBusFixture({
        busId: "line-1",
        cohort: "Février 2023 - C",
        mergedBusIds: ["line-1", "line-2"],
      }),
    );
    busFindById.mockResolvedValue(ligneBus);
    pdtFindOne.mockResolvedValue(true);
    const res = await request(getAppHelper()).post(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee`).send({
      mergedBusId: "line-3",
    });
    expect(busFindById).toHaveBeenCalledTimes(1);
    expect(pdtFindOne).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.mergedBusIds).toEqual(["line-1", "line-2", "line-3"]);
    passport.user = previous;
  });
  it("should return updated mergedBusIds when removing merged line", async () => {
    jest.clearAllMocks();
    const user = { _id: "123", role: "admin" };
    const previous = passport.user;
    passport.user = user;
    const ligneBus = await LigneBusModel.create(
      getNewLigneBusFixture({
        busId: "line-1",
        cohort: "Février 2023 - C",
        mergedBusIds: ["line-1", "line-2", "line-3"],
      }),
    );
    busFindById.mockResolvedValue(ligneBus);
    const res = await request(getAppHelper()).delete(`/ligne-de-bus/${ligneBus._id}/ligne-fusionnee/line-3`);
    expect(busFindById).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data.mergedBusIds).toEqual(["line-1", "line-2"]);
    passport.user = previous;
  });
});
