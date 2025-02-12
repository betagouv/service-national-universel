import { environment } from "@/config";

const useEnvironment = () => {
  const environmentInfo = {
    isProduction: environment == "production",
    isPrepoduction: environment === "staging",
    isCi: environment === "ci",
    isDevelopment: environment === "development",
    isCustom: false,
  };
  environmentInfo.isCustom = !environmentInfo.isProduction && !environmentInfo.isPrepoduction && !environmentInfo.isCi && !environmentInfo.isDevelopment;
  return environmentInfo;
};

export default useEnvironment;
