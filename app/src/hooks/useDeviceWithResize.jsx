import { useState, useEffect, useCallback } from "react";
import { debounce, desktopBreakpoint } from "../utils";

export default function useDevice() {
  const [device, setDevice] = useState(window.innerWidth <= desktopBreakpoint ? "mobile" : "desktop");

  const debouncedResize = useCallback(
    debounce(() => {
      setDevice(window.innerWidth <= desktopBreakpoint ? "mobile" : "desktop");
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
