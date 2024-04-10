const useEnvironment = () => {
  return {
    get isProduction() {
      return Boolean(window.location.hostname.indexOf("snu.gouv.fr") > -1);
    },
    get isStaging() {
      return Boolean(window.location.hostname.indexOf(".ci.") > -1);
    },
    get isDevelopment() {
      return Boolean(window.location.hostname.indexOf("localhost") > -1);
    },
  };
};

export default useEnvironment;
