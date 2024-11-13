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

  it("should return 400 if the uploaded file is not an .xlsx", async () => {
    const invalidFileType = "text/plain";
    const requestBody = { files: { "file.txt": { mimetype: invalidFileType, tempFilePath: "/tmp/file.txt" } } };

    const response = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "god" }))
      .post("/cle/classe/importAuto/classe-importAuto")
      .send(requestBody);

    expect(response.status).toBe(400);
  });

  it("should return 403 if the user does not have superadmin role", async () => {
    const requestBody = { files: { "file.xlsx": { mimetype: xlsxMimetype, tempFilePath: "/tmp/file.xlsx" } } };

    const response = await request(getAppHelper({ role: ROLES.VISITOR }))
      .post("/cle/classe/importAuto/classe-importAuto")
      .send(requestBody);

    expect(response.status).toBe(403);
  });

  it("should return 200 and the base64-encoded CSV content when the request is successful", async () => {
    const mockUser = { role: ROLES.ADMIN, subRole: "god", firstName: "Admin", lastName: "User", email: "admin@example.com" };
    const requestBody = { files: { "file.xlsx": { mimetype: xlsxMimetype, tempFilePath: "/tmp/file.xlsx" } } };

    const response = await request(getAppHelper(mockUser)).post("/cle/classe/importAuto/classe-importAuto").send(requestBody);

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.mimeType).toBe("text/csv");
    expect(response.body.data).toEqual(expect.any(String));
    expect(response.body.fileName).toMatch(/-updated-classes.csv$/);

    // Verify upload, parsing, and email sending were called
    expect(uploadFile).toHaveBeenCalled();
    expect(readCSVBuffer).toHaveBeenCalledWith(fileBuffer);
    expect(sendTemplate).toHaveBeenCalledWith(expect.anything(), {
      emailTo: [{ name: `${mockUser.firstName} ${mockUser.lastName}`, email: mockUser.email }],
      attachment: [{ content: response.body.data, name: response.body.fileName }],
    });
  });
});
