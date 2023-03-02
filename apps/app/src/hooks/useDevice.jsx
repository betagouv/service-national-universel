import tailwind from "../../tailwind.config";

export default function useDevice(breakpoint = "md") {
  if (window.innerWidth <= parseInt(tailwind.theme.screens[breakpoint])) return "mobile";
  else return "desktop";
}
