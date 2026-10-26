const mockFetch = jest.fn();
const mockCaptureMessage = jest.fn();
const mockConfig = {
  SLACK_BOT_TOKEN: "xoxb-token",
  SLACK_BOT_CHANNEL: "#canal-par-defaut",
  ENVIRONMENT: "production",
};

jest.mock("node-fetch", () => mockFetch);
jest.mock("../config", () => ({ __esModule: true, config: mockConfig }));
jest.mock("../logger", () => ({ __esModule: true, logger: { debug: jest.fn() } }));
jest.mock("../sentry", () => ({ __esModule: true, capture: jest.fn(), captureMessage: mockCaptureMessage }));

import { jest } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const slack = require("../slack");

function postedChannel() {
  const [, options] = mockFetch.mock.calls[0] as [string, { body: string }];
  return JSON.parse(options.body).channel;
}

describe("slack.postMessage - choix du canal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockReturnValue(Promise.resolve({ json: () => Promise.resolve({ ok: true }) }));
    mockConfig.SLACK_BOT_CHANNEL = "#canal-par-defaut";
  });

  it("poste sur le canal par defaut quand aucun canal n'est fourni", async () => {
    await slack.info({ title: "titre", text: "texte" });
    expect(postedChannel()).toBe("#canal-par-defaut");
  });

  it("poste sur le canal fourni par l'appelant", async () => {
    await slack.info({ channel: "#snu-jva", title: "titre", text: "texte" });
    expect(postedChannel()).toBe("#snu-jva");
  });

  it("accepte un canal dedie meme sans canal par defaut configure", async () => {
    mockConfig.SLACK_BOT_CHANNEL = undefined as any;
    await slack.info({ channel: "#snu-jva", title: "titre", text: "texte" });
    expect(mockCaptureMessage).not.toHaveBeenCalled();
    expect(postedChannel()).toBe("#snu-jva");
  });
});
