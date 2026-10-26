// @sentry/profiling-node est un module natif : sans binaire pour la version de Node courante (8.x sous
// Node 24, ABI 137), son chargement lève. L'api doit alors démarrer sans profiling au lieu de tomber.

const sentryNodeMock = () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  extraErrorDataIntegration: () => ({ name: "extraErrorData" }),
  rewriteFramesIntegration: () => ({ name: "rewriteFrames" }),
});

const loggerMock = () => ({ logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn() } });

const configMock = () => ({
  config: { ENABLE_SENTRY: true, ENVIRONMENT: "production", LOG_LEVEL: "error", SENTRY_DEBUG_MODE: false, RELEASE: "test" },
});

const loadSentry = (profilingFactory: () => unknown) => {
  let sentry: any;
  let init: jest.Mock = jest.fn();
  let logger: any;
  jest.isolateModules(() => {
    jest.doMock("@sentry/profiling-node", profilingFactory);
    jest.doMock("@sentry/node", sentryNodeMock);
    jest.doMock("../config", configMock);
    jest.doMock("../logger", loggerMock);
    sentry = require("../sentry");
    init = require("@sentry/node").init;
    logger = require("../logger").logger;
  });
  return { sentry, init, logger };
};

const integrationNames = (init: jest.Mock) => init.mock.calls[0][0].integrations.map((integration: { name: string }) => integration.name);

describe("initSentry et @sentry/profiling-node", () => {
  it("installe le profiling quand le module natif se charge", () => {
    const { sentry, init, logger } = loadSentry(() => ({ nodeProfilingIntegration: () => ({ name: "profiling" }) }));

    sentry.initSentry();

    expect(integrationNames(init)).toEqual(["extraErrorData", "rewriteFrames", "profiling"]);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("démarre sans profiling, et le signale, quand le binaire natif manque", () => {
    const { sentry, init, logger } = loadSentry(() => {
      throw new Error("Cannot find module './sentry_cpu_profiler-linux-x64-glibc-137.node'");
    });

    expect(() => sentry.initSentry()).not.toThrow();

    expect(init).toHaveBeenCalledTimes(1);
    expect(integrationNames(init)).toEqual(["extraErrorData", "rewriteFrames"]);
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining("sentry_cpu_profiler-linux-x64-glibc-137.node"));
  });
});
