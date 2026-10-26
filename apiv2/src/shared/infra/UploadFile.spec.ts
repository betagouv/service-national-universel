import { MIME_TYPES } from "snu-lib";

import { isFileContentMatchingMimetype } from "./UploadFile";

describe("isFileContentMatchingMimetype", () => {
    const xlsx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("reste du zip")]);

    it("accepte un xlsx (archive zip)", () => {
        expect(isFileContentMatchingMimetype({ buffer: xlsx, mimetype: MIME_TYPES.EXCEL })).toBe(true);
    });

    it("refuse un faux xlsx", () => {
        expect(isFileContentMatchingMimetype({ buffer: Buffer.from("<html>"), mimetype: MIME_TYPES.EXCEL })).toBe(
            false,
        );
    });

    it("accepte un csv texte et refuse un contenu binaire déclaré csv", () => {
        expect(isFileContentMatchingMimetype({ buffer: Buffer.from("a;b\n1;2\n"), mimetype: MIME_TYPES.CSV })).toBe(
            true,
        );
        expect(
            isFileContentMatchingMimetype({ buffer: Buffer.from([0x61, 0x00, 0x62]), mimetype: MIME_TYPES.CSV }),
        ).toBe(false);
    });

    it("refuse un fichier vide ou d'un autre type", () => {
        expect(isFileContentMatchingMimetype({ buffer: Buffer.from(""), mimetype: MIME_TYPES.EXCEL })).toBe(false);
        expect(isFileContentMatchingMimetype({ buffer: Buffer.from("x"), mimetype: MIME_TYPES.PLAIN })).toBe(false);
    });
});
