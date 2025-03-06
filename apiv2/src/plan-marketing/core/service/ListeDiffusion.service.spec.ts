import { ListeDiffusionService } from "./ListeDiffusion.service";
import { NotFoundException } from "@nestjs/common";

describe("ListeDiffusionService", () => {
    let service: ListeDiffusionService;
    let mockListeDiffusionGateway: any;

    beforeEach(() => {
        mockListeDiffusionGateway = {
            save: jest.fn(),
            update: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
            search: jest.fn(),
        };

        service = new ListeDiffusionService(mockListeDiffusionGateway);
    });

    it("should create a liste de diffusion successfully", async () => {
        const mockListeDiffusion = { name: "Liste Test" };

        mockListeDiffusionGateway.save.mockResolvedValue(mockListeDiffusion);

        const result = await service.creerListeDiffusion(mockListeDiffusion as any);

        expect(mockListeDiffusionGateway.save).toHaveBeenCalledWith(mockListeDiffusion);
        expect(result).toEqual(mockListeDiffusion);
    });

    it("should update a liste de diffusion successfully", async () => {
        const mockId = "LIST-001";
        const mockListeDiffusion = { name: "Liste Test Modifiée" };
        const expectedResult = { id: mockId, ...mockListeDiffusion };

        mockListeDiffusionGateway.findById = jest.fn().mockResolvedValue({ id: mockId });
        mockListeDiffusionGateway.update.mockResolvedValue(expectedResult);

        const result = await service.updateListeDiffusion(mockId, mockListeDiffusion as any);

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
        expect(mockListeDiffusionGateway.update).toHaveBeenCalledWith({ id: mockId, ...mockListeDiffusion });
        expect(result).toEqual(expectedResult);
    });

    it("should throw NotFoundException when updating non-existing liste de diffusion", async () => {
        const mockId = "INVALID-ID";
        const mockListeDiffusion = { name: "Liste Test Modifiée" };

        mockListeDiffusionGateway.findById = jest.fn().mockResolvedValue(null);

        await expect(service.updateListeDiffusion(mockId, mockListeDiffusion as any)).rejects.toThrow(
            NotFoundException,
        );

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
        expect(mockListeDiffusionGateway.update).not.toHaveBeenCalled();
    });

    it("should get liste de diffusion by id successfully", async () => {
        const mockId = "LIST-001";
        const mockListeDiffusion = { id: mockId, name: "Liste Test" };

        mockListeDiffusionGateway.findById.mockResolvedValue(mockListeDiffusion);

        const result = await service.getListeDiffusionById(mockId);

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
        expect(result).toEqual(mockListeDiffusion);
    });

    it("should throw NotFoundException when getting non-existing liste de diffusion", async () => {
        const mockId = "INVALID-ID";

        mockListeDiffusionGateway.findById.mockResolvedValue(null);

        await expect(service.getListeDiffusionById(mockId)).rejects.toThrow(NotFoundException);

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
    });

    it("should delete liste de diffusion successfully", async () => {
        const mockId = "LIST-001";
        const mockListeDiffusion = { id: mockId, name: "Liste Test" };

        mockListeDiffusionGateway.findById.mockResolvedValue(mockListeDiffusion);
        mockListeDiffusionGateway.delete.mockResolvedValue(undefined);

        await service.deleteListeDiffusion(mockId);

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
        expect(mockListeDiffusionGateway.delete).toHaveBeenCalledWith(mockId);
    });

    it("should throw NotFoundException when deleting non-existing liste de diffusion", async () => {
        const mockId = "INVALID-ID";

        mockListeDiffusionGateway.findById.mockResolvedValue(null);

        await expect(service.deleteListeDiffusion(mockId)).rejects.toThrow(NotFoundException);

        expect(mockListeDiffusionGateway.findById).toHaveBeenCalledWith(mockId);
        expect(mockListeDiffusionGateway.delete).not.toHaveBeenCalled();
    });

    it("should search listes de diffusion successfully", async () => {
        const mockListes = [
            { id: "LIST-001", name: "Liste 1" },
            { id: "LIST-002", name: "Liste 2" },
        ];
        const mockFilter = { name: "Liste" };
        const mockSort = "ASC" as const;

        mockListeDiffusionGateway.search.mockResolvedValue(mockListes);

        const result = await service.searchListesDiffusion(mockFilter, mockSort);

        expect(mockListeDiffusionGateway.search).toHaveBeenCalledWith(mockFilter, mockSort);
        expect(result).toEqual(mockListes);
    });

    it("should search listes de diffusion without parameters", async () => {
        const mockListes = [
            { id: "LIST-001", name: "Liste 1" },
            { id: "LIST-002", name: "Liste 2" },
        ];

        mockListeDiffusionGateway.search.mockResolvedValue(mockListes);

        const result = await service.searchListesDiffusion();

        expect(mockListeDiffusionGateway.search).toHaveBeenCalledWith(undefined, undefined);
        expect(result).toEqual(mockListes);
    });
});
