import { useEffect, useState } from "react";
import { environment } from "../config";

const getTextEnvironmentBanner = () => {
  if (environment === "staging") return "Espace de Test";
  if (environment === "development") return "Développement";
  return "";
};

const EnvBanner = () => {
  const [environmentBannerVisible, setEnvironmentBannerVisible] = useState(true);
  const [textEnvironment, settextEnvironment] = useState("");

  useEffect(() => {
    settextEnvironment(getTextEnvironmentBanner());
  }, []);

  if (!textEnvironment) return null;
  if (!environmentBannerVisible) return null;
  return (
    <div className="flex bg-red-600  w-full h-10  items-center justify-center" onClick={() => setEnvironmentBannerVisible(false)}>
      <span className="italic">{textEnvironment}</span>
    </div>
  );
};

export default EnvBanner;
