import * as youngService from "./young.service";
import { generatePdf } from "../document/document.service";
import { generateConvocationsForMultipleYoungs } from "./young.service";

const mockBuffer = Buffer.from("pdf");
const { getHtmlTemplate } = require("../templates/utils.js");

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("../templates/utils", () => ({
  ...jest.requireActual("../templates/utils"),
  getHtmlTemplate: jest.fn(),
}));
// const generatePdfMock = jest.fn(async () => mockBuffer);
jest.mock("../document/document.service", () => ({
  ...jest.requireActual("../document/document.service"),
  generatePdf: jest
    .fn()
    .mockImplementationOnce(async () => mockBuffer)
    .mockImplementationOnce(async () => {
      throw new Error("Mock error");
    }),
}));

describe("YoungService", () => {
  it("should return the unique name", () => {
    const expectedUniqueName = "firstName-lastName-id";
    const uniqueName = youngService.buildUniqueName({ firstName: "firstName", lastName: "lastName", _id: "id" });
    expect(uniqueName).toBe(expectedUniqueName);
  });

  it("should return one buffer and one unique name for 1 young", async () => {
    const young = buildYoung();
    const expectedUniqueName = buildUniqueName(young);

    const youngPdfCreated = youngService.generateConvocationByYoung(young);

    await expect(youngPdfCreated).resolves.toEqual({ buffer: mockBuffer, youngName: expectedUniqueName });
    expect(generatePdf).toHaveBeenCalledTimes(1);
    expect(getHtmlTemplate).toHaveBeenCalledTimes(1);
  });

  it("should return one buffer and one unique name for 2 youngs", async () => {
    // jest.mock("../document/document.service", () => ({
    //   ...jest.requireActual("../document/document.service"),
    //   generatePdf: jest
    //     .fn()
    //     .mockImplementationOnce(async () => mockBuffer)
    //     .mockImplementationOnce(async () => {
    //       throw new Error("Mock error");
    //     }),
    // }));
    const young1 = buildYoung("id_2");
    const expectedUniqueName1 = buildUniqueName(young1);

    const young2 = buildYoung("id_2");
    const expectedUniqueName2 = buildUniqueName(young2);

    const youngsPdfCreated = youngService.generateConvocationsForMultipleYoungs([young1, young2]);

    await expect(youngsPdfCreated).resolves.toEqual([
      {
        buffer: mockBuffer,
        youngName: expectedUniqueName1,
      },
      {
        buffer: mockBuffer,
        youngName: expectedUniqueName2,
      },
    ]);
    expect(generatePdf).toHaveBeenCalledTimes(2);
    expect(getHtmlTemplate).toHaveBeenCalledTimes(2);
  });
});

const buildYoung = (id = "id") => ({ firstName: "firstName", lastName: "lastName", _id: id });
const buildUniqueName = (young) => `${young.firstName}-${young.lastName}-${young._id}`;
