import * as youngService from "./young.service";

const mockBuffer = Buffer.from("pdf");

jest.mock("../templates/utils", () => ({
  ...jest.requireActual("../templates/utils"),
  getHtmlTemplate: jest.fn(),
}));

jest.mock("../document/document.service", () => ({
  ...jest.requireActual("../document/document.service"),
  generatePdf: async () => await mockBuffer,
  // generatePdf: jest.fn(),
}));

describe("YoungService", () => {
  it("should return the unique name", () => {
    const expectedUniqueName = "firstName-lastName-id";
    const uniqueName = youngService.buildUniqueName({ firstName: "firstName", lastName: "lastName", _id: "id" });
    expect(uniqueName).toBe(expectedUniqueName);
  });
  it("should return a buffer and unique name", async () => {
    const young = { firstName: "firstName", lastName: "lastName", _id: "id" };
    const expectedUniqueName = "firstName-lastName-id";
    // const expectedBuffer = Buffer.from("pdf");

    // const generatePdf = jest.fn().mockResolvedValue(mockBuffer);
    // const getHtmlTemplate = jest.fn().mockResolvedValue("html");

    const result = youngService.generateConvocationByYoung(young);
    await expect(result).resolves.toEqual({ buffer: mockBuffer, youngName: expectedUniqueName });
    // expect(generatePdf).toHaveBeenCalledTimes(1);
    // expect(getHtmlTemplate).toHaveBeenCalledTimes(1);
  });
});
