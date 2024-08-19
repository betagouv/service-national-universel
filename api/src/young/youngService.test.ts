import * as youngService from "./youngService";
// import * as documentService from "../document/document.service";
import { generatePdfIntoBuffer } from "../utils/pdf-renderer";

const mockBuffer = Buffer.from("pdf");

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock("../utils/pdf-renderer", () => ({
  ...jest.requireActual("../utils/pdf-renderer"),
  generatePdfIntoBuffer: jest.fn().mockReturnValue(Buffer.from("pdf")),
}));

describe("YoungService", () => {
  it("should return one PDF for 2 youngs", async () => {
    jest.restoreAllMocks();
    const young1 = buildYoung("id_1");
    const young2 = buildYoung("id_2");

    const youngsPdfCreated = await youngService.generateConvocationsForMultipleYoungs([young1, young2]);

    expect(youngsPdfCreated).toEqual(mockBuffer);
    expect(generatePdfIntoBuffer).toHaveBeenCalledTimes(1);
  });
});

const buildYoung = (id = "id") => ({ firstName: "firstName", lastName: "lastName", _id: id });
