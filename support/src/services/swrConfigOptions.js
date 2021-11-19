import API from "./api";

// we use cache in localstorage AT LEAST because in dev mode, hot reload works much better like that
// @TODO: see if it's useful also in production ?
function sessionStorageProvider() {
  if (typeof window === "undefined") return new Map([]);
  console.log("inside sessions storage provider");
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map(JSON.parse(window.sessionStorage.getItem("snu-user-cache") || "[]"));
  console.log({ map });
  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    window.sessionStorage.setItem("snu-user-cache", appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

const swrConfigOptions = {
  fetcher: API.swrFetcher,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404.
    if (error.status === 404) return;
    if (error.status === 401) return;

    // Only retry up to 10 times.
    if (retryCount >= 2) return;
    // Retry after 5 seconds.
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
  provider: sessionStorageProvider,
};

export default swrConfigOptions;
