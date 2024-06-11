import passport from "passport";
import request from "supertest";

import { dbConnect, dbClose } from "../__tests__/helpers/db";
import getAppHelper from "../__tests__/helpers/app";
import getNewLigneBusFixture from "../__tests__/fixtures/PlanDeTransport/ligneBus";
import { LigneBusModel } from "../models";
import { BusDocument } from "../models/PlanDeTransport/ligneBus.type";

beforeAll(dbConnect);
afterAll(dbClose);
afterEach(() => {
  jest.clearAllMocks();
});

const busFindOne = jest.spyOn(LigneBusModel, "findOne");

describe("pdtController", () => {
  it("should return ligne de bus from pdt for cohort", async () => {
    jest.clearAllMocks();
    const user = { _id: "123", role: "admin" };
    const previous = passport.user;
    passport.user = user;
    const ligneBus = (await LigneBusModel.create(getNewLigneBusFixture())) as BusDocument;

    busFindOne.mockResolvedValue({ _id: ligneBus._id });

    const res = await request(getAppHelper()).get(`/plan-de-transport/${ligneBus.cohort}/ligne-de-bus/${ligneBus.busId}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    passport.user = previous;
  });
});
