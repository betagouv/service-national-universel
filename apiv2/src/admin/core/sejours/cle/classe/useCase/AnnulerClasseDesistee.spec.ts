import { AnnulerClasseDesistee } from "./AnnulerClasseDesistee";
import { Logger } from "@nestjs/common";
import { STATUS_CLASSE, YOUNG_STATUS } from "snu-lib";
import { ClasseModel } from "../Classe.model";

describe("AnnulerClasseDesistee", () => {
    let useCase: AnnulerClasseDesistee;
    let mockJeuneGateway: any;
    let mockClasseGateway: any;
    let mockHistoryGateway: any;

    beforeEach(() => {
        mockJeuneGateway = {
            findByClasseIdAndSessionId: jest.fn(),
            update: jest.fn(),
        };
        mockClasseGateway = {
            update: jest.fn(),
        };
        mockHistoryGateway = {
            findLastByReferenceIdAndPath: jest.fn(),
            findLastByReferenceIdAndPathAndValue: jest.fn(),
        };

        useCase = new AnnulerClasseDesistee(mockJeuneGateway, mockClasseGateway, mockHistoryGateway, new Logger());
    });

    it("should restore previous class and young statuses", async () => {
        const mockClasse = {
            id: "CLASS-001",
            statut: STATUS_CLASSE.WITHDRAWN,
        } as ClasseModel;

        const mockYoung = {
            id: "YOUNG-001",
            statut: YOUNG_STATUS.WITHDRAWN,
        };

        mockHistoryGateway.findLastByReferenceIdAndPath.mockResolvedValue({
            ops: [{ path: "/status", value: STATUS_CLASSE.VERIFIED }],
        });
        mockHistoryGateway.findLastByReferenceIdAndPathAndValue.mockResolvedValue({
            ops: [{ path: "/status", value: YOUNG_STATUS.WITHDRAWN, originalValue: YOUNG_STATUS.VALIDATED }],
        });

        mockJeuneGateway.findByClasseIdAndSessionId.mockResolvedValue([mockYoung]);

        mockClasseGateway.update.mockResolvedValue({
            ...mockClasse,
            statut: STATUS_CLASSE.VERIFIED,
        });

        mockJeuneGateway.update.mockResolvedValue({
            ...mockYoung,
            statut: YOUNG_STATUS.VALIDATED,
        });

        const result = await useCase.execute(mockClasse);

        expect(result.classe.statut).toBe(STATUS_CLASSE.VERIFIED);
        expect(mockClasseGateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "CLASS-001",
                statut: STATUS_CLASSE.VERIFIED,
            }),
        );
        expect(mockJeuneGateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "YOUNG-001",
                statut: YOUNG_STATUS.VALIDATED,
            }),
        );
    });

    it("should handle missing class history by setting default status", async () => {
        const mockClasse = {
            id: "CLASS-001",
            statut: STATUS_CLASSE.WITHDRAWN,
        } as ClasseModel;

        mockHistoryGateway.findLastByReferenceIdAndPath.mockResolvedValue(null);
        mockJeuneGateway.findByClasseIdAndSessionId.mockResolvedValue([]);

        mockClasseGateway.update.mockResolvedValue({
            ...mockClasse,
            statut: STATUS_CLASSE.CLOSED,
        });

        const result = await useCase.execute(mockClasse);

        expect(result.classe.statut).toBe(STATUS_CLASSE.CLOSED);
        expect(result.rapport).toContain(`Classe CLASS-001 : Statut précédent : undefined`);
    });

    it("should handle missing young history by setting default status", async () => {
        const mockClasse = {
            id: "CLASS-001",
            statut: STATUS_CLASSE.WITHDRAWN,
        } as ClasseModel;

        const mockYoung = {
            id: "YOUNG-001",
            statut: YOUNG_STATUS.WITHDRAWN,
        };

        mockHistoryGateway.findLastByReferenceIdAndPath.mockResolvedValue({
            ops: [{ path: "/status", value: STATUS_CLASSE.VERIFIED }],
        });
        mockHistoryGateway.findLastByReferenceIdAndPathAndValue.mockResolvedValue(null);

        mockJeuneGateway.findByClasseIdAndSessionId.mockResolvedValue([mockYoung]);

        mockClasseGateway.update.mockResolvedValue({
            ...mockClasse,
            statut: STATUS_CLASSE.VERIFIED,
        });

        const result = await useCase.execute(mockClasse);

        expect(mockJeuneGateway.update).toHaveBeenCalledWith(
            expect.objectContaining({
                id: "YOUNG-001",
                statut: YOUNG_STATUS.WAITING_VALIDATION,
            }),
        );
        expect(result.rapport).toContain(`Jeune YOUNG-001 : Statut précédent : undefined`);
    });
});
