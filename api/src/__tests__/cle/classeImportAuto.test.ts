import request from "supertest";
import { ROLES } from "snu-lib";
import { uploadFile } from "../../utils";
import { sendTemplate } from "../../brevo";
import { readCSVBuffer, XLSXToCSVBuffer } from "../../services/fileService";
import { updateClasseFromExport } from "../../cle/classe/importAuto/classeImportAutoService";
import getAppHelper from "../helpers/app";
import { dbClose, dbConnect } from "../helpers/db";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  uploadFile: jest.fn(),
}));

jest.mock("../../brevo", () => ({
  sendTemplate: jest.fn(),
}));

jest.mock("../../services/fileService", () => ({
  XLSXToCSVBuffer: jest.fn(),
  readCSVBuffer: jest.fn(),
}));

jest.mock("../../cle/classe/importAuto/classeImportAutoService", () => ({
  updateClasseFromExport: jest.fn(),
}));

describe("POST /classe-importAuto", () => {
  const xlsxMimetype = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  const fileContent = "sample file content";
  const fileBuffer = Buffer.from(fileContent);
  const mockParsedContent = [{ classeId: "mockClasseId", status: "ASSIGNED" }];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock file handling services
    (uploadFile as jest.Mock).mockResolvedValue({ location: "mockLocation" });
    (sendTemplate as jest.Mock).mockResolvedValue(true);
    (XLSXToCSVBuffer as jest.Mock).mockReturnValue(fileBuffer);
    (readCSVBuffer as jest.Mock).mockResolvedValue(mockParsedContent);
    (updateClasseFromExport as jest.Mock).mockResolvedValue(mockParsedContent);
  });

  it("should return 403 if the user does not have superadmin role", async () => {
    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post("/cle/classe/importAuto/classe-importAuto")
      .send({});

    expect(response.status).toBe(403);
  });
});
