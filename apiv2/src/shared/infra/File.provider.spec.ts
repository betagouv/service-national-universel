import { ConfigService } from "@nestjs/config";

import { FileProvider } from "./File.provider";

describe("FileProvider.generateCSV", () => {
    it("neutralise les cellules qu'un tableur lirait comme des formules (L36)", async () => {
        const provider = new FileProvider({} as ConfigService);
        const csv = await provider.generateCSV([{ nom: '=HYPERLINK("http://x")', prenom: "Jean", age: -2 }], {
            headers: true,
            delimiter: ";",
        });
        const [, ligne] = csv.split("\n");
        expect(ligne).toBe(`"'=HYPERLINK(""http://x"")";Jean;-2`);
    });
});
