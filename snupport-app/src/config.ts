// TODO : replace with snu-lib functions
function envStr(value: any, fallback?: string) {
  if (value === undefined) {
    if (fallback === undefined) {
      throw new Error("undefined value");
    } else {
      return fallback;
    }
  }
  return value;
}
// END

function _env<T>(callback: (value: any, fallback?: T) => T, key: string, fallback?: T) {
  try {
    // @ts-expect-error import.meta
    return callback(import.meta.env[key], fallback);
  } catch (error) {
    console.warn(`Environment ${key}: ${error.message}`);
  }
  return undefined;
}

// Repli « development » réservé au serveur de dev : un build sans VITE_ENVIRONMENT échoue (vite.config.js).
// @ts-expect-error import.meta
const isDevServer: boolean = import.meta.env.DEV === true;

const ENVIRONMENT = _env(envStr, "VITE_ENVIRONMENT", isDevServer ? "development" : undefined);
const RELEASE = _env(envStr, "VITE_RELEASE", "development");
const SNUPPORT_URL_API = _env(envStr, "VITE_SNUPPORT_URL_API", "http://localhost:8090");
const SNUPPORT_URL_ADMIN = _env(envStr, "VITE_SNUPPORT_URL_ADMIN", "http://localhost:8092");
const SNU_URL_API = _env(envStr, "VITE_SNU_URL_API", "http://localhost:8080");
const SENTRY_DEBUG_MODE = _env((value: any, fallback?: boolean) => {
  if (value === undefined) return fallback ?? false;
  return value === "true";
}, "SENTRY_DEBUG_MODE", false);

export {
  ENVIRONMENT,
  RELEASE,
  SNUPPORT_URL_API,
  SNUPPORT_URL_ADMIN,
  SNU_URL_API,
  SENTRY_DEBUG_MODE,
};
