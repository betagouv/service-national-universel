import { updateReferentsForMultipleClasses, getClassesByIds } from "./classesService";
import { ClasseModel, ReferentModel } from "../../models";
import { ERRORS, UserDto } from "snu-lib";
import * as classeService from "../classe/classeService";

describe("updateReferentsForMultipleClasses", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  it("should update referents for multiple classes", async () => {
    const referentsClassesToUpdate = [{ classeId: "1", email: "new@email.com", lastName: "Last", firstName: "First" }];
    const user = {} as UserDto;

    jest.spyOn(ClasseModel, "findById").mockResolvedValue({ referentClasseIds: ["oldId"] });
    jest.spyOn(ReferentModel, "findById").mockResolvedValueOnce({ email: "old@email.com", lastName: "Old", firstName: "Old" });
    jest.spyOn(ReferentModel, "findById").mockResolvedValueOnce({ email: "new@email.com", lastName: "Last", firstName: "First" });
    jest.spyOn(classeService, "updateReferentByClasseId").mockResolvedValue({} as any);

    const result = await updateReferentsForMultipleClasses(referentsClassesToUpdate, user);

    expect(result).toEqual([
      {
        classeId: "1",
        previousReferent: { email: "old@email.com", lastName: "Old", firstName: "Old" },
        updatedReferentClasse: { email: "new@email.com", lastName: "Last", firstName: "First" },
      },
    ]);
  });

  it("should handle errors when the classe is not found", async () => {
    const referentsClassesToUpdate = [{ classeId: "nonexistent", email: "new@email.com", lastName: "Last", firstName: "First" }];
    const user = {} as UserDto;

    jest.spyOn(ClasseModel, "findById").mockResolvedValue(null);

    const result = await updateReferentsForMultipleClasses(referentsClassesToUpdate, user);

    expect(result).toEqual([
      {
        classeId: "nonexistent",
        error: ERRORS.CLASSE_NOT_FOUND,
      },
    ]);

    expect(ClasseModel.findById).toHaveBeenCalledWith("nonexistent");
  });
});

describe("getClassesByIds", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should return classes for given ids when all classes are found", async () => {
    const mockClasses = [
      { _id: "1", name: "Class 1" },
      { _id: "2", name: "Class 2" },
    ];

    jest.spyOn(ClasseModel, "find").mockResolvedValue(mockClasses);

    const result = await getClassesByIds(["1", "2"]);

    expect(result).toEqual(mockClasses);
    expect(ClasseModel.find).toHaveBeenCalledWith({ _id: { $in: ["1", "2"] } });
  });

  it("should throw an error when some classes are not found", async () => {
    const mockClasses = [{ _id: "1", name: "Class 1" }];

    jest.spyOn(ClasseModel, "find").mockResolvedValue(mockClasses);

    await expect(getClassesByIds(["1", "2"])).rejects.toThrow("Classes not found: 2");
    expect(ClasseModel.find).toHaveBeenCalledWith({ _id: { $in: ["1", "2"] } });
  });

  it("should throw an error when no classes are found", async () => {
    jest.spyOn(ClasseModel, "find").mockResolvedValue([]);

    await expect(getClassesByIds(["1", "2"])).rejects.toThrow("Classes not found: 1, 2");
    expect(ClasseModel.find).toHaveBeenCalledWith({ _id: { $in: ["1", "2"] } });
  });

  it("should handle database errors and throw them", async () => {
    const mockError = new Error("Database error");
    jest.spyOn(ClasseModel, "find").mockRejectedValue(mockError);

    await expect(getClassesByIds(["1", "2"])).rejects.toThrow("Database error");
    expect(ClasseModel.find).toHaveBeenCalledWith({ _id: { $in: ["1", "2"] } });
  });
});
