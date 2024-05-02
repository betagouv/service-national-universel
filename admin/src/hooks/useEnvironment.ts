const useEnvironment = () => {
  return {
    get isProduction() {
      return window.location.hostname.includes("snu.gouv.fr");
    },
    get isStaging() {
      return window.location.hostname.includes(".ci.") || window.location.hostname.includes("scw.cloud");
    },
    get isDevelopment() {
      return window.location.hostname.includes("localhost");
    },
  };
};

export default useEnvironment;
