import { Test, TestingModule } from "@nestjs/testing";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TechnicalException } from "@shared/infra/TechnicalException";
import * as bcrypt from "bcrypt";
import { ReferentGateway } from "src/admin/core/iam/Referent.gateway";
import { ReferentModel, ReferentPasswordModel } from "src/admin/core/iam/Referent.model";
import { ReferentTokenModel } from "src/admin/core/iam/ReferentToken.model";
import { ReferentMapper } from "../repository/mongo/Referent.mapper";
import { AuthProvider } from "./Auth.provider";
import { ReferentAuthFacade } from "./ReferentAuth.facade";

jest.mock("bcrypt");

describe("ReferentAuth.facade", () => {
    let referentAuthFacade: ReferentAuthFacade;
    let referentGateway: ReferentGateway;
    let authProvider: AuthProvider;

    const mockReferent = {
        email: "test@example.com",
        password: "hashedPassword",
    };

    const mockTokenModel: ReferentTokenModel = {
        user: { email: "test@example.com" } as ReferentModel,
        token: "mockToken",
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReferentAuthFacade,
                {
                    provide: ReferentGateway,
                    useValue: {
                        findByEmail: jest.fn(),
                    },
                },
                {
                    provide: AuthProvider,
                    useValue: {
                        forgeToken: jest.fn(),
                    },
                },
            ],
        }).compile();

        referentAuthFacade = module.get<ReferentAuthFacade>(ReferentAuthFacade);
        referentGateway = module.get<ReferentGateway>(ReferentGateway);
        authProvider = module.get<AuthProvider>(AuthProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should sign in successfully with correct credentials", async () => {
        jest.spyOn(referentGateway, "findByEmail").mockResolvedValue(mockReferent as any);
        jest.spyOn(bcrypt, "compare").mockResolvedValue(true as never);
        jest.spyOn(authProvider, "forgeToken").mockResolvedValue("mockToken");
        jest.spyOn(ReferentMapper, "toModelWithoutPassword").mockReturnValue({
            email: "test@example.com",
        } as ReferentModel);

        const result = await referentAuthFacade.signin("test@example.com", "correctPassword");

        expect(referentGateway.findByEmail).toHaveBeenCalledWith("test@example.com");
        expect(bcrypt.compare).toHaveBeenCalledWith("correctPassword", "hashedPassword");
        expect(authProvider.forgeToken).toHaveBeenCalledWith(mockReferent);
        expect(result).toEqual(mockTokenModel);
    });

    it("should throw UnauthorizedException with incorrect password", async () => {
        jest.spyOn(referentGateway, "findByEmail").mockResolvedValue(mockReferent as any);
        jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

        await expect(referentAuthFacade.signin("test@example.com", "wrongPassword")).rejects.toThrow(
            TechnicalException,
        );

        expect(referentGateway.findByEmail).toHaveBeenCalledWith("test@example.com");
        expect(bcrypt.compare).toHaveBeenCalledWith("wrongPassword", "hashedPassword");
        expect(authProvider.forgeToken).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException if referent not found", async () => {
        jest.spyOn(referentGateway, "findByEmail").mockRejectedValue(
            new FunctionalException(FunctionalExceptionCode.NOT_FOUND),
        );

        await expect(referentAuthFacade.signin("nonexistent@example.com", "anyPassword")).rejects.toThrow(
            FunctionalException,
        );

        expect(referentGateway.findByEmail).toHaveBeenCalledWith("nonexistent@example.com");
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(authProvider.forgeToken).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when password is incorrect", async () => {
        const email = "test@example.com";
        const password = "incorrectPassword";
        const hashedPassword = await bcrypt.hash(password, 10);

        jest.spyOn(referentGateway, "findByEmail").mockResolvedValue({
            email,
            password: hashedPassword,
        } as ReferentPasswordModel);
        jest.spyOn(bcrypt, "compare").mockResolvedValue(false as never);

        await expect(referentAuthFacade.signin(email, password)).rejects.toThrow(TechnicalException);
    });
});
