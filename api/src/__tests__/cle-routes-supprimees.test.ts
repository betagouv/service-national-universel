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
