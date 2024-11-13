// imports and applies the jest extensions
import "tsarch/dist/jest";

// imports the files entrypoint
import { FileConditionBuilder, filesOfProject } from "tsarch";
import { Folders } from "./folder";

describe("architecture", () => {
    let files: FileConditionBuilder;
    beforeAll(async () => {
        // console.log(__filename + "/tsconfig.json");
        // files = filesOfProject(__dirname + "/tsconfig.json");
        files = await filesOfProject("./tsconfig.json");
    });
    // architecture tests can take a while to finish
    jest.setTimeout(60000);

    it("business logic should not depend on infra folder", async () => {
        const rule = files.matchingPattern(Folders.CORE).shouldNot().dependOnFiles().matchingPattern(Folders.INFRA);
        await expect(rule).toPassAsync();
    });

    it.skip("business logic should exclusively depend on @notification, @shared, snu-lib, @nestjs/common", async () => {
        const rule = files
            .inFolder(Folders.SRC_CORE)
            .should()
            .dependOnFiles()
            .matchingPattern(`^(snu-lib|common|core)$`);
        // .matchingPattern("^(@notification|@shared|snu-lib|@nestjs/common|core)$");

        // console.log(files.matchingPattern(Folders.SRC_CORE_PATTERN));
        await expect(rule).toPassAsync();
    });

    it("business logic should be cycle free", async () => {
        const rule = files.inFolder(Folders.SRC).should().beFreeOfCycles();

        await expect(rule).toPassAsync();
    });
});
