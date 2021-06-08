require("dotenv").config({ path: "./.env-testing" });
const regeneratorRuntime = require("regenerator-runtime");
const faker = require("faker");
const request = require("supertest");
const mongoose = require("mongoose");
const { MONGO_URL } = require("../config");

const getAppHelper = require("./helpers/app");
jest.setTimeout(20_000);

const { youngFixture } = require("./fixtures/young");

const { getYoungsHelper, getYoungByEmailHelper, deleteYoungByEmailHelper, createYoungHelper } = require("./helpers/young");

const { getReferentsHelper, getReferentByEmailHelper, deleteReferentByEmailHelper, createReferentHelper } = require("./helpers/referent");

let db;

beforeAll(async () => {
  await mongoose.connect(MONGO_URL, { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.Promise = global.Promise; //Get the default connection
  db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => console.log("CONNECTED OK"));
  console.log(MONGO_URL);
});

afterAll(async () => {
  db.close();
});

describe("As Referent", () => {
  it("POST /referent/signup_invite/admin", async () => {
    const referentsBefore = await getReferentsHelper();
    const fakeEmail = faker.internet.email();
    const post = await request(getAppHelper()).post("/referent/signup_invite/admin").send({
      email: fakeEmail,
    });
    expect(post.statusCode).toEqual(200);
    const referentsAfter = await getReferentsHelper();
    expect(referentsAfter.length).toEqual(referentsBefore.length + 1);
    await deleteReferentByEmailHelper(fakeEmail);
  });

  it("GET /referent", async () => {
    const res = await request(getAppHelper()).get("/referent").send();
    expect(res.statusCode).toEqual(200);
  });

  it("POST /referent/young", async () => {
    const youngsBefore = await getYoungsHelper();
    const res = await request(getAppHelper()).post("/referent/young/").send(youngFixture);
    expect(res.statusCode).toEqual(200);
    const young = await getYoungByEmailHelper(youngFixture.email);
    expect(young.firstName).toEqual(youngFixture.firstName);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length + 1);
    await deleteYoungByEmailHelper(youngFixture.email);
  });

  it("PUT /referent/young/:id", async () => {
    await createYoungHelper(youngFixture);
    let young = await getYoungByEmailHelper(youngFixture.email);
    const fakeFirstName = faker.name.findName();
    const put = await request(getAppHelper()).put(`/referent/young/${young._id}`).send({
      firstName: fakeFirstName,
    });
    young = await getYoungByEmailHelper(youngFixture.email);
    expect(put.statusCode).toEqual(200);
    expect(young.firstName).toEqual(fakeFirstName);
    await deleteYoungByEmailHelper(youngFixture.email);
  });

  it("DELETE /young/:id", async () => {
    await createYoungHelper(youngFixture);
    const youngsBefore = await getYoungsHelper();
    const young = await getYoungByEmailHelper(youngFixture.email);
    const res = await request(getAppHelper()).delete(`/young/${young._id}`);
    expect(res.statusCode).toEqual(200);
    const youngsAfter = await getYoungsHelper();
    expect(youngsAfter.length).toEqual(youngsBefore.length - 1);
  });
});

describe("Young", () => {});
