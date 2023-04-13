import { useState, useEffect, useCallback } from "react";
import tailwind from "../../tailwind.config";
import { debounce } from "../utils";

export default function useDevice(breakpoint = "md") {
  const [device, setDevice] = useState(window.innerWidth <= parseInt(tailwind.theme.screens[breakpoint]) ? "mobile" : "desktop");

  const debouncedResize = useCallback(
    debounce(() => {
      setDevice(window.innerWidth <= parseInt(tailwind.theme.screens[breakpoint]) ? "mobile" : "desktop");
    }, 100),
    [],
  );

  useEffect(() => {
    window.addEventListener("resize", debouncedResize);

    return (_) => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return device;
}
