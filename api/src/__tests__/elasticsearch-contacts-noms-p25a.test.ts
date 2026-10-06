import request from "supertest";
import { Types } from "mongoose";
import { ROLES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";

/**
 * Décommissionnement P25a : la consultation CLE et phase 1 ne renvoie plus que les noms des
 * référents de classe, chefs d'établissement, coordinateurs et chefs de centre (ni email,
 * ni téléphone). Les recherches d'admin et de référents continuent de renvoyer les mêmes lignes.
 */

jest.setTimeout(60000);

const store: { docs: Record<string, any[]>; msearchHits: Record<string, any[]> } = { docs: {}, msearchHits: {} };

jest.mock("../es", () => {
  const hitsOf = (docs: any[]) => ({ total: { value: docs.length, relation: "eq" }, hits: docs.map(({ _id, ...source }) => ({ _id, _index: "x", _source: source })) });
  return {
    msearch: jest.fn(async (params: any) => {
      const lines = String(params.body).trim().split("\n");
      const index = JSON.parse(lines[0]).index;
      const hits = store.msearchHits[index] || [];
      return {
        body: {
          responses: [
            { hits: { total: { value: hits.length, relation: "eq" }, hits: JSON.parse(JSON.stringify(hits)) }, status: 200 },
            { hits: { total: { value: 0 }, hits: [] }, aggregations: {}, status: 200 },
          ],
        },
      };
    }),
    search: jest.fn(async (params: any) => ({ body: { _scroll_id: "s", hits: hitsOf(JSON.parse(JSON.stringify(store.docs[params.index] || []))), aggregations: { group_by_etablissement: { buckets: [] } } } })),
    scroll: jest.fn(async () => ({ body: { _scroll_id: null, hits: { total: { value: 0 }, hits: [] } } })),
    clearScroll: jest.fn(async () => ({ body: {} })),
  };
});
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn(), initSentry: jest.fn(), capture404: jest.fn() }));

const referent = (overrides: any) => getAppHelper({ ...getNewReferentFixture(), _id: new Types.ObjectId(), ...overrides } as any);
const ACTORS: Array<[string, () => any]> = [
  ["ADMIN", () => referent({ role: ROLES.ADMIN })],
  ["REFERENT_REGION", () => referent({ role: ROLES.REFERENT_REGION, region: "Bretagne", department: [] })],
  ["REFERENT_DEPARTMENT", () => referent({ role: ROLES.REFERENT_DEPARTMENT, region: "Bretagne", department: ["Finistère"] })],
];
const actor = (label: string) => ACTORS.find(([l]) => l === label)![1]();
const LABELS = ACTORS.map(([l]) => l);

const CONTACT = { phone: "0612345678", email: "contact@example.org" };
const idRefClasse = new Types.ObjectId().toString();
const idRefEtab = new Types.ObjectId().toString();
const idCoord = new Types.ObjectId().toString();
const idHeadCenter = new Types.ObjectId().toString();
const person = (_id: string, firstName: string, lastName: string) => ({ _id, firstName, lastName, ...CONTACT, invitationToken: "", role: ROLES.REFERENT_CLASSE });

function expectNamesOnly(contacts: any[], expected: Array<{ _id: string; firstName: string; lastName: string }>) {
  expect(contacts).toHaveLength(expected.length);
  for (const [i, e] of expected.entries()) {
    expect(contacts[i]).toMatchObject({ _id: e._id, firstName: e.firstName, lastName: e.lastName });
    expect(Object.keys(contacts[i]).sort()).toEqual(expect.not.arrayContaining(["email", "phone"]));
    expect(JSON.stringify(contacts[i])).not.toContain(CONTACT.email);
    expect(JSON.stringify(contacts[i])).not.toContain(CONTACT.phone);
  }
}

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  await dbClose();
});
beforeEach(() => {
  resetAppAuth();
  store.docs = {
    referent: [person(idRefClasse, "Claire", "Classe"), person(idRefEtab, "Eric", "Etab"), person(idCoord, "Coralie", "Coord"), person(idHeadCenter, "Hugo", "Centre")],
    etablissement: [{ _id: new Types.ObjectId().toString(), name: "Collège", referentEtablissementIds: [idRefEtab], coordinateurIds: [idCoord] }],
  };
  store.docs.classe = [{ _id: "classe1", name: "3A", etablissementId: store.docs.etablissement[0]._id, referentClasseIds: [idRefClasse], status: "OPEN" }];
  store.msearchHits = {
    classe: [{ _id: "classe1", _source: { name: "3A", referentClasseIds: [idRefClasse], status: "OPEN" } }],
    etablissement: [{ _id: "etab1", _source: { name: "Collège", referentEtablissementIds: [idRefEtab], coordinateurIds: [idCoord] } }],
    sessionphase1: [{ _id: "session1", _source: { name: "Session", headCenterId: idHeadCenter } }],
  };
});

describe.each(LABELS)("P25a : contacts réduits aux noms pour %s", (label) => {
  it("classe : needRefInfo (recherche) ne renvoie que les noms du référent de classe", async () => {
    const res = await request(actor(label)).post("/elasticsearch/cle/classe/search?needRefInfo=true").send({ filters: {} });
    expect(res.status).toBe(200);
    expect(res.body.responses[0].hits.hits).toHaveLength(1);
    expect(res.body.responses[0].hits.hits[0]._source.name).toBe("3A");
    expectNamesOnly(res.body.responses[0].hits.hits[0]._source.referents, [{ _id: idRefClasse, firstName: "Claire", lastName: "Classe" }]);
  });

  it("classe : l'export ne renvoie que les noms des référents de classe, chefs d'établissement et coordinateurs", async () => {
    const res = await request(actor(label)).post("/elasticsearch/cle/classe/export").send({ filters: {} });
    expect(res.status).toBe(200);
    const [classe] = res.body.data;
    expect(classe.name).toBe("3A");
    expectNamesOnly(classe.referents, [{ _id: idRefClasse, firstName: "Claire", lastName: "Classe" }]);
    expectNamesOnly(classe.referentEtablissement, [{ _id: idRefEtab, firstName: "Eric", lastName: "Etab" }]);
    expectNamesOnly(classe.coordinateurs, [{ _id: idCoord, firstName: "Coralie", lastName: "Coord" }]);
  });

  it("établissement : l'export ne renvoie que les noms des chefs d'établissement et coordinateurs", async () => {
    store.docs.etablissement[0].referentEtablissementIds = [idRefEtab];
    const res = await request(actor(label)).post("/elasticsearch/cle/etablissement/export?needReferentInfo=true").send({ filters: {} });
    expect(res.status).toBe(200);
    const [etablissement] = res.body.data;
    expect(etablissement.name).toBe("Collège");
    expectNamesOnly(etablissement.referentEtablissement, [{ _id: idRefEtab, firstName: "Eric", lastName: "Etab" }]);
    expectNamesOnly(etablissement.coordinateurs, [{ _id: idCoord, firstName: "Coralie", lastName: "Coord" }]);
  });

  it("session de phase 1 : needHeadCenterInfo ne renvoie que le nom du chef de centre", async () => {
    const res = await request(actor(label)).post("/elasticsearch/sessionphase1/search?needHeadCenterInfo=true").send({ filters: {} });
    expect(res.status).toBe(200);
    const [hit] = res.body.responses[0].hits.hits;
    expect(hit._source.name).toBe("Session");
    expectNamesOnly([hit._source.headCenter], [{ _id: idHeadCenter, firstName: "Hugo", lastName: "Centre" }]);
  });
});
