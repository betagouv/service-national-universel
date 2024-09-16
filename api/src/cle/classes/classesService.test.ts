import { updateReferentsForMultipleClasses } from "./classesService";
import { ClasseModel, ReferentModel } from "../../models";
import { ERRORS, UserDto } from "snu-lib";
import * as classeService from "../classe/classeService";

describe("updateReferentsForMultipleClasses", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should update referents for multiple classes", async () => {
    const referentsClassesToUpdate = [{ idClasse: "1", email: "new@email.com", lastName: "Last", firstName: "First" }];
    const user = {} as UserDto;

    jest.spyOn(ClasseModel, "findById").mockResolvedValue({ referentClasseIds: ["oldId"] });
    jest.spyOn(ReferentModel, "findById").mockResolvedValueOnce({ email: "old@email.com", lastName: "Old", firstName: "Old" });
    jest.spyOn(ReferentModel, "findById").mockResolvedValueOnce({ email: "new@email.com", lastName: "Last", firstName: "First" });
    jest.spyOn(classeService, "updateReferentByClasseId").mockResolvedValue({} as any);

    const result = await updateReferentsForMultipleClasses(referentsClassesToUpdate, user);

    expect(result).toEqual([
      {
        idClasse: "1",
        previousReferent: { email: "old@email.com", lastName: "Old", firstName: "Old" },
        updatedReferentClasse: { email: "new@email.com", lastName: "Last", firstName: "First" },
      },
    ]);
  });

  it("should handle errors when the classe is not found", async () => {
    // Mock the data
    const referentsClassesToUpdate = [{ idClasse: "nonexistent", email: "new@email.com", lastName: "Last", firstName: "First" }];
    const user = {} as UserDto;

    jest.spyOn(ClasseModel, "findById").mockResolvedValue(null);

    const result = await updateReferentsForMultipleClasses(referentsClassesToUpdate, user);

    expect(result).toEqual([
      {
        idClasse: "nonexistent",
        error: ERRORS.CLASSE_NOT_FOUND,
      },
    ]);

    expect(ClasseModel.findById).toHaveBeenCalledWith("nonexistent");
  });
});
