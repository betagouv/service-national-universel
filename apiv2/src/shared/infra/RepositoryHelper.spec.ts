import { getEntityUpdateSetUnset } from "./RepositoryHelper";

describe("getEntityUpdateSetUnset", () => {
    it("should return $set and $unset for a given entity", () => {
        const entity = {
            name: "John Doe",
            age: 30,
            email: undefined,
        };

        const result = getEntityUpdateSetUnset(entity);

        expect(result).toEqual({
            $set: {
                name: "John Doe",
                age: 30,
            },
            $unset: {
                email: 1,
            },
        });
    });

    it("should handle an empty entity", () => {
        const entity = {};

        const result = getEntityUpdateSetUnset(entity);

        expect(result).toEqual({
            $set: {},
            $unset: {},
        });
    });

    it("should handle an entity with all undefined values", () => {
        const entity = {
            name: undefined,
            age: undefined,
            email: undefined,
        };

        const result = getEntityUpdateSetUnset(entity);

        expect(result).toEqual({
            $set: {},
            $unset: {
                name: 1,
                age: 1,
                email: 1,
            },
        });
    });

    it("should handle an entity with all defined values", () => {
        const entity = {
            name: "Jane Doe",
            age: 25,
            email: "jane@example.com",
        };

        const result = getEntityUpdateSetUnset(entity);

        expect(result).toEqual({
            $set: {
                name: "Jane Doe",
                age: 25,
                email: "jane@example.com",
            },
            $unset: {},
        });
    });
});
