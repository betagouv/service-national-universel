import { buildRequestPath, buildRequestQueryString } from "./request";

describe("buildRequestPath", () => {
  it("should return the path with no params", () => {
    const path = "/users";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual(path);
  });

  it("should return the path with params", () => {
    const path = "/users/{userId}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with optional params", () => {
    const path = "/users/{userId?}";
    const params = { userId: "123" };
    expect(buildRequestPath(path, params)).toEqual("/users/123");
  });

  it("should return the path with missing optional params", () => {
    const path = "/users/{userId?}";
    const params = {};
    expect(buildRequestPath(path, params)).toEqual("/users");
  });

  it("should return the path with missing required params", () => {
    const path = "/users/{userId}";
    const params = {}; // not handle
    expect(buildRequestPath(path, params)).toEqual("/users/{userId}");
  });
});

describe("buildRequestQueryString", () => {
  it("should return an empty string with no query", () => {
    expect(buildRequestQueryString()).toEqual("");
  });

  it("should return an empty string with an empty query", () => {
    expect(buildRequestQueryString({})).toEqual("");
  });

  it("should return a query string with a single query param", () => {
    const query = { page: 1 };
    expect(buildRequestQueryString(query)).toEqual("?page=1");
  });

  it("should return a query string with multiple query params", () => {
    const query = { page: 1, limit: 10 };
    expect(buildRequestQueryString(query)).toEqual("?limit=10&page=1");
  });
});
