const useEnvironment = () => {
  return {
    isProduction: window.location.hostname.includes("snu.gouv.fr"),
    isStaging: window.location.hostname.includes(".ci.") || window.location.hostname.includes("scw.cloud"),
    isDevelopment: window.location.hostname.includes("localhost"),
  };
};

export default useEnvironment;
