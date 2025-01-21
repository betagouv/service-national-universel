import { ReferentielService } from "./Referentiel.service";

describe("ReferentielService", () => {
    let service: ReferentielService;

    beforeEach(() => {
        service = new ReferentielService();
    });

    describe("getMissingColumns", () => {
        it("should return empty array when all required columns are present", () => {
            const requiredColumns = ["column1", "column2", "column3"];
            const columns = {
                column1: "value1",
                column2: "value2",
                column3: "value3",
            };

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual([]);
        });

        it("should return missing columns when some columns are missing", () => {
            const requiredColumns = ["column1", "column2", "column3"];
            const columns = {
                column1: "value1",
                column3: "value3",
            };

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual(["column2"]);
        });

        it("should return all columns when all required columns are missing", () => {
            const requiredColumns = ["column1", "column2", "column3"];
            const columns = {};

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual(requiredColumns);
        });

        it("should handle empty required columns array", () => {
            const requiredColumns: string[] = [];
            const columns = {
                column1: "value1",
                column2: "value2",
            };

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual([]);
        });

        it("should handle columns with null or undefined values", () => {
            const requiredColumns = ["column1", "column2", "column3"];
            const columns = {
                column1: null,
                column2: undefined,
                column3: "value3",
            };

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual([]);
        });

        it("should ignore additional columns not in required list", () => {
            const requiredColumns = ["column1", "column2"];
            const columns = {
                column1: "value1",
                column2: "value2",
                extraColumn: "extra",
            };

            const result = service.getMissingColumns(requiredColumns, columns);
            expect(result).toEqual([]);
        });
    });
});
