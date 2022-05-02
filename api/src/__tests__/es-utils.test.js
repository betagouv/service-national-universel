const { validateEsQueryFromText } = require("../es/utils");
const fs = require("fs");

describe("validateEsQueryFromText", () => {
  describe("with all snapshots", () => {
    // List all snapshots in ./es-snapshots
    const snapshots = fs.readdirSync(__dirname + "/es-snapshots");
    for (const snapshot of snapshots) {
      const snapshotPath = __dirname + `/es-snapshots/${snapshot}`;
      it(`should work with ${snapshot}`, async () => {
        const snapshotContent = fs.readFileSync(snapshotPath, "utf-8");
        const result = validateEsQueryFromText(snapshotContent);
        expect(result).toEqual({});
      });
    }
  });
});
