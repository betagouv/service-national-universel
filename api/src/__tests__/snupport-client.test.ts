jest.mock("node-fetch", () => jest.fn());

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SNUpport = require("../SNUpport");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeFetch = require("node-fetch");

describe("SNUpport.api", () => {
  beforeEach(() => jest.clearAllMocks());

  it.each([
    "/knowledge-base/../v0/ticket?email=victime@example.com",
    "/knowledge-base/public/search?search=x#fragment",
    "v0/ticket",
  ])("should refuse to call the support api with the forged path %s", async (path) => {
    await expect(SNUpport.api(path)).rejects.toThrow("chemin invalide");
    expect(nodeFetch).not.toHaveBeenCalled();
  });
});
