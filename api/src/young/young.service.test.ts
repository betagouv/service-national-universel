import * as youngService from "./young.service";
import * as documentService from "../document/document.service";

const { getHtmlTemplate } = require("../templates/utils.js");

const mockBuffer = Buffer.from("pdf");

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("../templates/utils", () => ({
  ...jest.requireActual("../templates/utils"),
  getHtmlTemplate: jest.fn().mockReturnValue("html"),
}));

describe("YoungService", () => {
  it("should return the unique name", () => {
    const expectedUniqueName = "firstName-lastName-id";
    const uniqueName = youngService.buildUniqueName({ firstName: "firstName", lastName: "lastName", _id: "id" });
    expect(uniqueName).toBe(expectedUniqueName);
  });

  it("should return one PDF for 1 young", async () => {
    const young = buildYoung();
    const expectedUniqueName = buildUniqueName(young);

    const generatePdfSpy = jest.spyOn(documentService, "generatePdf").mockResolvedValue(mockBuffer);

    const youngPdfCreated = await youngService.generateConvocationByYoung(young);

    expect(youngPdfCreated).toEqual({ buffer: mockBuffer, youngName: expectedUniqueName });
    expect(generatePdfSpy).toHaveBeenCalledTimes(1);
    expect(getHtmlTemplate).toHaveBeenCalledTimes(1);

    generatePdfSpy.mockReset();
  });

  it("should return one PDF for 2 youngs", async () => {
    jest.restoreAllMocks();
    const young1 = buildYoung("id_1");
    const expectedUniqueName1 = buildUniqueName(young1);
    const young2 = buildYoung("id_2");

    const generatePdfSpy = jest
      .spyOn(documentService, "generatePdf")
      .mockResolvedValueOnce(mockBuffer)
      .mockRejectedValue(() => {
        throw "Pdf error";
      });

    const youngsPdfCreated = await youngService.generateConvocationsForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toHaveLength(1);
    expect(youngsPdfCreated).toEqual([
      {
        buffer: mockBuffer,
        youngName: expectedUniqueName1,
      },
    ]);
    expect(generatePdfSpy).toHaveBeenCalledTimes(2);
    expect(getHtmlTemplate).toHaveBeenCalledTimes(2);
  });
});

const buildYoung = (id = "id") => ({ firstName: "firstName", lastName: "lastName", _id: id });
const buildUniqueName = (young) => `${young.firstName}-${young.lastName}-${young._id}`;
