import { ROLES, UserDto } from "snu-lib";

import { buildMissionContext } from "../controllers/elasticsearch/utils";

/**
 * GOO-45 — la liste des missions d'un référent est bornée à son territoire, comme l'écriture
 * (`isMissionInUserScope`). Seule la recherche de missions à proposer à un volontaire reste nationale.
 */
describe("buildMissionContext — périmètre territorial des référents (GOO-45)", () => {
  const referentDepartemental = { _id: "6500000000000000000000d1", role: ROLES.REFERENT_DEPARTMENT, department: ["Hauts-de-Seine"], region: "Île-de-France" } as unknown as UserDto;
  const referentRegional = { _id: "6500000000000000000000d2", role: ROLES.REFERENT_REGION, department: [], region: "Île-de-France" } as unknown as UserDto;

  it("borne un référent départemental à ses départements", async () => {
    const { missionContextFilters, missionContextError } = await buildMissionContext(referentDepartemental);

    expect(missionContextError).toBeUndefined();
    expect(missionContextFilters).toContainEqual({ terms: { "department.keyword": ["Hauts-de-Seine"] } });
  });

  it("borne un référent régional à sa région", async () => {
    const { missionContextFilters, missionContextError } = await buildMissionContext(referentRegional);

    expect(missionContextError).toBeUndefined();
    expect(missionContextFilters).toContainEqual({ term: { "region.keyword": "Île-de-France" } });
  });

  it("refuse un référent départemental sans département", async () => {
    const { missionContextError } = await buildMissionContext({ ...referentDepartemental, department: [] } as unknown as UserDto);

    expect(missionContextError?.status).toEqual(403);
  });

  it("refuse un référent régional sans région", async () => {
    const { missionContextError } = await buildMissionContext({ ...referentRegional, region: "" } as unknown as UserDto);

    expect(missionContextError?.status).toEqual(403);
  });

  it("garde la recherche de missions à proposer nationale", async () => {
    const { missionContextFilters, missionContextError } = await buildMissionContext(referentDepartemental, { referentNationalScope: true });

    expect(missionContextError).toBeUndefined();
    expect(missionContextFilters).toEqual([]);
  });

  it("ne borne pas l'administrateur", async () => {
    const { missionContextFilters } = await buildMissionContext({ _id: "6500000000000000000000d3", role: ROLES.ADMIN } as unknown as UserDto);

    expect(missionContextFilters).toEqual([]);
  });
});
