import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ModuleRef, Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import { AnyGuard, UseAnyGuard } from "./any.guard";

describe("AnyGuard", () => {
    let guard: AnyGuard;
    let reflector: Reflector;
    let moduleRef: ModuleRef;

    class MockGuard implements CanActivate {
        canActivate = jest.fn();
    }
    class MockGuard2 implements CanActivate {
        canActivate = jest.fn();
    }

    const mockGuard = new MockGuard();
    const mockGuard2 = new MockGuard2();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnyGuard,
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: ModuleRef,
                    useValue: {
                        get: jest.fn().mockReturnValue(mockGuard),
                    },
                },
            ],
        }).compile();

        guard = module.get<AnyGuard>(AnyGuard);
        reflector = module.get<Reflector>(Reflector);
        moduleRef = module.get<ModuleRef>(ModuleRef);
    });

    describe("canActivate", () => {
        let context: ExecutionContext;

        beforeEach(() => {
            context = {
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any;

            // Reset mock functions before each test
            mockGuard.canActivate.mockReset();
            (reflector.get as jest.Mock).mockReset();
            (moduleRef.get as jest.Mock).mockReset();
            (moduleRef.get as jest.Mock).mockReturnValue(mockGuard);
        });

        it("should return true if no guards are provided", async () => {
            (reflector.get as jest.Mock).mockReturnValue(undefined);

            expect(await guard.canActivate(context)).toBe(true);
        });

        it("should return true if one guard is true", async () => {
            mockGuard.canActivate.mockResolvedValue(true);
            (reflector.get as jest.Mock).mockReturnValue([MockGuard]);
            expect(await guard.canActivate(context)).toBe(true);
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard, { strict: false });
        });
        it("should return false if one guard is false", async () => {
            mockGuard.canActivate.mockResolvedValue(false);
            (reflector.get as jest.Mock).mockReturnValue([MockGuard]);
            expect(await guard.canActivate(context)).toBe(false);
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard, { strict: false });
        });

        it("should return true if one of the guards returns true", async () => {
            mockGuard.canActivate.mockResolvedValue(true);
            mockGuard2.canActivate.mockResolvedValue(false);
            (reflector.get as jest.Mock).mockReturnValue([MockGuard, MockGuard2]);

            expect(await guard.canActivate(context)).toBe(true);
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard, { strict: false });
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard2, { strict: false });
        });

        it("should return false if all guards return false", async () => {
            mockGuard.canActivate.mockResolvedValue(false);
            mockGuard2.canActivate.mockResolvedValue(false);
            (reflector.get as jest.Mock).mockReturnValue([MockGuard, MockGuard2]);

            expect(await guard.canActivate(context)).toBe(false);
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard, { strict: false });
            expect(moduleRef.get).toHaveBeenCalledWith(MockGuard2, { strict: false });
        });
    });
});
