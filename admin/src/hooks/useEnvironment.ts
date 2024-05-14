import { environment } from "@/config";

const useEnvironment = () => {
  return {
    isProduction: environment == "production",
    isStaging: ["development", "production"].includes(environment),
    isDevelopment: environment === "development",
  };
};

export default useEnvironment;
