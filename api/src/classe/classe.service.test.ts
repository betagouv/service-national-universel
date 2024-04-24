const youngService = require("../young/young.service");
const classService = require("./classe.service");
const { FUNCTIONAL_ERRORS } = require("snu-lib");

const findYoungsByClasseIdSpy = jest.spyOn(youngService, "findYoungsByClasseId");
const generateConvocationsForMultipleYoungsSpy = jest.spyOn(youngService, "generateConvocationsForMultipleYoungs");

describe("ClasseService", () => {
  it("should throw an error", async () => {
    findYoungsByClasseIdSpy.mockReturnValue(Promise.resolve(new Array(51).fill({})));

    try {
      const resultPdf = await classService.generateConvocationsByClasseId("classeId");
      expect(findYoungsByClasseIdSpy).toHaveBeenCalledTimes(1);

      await expect(resultPdf).rejects.toThrow(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
    } catch (error) {
      expect(error).toEqual(new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE));
    }
    findYoungsByClasseIdSpy.mockReset();
  });

  it("should return a pdf", async () => {
    const youngBuffer = Buffer.from("pdf");

    findYoungsByClasseIdSpy.mockReturnValue(Promise.resolve(new Array(50).fill({})));
    generateConvocationsForMultipleYoungsSpy.mockReturnValue(Promise.resolve(youngBuffer));

    const resultPdf = await classService.generateConvocationsByClasseId("classeId");

    expect(findYoungsByClasseIdSpy).toHaveBeenCalledTimes(1);
    expect(generateConvocationsForMultipleYoungsSpy).toHaveBeenCalledTimes(1);
    expect(resultPdf).toEqual(youngBuffer);
  });
});
