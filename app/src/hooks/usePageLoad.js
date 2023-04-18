import { useEffect, useState } from "react";

const usePageLoad = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if the page has already loaded
    if (document.readyState === "complete" && !isPageLoaded) {
      setIsPageLoaded(true);
    } else if (!isPageLoaded) {
      window.addEventListener("load", () => setIsPageLoaded(true));
    }

    return () => window.removeEventListener("load", () => setIsPageLoaded(false));
  }, [isPageLoaded]);

  return isPageLoaded;
};

export default usePageLoad;
