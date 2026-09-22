import request from "supertest";

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

type Method = "get" | "post" | "put" | "delete";

async function callRoute(method: Method, path: string) {
  const agent = request(getAppHelper()) as any;
  return agent[method](path).send({});
}

describe("Routes CLE supprimées — chaîne d'inscription référent (H19, H20)", () => {
  const routes: [Method, string][] = [
    ["get", "/cle/referent-signup/token/abcdef"],
    ["put", "/cle/referent-signup/request-confirmation-email"],
    ["post", "/cle/referent-signup/confirm-email"],
    ["post", "/cle/referent-signup/confirm-signup"],
    ["post", "/cle/referent-signup/"],
  ];

  it.each(routes)("%s %s répond 404", async (method, path) => {
    const response = await callRoute(method, path);
    expect(response.status).toBe(404);
  });
});

describe("Routes CLE supprimées — administration des classes (H8, H10-H13)", () => {
  const routes: [Method, string][] = [
    ["post", "/cle/classe/5f1c5b0a0000000000000000/certificate/convocation"],
    ["post", "/cle/classe"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000/referent"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000/verify"],
    ["delete", "/cle/classe/5f1c5b0a0000000000000000"],
    ["get", "/cle/classe/5f1c5b0a0000000000000000/notifyRef"],
  ];

  it.each(routes)("%s %s répond 404", async (method, path) => {
    const response = await callRoute(method, path);
    expect(response.status).toBe(404);
  });
});

describe("Routes CLE de consultation — conservées pour le lot 1b", () => {
  // On interroge avec un identifiant INVALIDE : une route vivante répond 400 (validateId),
  // une route supprimée répond 404. Un ObjectId bien formé mais inexistant répondrait 404
  // sur une route vivante et rendrait le garde-fou faussement rouge.
  it("GET /cle/classe/:id est toujours montée", async () => {
    const response = await callRoute("get", "/cle/classe/identifiant-invalide");
    expect(response.status).toBe(400);
  });

  it("GET /cle/classe/from-etablissement/:id est toujours montée", async () => {
    const response = await callRoute("get", "/cle/classe/from-etablissement/identifiant-invalide");
    expect(response.status).toBe(400);
  });

  it("POST /cle/classe/export est toujours montée", async () => {
    const response = await callRoute("post", "/cle/classe/export");
    expect(response.status).not.toBe(404);
  });
});
