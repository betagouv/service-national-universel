import { ROLES } from "snu-lib";
import { validateUser } from "../passport";
import { ReferentModel, YoungModel } from "../models";
import { JWT_SIGNIN_VERSION } from "../jwt-options";

jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sendEmail: () => Promise.resolve(),
  sendTemplate: () => Promise.resolve(),
}));

// Le cas « rôle toujours attribuable » atteint getAcl(), qui interroge Mongo (rôles/permissions) :
// ce test unitaire ne se connecte à aucune base, donc on le neutralise pour ne vérifier ici que le
// verrou des rôles décommissionnés, pas le calcul de l'ACL.
jest.mock("../services/iam/Permission.service", () => ({
  getAcl: jest.fn().mockResolvedValue([]),
}));

function fakeJwtPayload(user: any) {
  return {
    __v: JWT_SIGNIN_VERSION,
    _id: user._id.toString(),
    passwordChangedAt: user.passwordChangedAt,
    lastLogoutAt: user.lastLogoutAt,
  } as any;
}

describe("passport.validateUser — rôles décommissionnés (GOO-56, lot P24)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("refuse la session d'un référent au rôle décommissionné, même avec un JWT valide et un compte ACTIVE", async () => {
    const user: any = {
      _id: "507f1f77bcf86cd799439011",
      status: "ACTIVE",
      role: ROLES.HEAD_CENTER,
      roles: [ROLES.HEAD_CENTER],
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    jest.spyOn(ReferentModel, "findById").mockResolvedValue(user as any);

    const done = jest.fn();
    await validateUser(ReferentModel, fakeJwtPayload(user), done);

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it("teste roles[] en plus de role (getAcl fait primer roles[])", async () => {
    const user: any = {
      _id: "507f1f77bcf86cd799439012",
      status: "ACTIVE",
      role: ROLES.ADMIN,
      roles: [ROLES.TRANSPORTER],
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    jest.spyOn(ReferentModel, "findById").mockResolvedValue(user as any);

    const done = jest.fn();
    await validateUser(ReferentModel, fakeJwtPayload(user), done);

    expect(done).toHaveBeenCalledWith(null, false);
  });

  it("continue de rendre la session d'un référent au rôle toujours attribuable", async () => {
    const user: any = {
      _id: "507f1f77bcf86cd799439013",
      status: "ACTIVE",
      role: ROLES.ADMIN,
      roles: [ROLES.ADMIN],
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    jest.spyOn(ReferentModel, "findById").mockResolvedValue(user as any);

    const done = jest.fn();
    await validateUser(ReferentModel, fakeJwtPayload(user), done);

    expect(done).toHaveBeenCalledWith(null, user);
  });

  it("ne s'applique pas à un jeune (pas de rôle référent)", async () => {
    const young: any = {
      _id: "507f1f77bcf86cd799439014",
      status: "VALIDATED",
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    jest.spyOn(YoungModel, "findById").mockResolvedValue(young as any);

    const done = jest.fn();
    await validateUser(YoungModel, fakeJwtPayload(young), done);

    expect(done).toHaveBeenCalledWith(null, young);
  });
});

describe("passport.validateUser — PL7 (lot P27, audit du 25/09/2026) : l'usurpateur est toujours cherché dans ReferentModel", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("attribue impersonatedBy même quand la cible impersonée est un jeune (YoungModel)", async () => {
    const admin: any = { _id: "507f1f77bcf86cd799439021", role: ROLES.ADMIN };
    const young: any = {
      _id: "507f1f77bcf86cd799439022",
      status: "VALIDATED",
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    jest.spyOn(YoungModel, "findById").mockResolvedValue(young as any);
    const referentFindById = jest.spyOn(ReferentModel, "findById").mockResolvedValue(admin as any);

    const payload = { ...fakeJwtPayload(young), _impersonateId: admin._id };
    const done = jest.fn();
    await validateUser(YoungModel, payload, done);

    // Avant correctif : le code interrogeait `userModel` (YoungModel ici), qui ne contient jamais
    // d'admin — impersonatedBy restait indéfiniment vide, sans trace de l'auteur réel.
    expect(referentFindById).toHaveBeenCalledWith(admin._id);
    expect(done).toHaveBeenCalledWith(null, young);
    expect(young.impersonatedBy).toBe(admin);
  });

  it("continue de fonctionner quand la cible impersonée est elle-même un référent (ReferentModel)", async () => {
    const admin: any = { _id: "507f1f77bcf86cd799439023", role: ROLES.ADMIN };
    const referent: any = {
      _id: "507f1f77bcf86cd799439024",
      status: "ACTIVE",
      role: ROLES.REFERENT_DEPARTMENT,
      passwordChangedAt: null,
      lastLogoutAt: null,
    };
    const referentFindById = jest.spyOn(ReferentModel, "findById").mockImplementation(((id: string) =>
      Promise.resolve(id === admin._id ? admin : referent)) as any);

    const payload = { ...fakeJwtPayload(referent), _impersonateId: admin._id };
    const done = jest.fn();
    await validateUser(ReferentModel, payload, done);

    expect(referentFindById).toHaveBeenCalledWith(admin._id);
    expect(done).toHaveBeenCalledWith(null, referent);
    expect(referent.impersonatedBy).toBe(admin);
  });
});
