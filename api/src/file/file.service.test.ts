import { buildZip } from "./file.service";

describe("FileService", () => {
  it("buildZip should return a buffer", async () => {
    const files = [
      {
        name: "file1",
        buffer: Buffer.from("pdf1"),
      },
      {
        name: "file2",
        buffer: Buffer.from("pdf2"),
      },
    ];
    const zipBuffer = Buffer.from("zip");

    const zipMock = jest.fn().mockReturnValue({
      addFile: jest.fn(),
      toBuffer: jest.fn().mockReturnValue(zipBuffer),
    });
    jest.mock("adm-zip", () => zipMock);

    const resultZip = buildZip(files);

    expect(Buffer.isBuffer(resultZip)).toBe(true);
  });
});
