const youngService = require("../young/young.service");
const classService = require("./classe.service");

const findYoungsByClasseIdSpy = jest.spyOn(youngService, "findYoungsByClasseId");
const generateConvocationsForMultipleYoungsSpy = jest.spyOn(youngService, "generateConvocationsForMultipleYoungs");

describe("ClasseService", () => {
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