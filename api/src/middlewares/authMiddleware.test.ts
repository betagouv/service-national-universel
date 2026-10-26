import passport from "passport";
import { Request, Response } from "express";
import { logger } from "../logger";
import { authMiddleware, isPublicRoute } from "./authMiddleware";

jest.mock("passport", () => ({
  authenticate: jest.fn().mockImplementation(() => {
    return (req, res, next) => {
      next();
    };
  }),
}));
jest.mock("../logger");

describe("authMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    // PL6 : l'IP journalisée doit venir de req.ip (Express, fiable via trust proxy), jamais d'une
    // valeur calculée par le package request-ip, falsifiable via X-Client-IP / X-Forwarded-For.
    req = { path: "", originalUrl: "", ip: "an-ip", ipInfo: "falsifiable-ip" } as any;
    res = {} as Response;
    next = jest.fn();
  });

  it("should call next if the route is public", () => {
    req.path = "/public/classe";
    req.originalUrl = "/public/classe";
    authMiddleware("referent")(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Acessing public route: /public/classe - ip: an-ip");
  });

  it("should authenticate if the route is not public", () => {
    req.path = "/private";
    authMiddleware("referent")(req, res, next);
    expect(passport.authenticate).toHaveBeenCalledWith("referent", { session: false, failWithError: true });
  });
});

describe("isPublicRoute", () => {
  it("should return true if the route is public", () => {
    expect(isPublicRoute("/public/classe")).toBe(true);
  });

  it("should return false if the route is not public", () => {
    expect(isPublicRoute("/classe")).toBe(false);
  });
});
