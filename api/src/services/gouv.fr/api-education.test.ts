import { formatParams } from "./api-education";

describe("formatParams", () => {
  it("should format parameters correctly with no filters", () => {
    const result = formatParams([], 1, 10);
    expect(result).toBe("where=&limit=10&offset=10");
  });

  it("should handle single string filter value correctly", () => {
    const filters = [{ key: "uai", value: "12345" }];
    const result = formatParams(filters, 0, 5);
    expect(result).toContain("identifiant_de_l_etablissement%3D12345");
    expect(result).toContain("limit=5");
    expect(result).toContain("offset=0");
  });

  it("should handle array filter value correctly", () => {
    const filters = [{ key: "uai", value: ["12345", "67890"] }];
    const result = formatParams(filters, 2, 20);
    expect(result).toContain("identifiant_de_l_etablissement+IN+%28%2212345%22%2C%2267890%22%29");
    expect(result).toContain("limit=20");
    expect(result).toContain("offset=40");
  });

  it("should combine multiple filters correctly", () => {
    const filters = [
      { key: "uai", value: "12345" },
      { key: "name", value: "Some School" },
      { key: "city", value: "Some City" },
    ];
    const result = formatParams(filters, 1, 10);
    expect(result).toContain("identifiant_de_l_etablissement%3D12345");
    expect(result).toContain("nom_etablissement+LIKE+%22Some+School%22");
    expect(result).toContain("nom_commune+LIKE+%22Some+City");
    expect(result).toContain("limit=10");
    expect(result).toContain("offset=10");
  });

  it("should handle type filter with single type correctly", () => {
    const filters = [{ key: "type", value: "LYC" }];
    const result = formatParams(filters, 0, 5);
    expect(result).toContain("refine=type_etablissement%3A%22Lyc%C3%A9e%22");
  });

  it("should handle type filter with multiple types correctly", () => {
    const filters = [{ key: "type", value: ["LYC", "COL"] }];
    const result = formatParams(filters, 0, 5);
    expect(result).toContain("refine=type_etablissement%3A%22Lyc%C3%A9e%2");
    expect(result).toContain("refine=type_etablissement%3A%22Coll%C3%A8ge%22");
  });

  it("should default size to 20 if not provided", () => {
    const result = formatParams([], 1);
    expect(result).toContain("limit=20");
  });
});
