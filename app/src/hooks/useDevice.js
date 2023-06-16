import { desktopBreakpoint } from "../utils";

export default function useDevice() {
  if (window.innerWidth <= desktopBreakpoint) return "mobile";
  else return "desktop";
}
