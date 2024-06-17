import { buildDemarcheSimplifieeBody } from "./demarcheSimplifieeQueryBuilder";

describe("buildDemarcheSimplifieeBody", () => {
  it("should return a valid DemarcheSimplifieeQueryBuilder object", () => {
    const demarcheNumber = 123;
    const result = buildDemarcheSimplifieeBody(demarcheNumber);
    expect(result).toHaveProperty("operationName", "getDemarche");
    expect(result).toHaveProperty("query");
    expect(result).toHaveProperty("variables");
  });
});
