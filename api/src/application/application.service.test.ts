import { sendNotificationsByStatus } from "./applicationService";
import { MissionModel, ReferentModel } from "../models";
import { sendTemplate } from "../brevo";
import { getCcOfYoung } from "../utils";
import { APPLICATION_STATUS, SENDINBLUE_TEMPLATES } from "snu-lib";
import { config } from "../config";
import { capture } from "../sentry";

// Mock des dépendances
jest.mock("../brevo", () => ({
  sendTemplate: jest.fn(),
}));

jest.mock("../utils", () => ({
  getCcOfYoung: jest.fn(),
}));

jest.mock("../sentry", () => ({
  capture: jest.fn(),
}));

jest.mock("../models", () => ({
  MissionModel: {
    findById: jest.fn(),
  },
  ReferentModel: {
    findById: jest.fn(),
  },
}));

const mockSendTemplate = sendTemplate as jest.MockedFunction<typeof sendTemplate>;
const mockGetCcOfYoung = getCcOfYoung as jest.MockedFunction<typeof getCcOfYoung>;
const mockCapture = capture as jest.MockedFunction<typeof capture>;

describe("sendApplicationStatusEmails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockApplication = {
    _id: "application123",
    youngId: "young123",
    missionId: "mission123",
    youngFirstName: "John",
    youngLastName: "Doe",
    youngEmail: "john.doe@example.com",
  };

  const mockYoung = {
    _id: "young123",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    parent1FirstName: "Jane",
    parent1LastName: "Doe",
    parent1Email: "jane.doe@example.com",
    parent2FirstName: "Bob",
    parent2LastName: "Doe",
    parent2Email: "bob.doe@example.com",
  };

  const mockMission = {
    _id: "mission123",
    name: "Mission Test",
    tutorId: "referent123",
  };

  const mockReferent = {
    _id: "referent123",
    firstName: "Referent",
    lastName: "Test",
    email: "referent@example.com",
  };

  it("should send emails for VALIDATED status", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);
    mockGetCcOfYoung.mockReturnValue([]);
    mockSendTemplate.mockResolvedValue(undefined);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(MissionModel.findById).toHaveBeenCalledWith("mission123");
    expect(ReferentModel.findById).toHaveBeenCalledWith("referent123");
    expect(mockSendTemplate).toHaveBeenCalledTimes(2);

    // Vérifier l'email au référent
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED, {
      emailTo: [{ name: "Referent Test", email: "referent@example.com" }],
      params: {
        youngFirstName: "John",
        youngLastName: "Doe",
        missionName: "Mission Test",
        cta: `${config.ADMIN_URL}/volontaire/young123/phase2/application/application123/contrat`,
      },
      cc: [],
    });
    // Vérifier l'email au jeune
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION, {
      emailTo: [
        { name: "John Doe", email: "john.doe@example.com" },
        { name: "Jane Doe", email: "jane.doe@example.com" },
        { name: "Bob Doe", email: "bob.doe@example.com" },
      ],
      params: {
        youngFirstName: "John",
        youngLastName: "Doe",
        missionName: "Mission Test",
        cta: `${config.APP_URL}/candidature?utm_campaign=transactionel+mig+candidature+approuvee&utm_source=notifauto&utm_medium=mail+151+faire`,
      },
      cc: [],
    });
  });

  it("should send email for REFUSED status", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);
    mockGetCcOfYoung.mockReturnValue([]);
    mockSendTemplate.mockResolvedValue(undefined);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.REFUSED);

    // Assert
    expect(mockSendTemplate).toHaveBeenCalledTimes(1);
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION, {
      emailTo: [
        { name: "John Doe", email: "john.doe@example.com" },
        { name: "Jane Doe", email: "jane.doe@example.com" },
        { name: "Bob Doe", email: "bob.doe@example.com" },
      ],
      params: {
        youngFirstName: "John",
        youngLastName: "Doe",
        missionName: "Mission Test",
        cta: `${config.APP_URL}/mission?utm_campaign=transactionnel+mig+candidature+nonretenue&utm_source=notifauto&utm_medium=mail+152+candidater`,
      },
      cc: [],
    });
  });

  it("should send emails for CANCEL status", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);
    mockGetCcOfYoung.mockReturnValue([]);
    mockSendTemplate.mockResolvedValue(undefined);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.CANCEL);

    // Assert
    expect(mockSendTemplate).toHaveBeenCalledTimes(2);

    // Vérifier l'email au jeune
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.young.CANCEL_APPLICATION, {
      emailTo: [
        { name: "John Doe", email: "john.doe@example.com" },
        { name: "Jane Doe", email: "jane.doe@example.com" },
        { name: "Bob Doe", email: "bob.doe@example.com" },
      ],
      params: {
        youngFirstName: "John",
        youngLastName: "Doe",
        missionName: "Mission Test",
      },
      cc: [],
    });

    // Vérifier l'email au référent
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION, {
      emailTo: [{ name: "Referent Test", email: "referent@example.com" }],
      params: {
        youngFirstName: "John",
        youngLastName: "Doe",
        missionName: "Mission Test",
      },
      cc: [],
    });
  });

  it("should filter out recipients without email", async () => {
    // Arrange
    const youngWithoutParents = {
      ...mockYoung,
      parent1Email: undefined,
      parent2Email: undefined,
    };

    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);
    mockGetCcOfYoung.mockReturnValue([]);
    mockSendTemplate.mockResolvedValue(undefined);

    // Act
    await sendNotificationsByStatus(mockApplication as any, youngWithoutParents as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION, {
      emailTo: [{ name: "John Doe", email: "john.doe@example.com" }],
      params: expect.any(Object),
      cc: [],
    });
  });

  it("should return early if mission is not found", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(null);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(ReferentModel.findById).not.toHaveBeenCalled();
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("should return early if referent is not found", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(null);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("should handle unknown status gracefully", async () => {
    // Arrange
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, "UNKNOWN_STATUS");

    // Assert
    expect(mockSendTemplate).not.toHaveBeenCalled();
  });

  it("should handle errors and capture them", async () => {
    // Arrange
    const error = new Error("Test error");
    (MissionModel.findById as jest.Mock).mockRejectedValue(error);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(mockCapture).toHaveBeenCalledWith(error);
  });

  it("should not send email if no recipients", async () => {
    // Arrange
    const applicationWithoutEmail = {
      ...mockApplication,
      youngEmail: undefined,
    };

    const youngWithoutEmail = {
      ...mockYoung,
      parent1Email: undefined,
      parent2Email: undefined,
    };

    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);

    // Act
    await sendNotificationsByStatus(applicationWithoutEmail as any, youngWithoutEmail as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    // Seul l'email au référent devrait être envoyé
    expect(mockSendTemplate).toHaveBeenCalledTimes(1);
    expect(mockSendTemplate).toHaveBeenCalledWith(SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED, expect.any(Object));
  });

  it("should use getCcOfYoung for young emails", async () => {
    // Arrange
    const mockCc = [{ name: "CC User", email: "cc@example.com" }];
    (MissionModel.findById as jest.Mock).mockResolvedValue(mockMission);
    (ReferentModel.findById as jest.Mock).mockResolvedValue(mockReferent);
    mockGetCcOfYoung.mockReturnValue(mockCc);
    mockSendTemplate.mockResolvedValue(undefined);

    // Act
    await sendNotificationsByStatus(mockApplication as any, mockYoung as any, APPLICATION_STATUS.VALIDATED);

    // Assert
    expect(mockGetCcOfYoung).toHaveBeenCalledWith({
      template: SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
      young: mockYoung,
    });

    expect(mockSendTemplate).toHaveBeenCalledWith(
      SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION,
      expect.objectContaining({
        cc: mockCc,
      }),
    );
  });
});
