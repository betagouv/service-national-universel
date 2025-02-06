import { Test, TestingModule } from "@nestjs/testing";
import { SessionService } from "./Session.service";
import { SessionGateway } from "./Session.gateway";

describe("SessionService", () => {
    let sessionService: SessionService;
    let sessionGateway: SessionGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                {
                    provide: SessionGateway,
                    useValue: {
                        findByElligibility: jest.fn(),
                    },
                },
            ],
        }).compile();

        sessionService = module.get<SessionService>(SessionService);
        sessionGateway = module.get<SessionGateway>(SessionGateway);
    });

    describe("getFilteredSessionsForCLE", () => {
        it("should return sessions where inscription is currently open", async () => {
            const now = new Date();
            const sessionsCLE = [
                {
                    id: "1",
                    inscriptionStartDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Started 1 day ago
                    inscriptionEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Ends tomorrow
                    instructionEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 2), // Ends in 2 days
                },
                {
                    id: "2",
                    inscriptionStartDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2), // Started 2 days ago
                    inscriptionEndDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Ended yesterday
                    instructionEndDate: new Date(now.getTime() - 1000 * 60 * 60 * 24), // Ended yesterday
                },

                {
                    id: "3",
                    inscriptionStartDate: null, // No start date
                    inscriptionEndDate: new Date(now.getTime() + 1000 * 60 * 60), // Ends in 1 hour
                    instructionEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 2), // Ends in 2 hours
                },
            ];

            (sessionGateway.findByElligibility as jest.Mock).mockResolvedValue(sessionsCLE);

            const result = await sessionService.getFilteredSessionsForCLE();

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("1"); // Only the first session is valid
        });

        it("should return an empty array if no sessions are eligible", async () => {
            const now = new Date();
            const sessionsCLE = [
                {
                    id: "1",
                    inscriptionStartDate: new Date(now.getTime() - 1000 * 60 * 60 * 3), // Started 3 hours ago
                    inscriptionEndDate: new Date(now.getTime() - 1000 * 60 * 60), // Ended 1 hour ago
                    instructionEndDate: new Date(now.getTime() - 1000 * 60 * 30), // Ended 30 minutes ago
                },
            ];

            (sessionGateway.findByElligibility as jest.Mock).mockResolvedValue(sessionsCLE);

            const result = await sessionService.getFilteredSessionsForCLE();

            expect(result).toEqual([]);
        });
    });

    describe("isCohortInscriptionOpen", () => {
        it("should return true if the session is within the inscription period", () => {
            const now = new Date();
            const session = {
                inscriptionStartDate: new Date(now.getTime() - 1000 * 60 * 60), // Started 1 hour ago
                inscriptionEndDate: new Date(now.getTime() + 1000 * 60 * 60), // Ends in 1 hour
            };

            expect(SessionService.isCohortInscriptionOpen(session as any)).toBe(true);
        });

        it("should return false if the inscription period has not started", () => {
            const now = new Date();
            const session = {
                inscriptionStartDate: new Date(now.getTime() + 1000 * 60 * 60), // Starts in 1 hour
                inscriptionEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 2), // Ends in 2 hours
            };

            expect(SessionService.isCohortInscriptionOpen(session as any)).toBe(false);
        });

        it("should return false if the inscription period has ended", () => {
            const now = new Date();
            const session = {
                inscriptionStartDate: new Date(now.getTime() - 1000 * 60 * 60 * 2), // Started 2 hours ago
                inscriptionEndDate: new Date(now.getTime() - 1000 * 60 * 30), // Ended 30 mins ago
            };

            expect(SessionService.isCohortInscriptionOpen(session as any)).toBe(false);
        });
    });
});
