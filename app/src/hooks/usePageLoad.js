import { useEffect, useState } from "react";

const usePageLoad = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if the page has already loaded
    if (document.readyState === "complete" && !isPageLoaded) {
      console.log("DOCUMENT READY STATE");
      setIsPageLoaded(true);
    } else if (!isPageLoaded) {
      console.log("WINDOW LOADING");
      window.addEventListener("load", () => setIsPageLoaded(true));
    }

    return () => window.removeEventListener("load", () => setIsPageLoaded(false));
  }, [isPageLoaded]);

  return isPageLoaded;
};

export default usePageLoad;
