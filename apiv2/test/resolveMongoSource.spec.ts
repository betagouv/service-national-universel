import { resolveMongoSource, uniqueTestDatabaseName } from "./resolveMongoSource";

describe("resolveMongoSource", () => {
    it("should use a container when TEST_MONGO_URI is absent", () => {
        expect(resolveMongoSource({})).toEqual({ kind: "container" });
    });

    it("should use the external server when TEST_MONGO_URI is set", () => {
        const uri = "mongodb://127.0.0.1:27017/?directConnection=true";
        expect(resolveMongoSource({ TEST_MONGO_URI: uri })).toEqual({ kind: "external", uri });
    });

    it("should use a container when TEST_MONGO_URI is empty", () => {
        expect(resolveMongoSource({ TEST_MONGO_URI: "" })).toEqual({ kind: "container" });
    });

    it("should use a container when TEST_MONGO_URI is blank", () => {
        expect(resolveMongoSource({ TEST_MONGO_URI: "  \t " })).toEqual({ kind: "container" });
    });

    it("should trim the external URI", () => {
        expect(resolveMongoSource({ TEST_MONGO_URI: "  mongodb://localhost:27017/  " })).toEqual({
            kind: "external",
            uri: "mongodb://localhost:27017/",
        });
    });
});

describe("uniqueTestDatabaseName", () => {
    it("should return a different valid database name on each call", () => {
        const first = uniqueTestDatabaseName();
        const second = uniqueTestDatabaseName();
        expect(first).not.toEqual(second);
        expect(first).toMatch(/^snu_test_[a-z0-9]+$/);
        expect(second).toMatch(/^snu_test_[a-z0-9]+$/);
    });
});
