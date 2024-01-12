import { useState, useEffect, useCallback } from "react";
import tailwind from "../../tailwind.config";
import { debounce } from "../utils";

export default function useDevice(breakpoint = "md") {
  const [device, setDevice] = useState("");
  const [vw, setVw] = useState(0);

  const debouncedResize = useCallback(
    debounce(() => {
      setDevice(window.innerWidth < parseInt(tailwind.theme.screens[breakpoint]) ? "mobile" : "desktop");
      setVw(window.innerWidth);
    }, 100),
    []
  );

  useEffect(() => {
    window.addEventListener("resize", debouncedResize);
    setDevice(window.innerWidth < parseInt(tailwind.theme.screens[breakpoint]) ? "mobile" : "desktop");
    setVw(window.innerWidth);

    return (_) => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return { device, vw };
}
