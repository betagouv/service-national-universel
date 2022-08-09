import tailwind from "../../tailwind.config";

export default function useDevice() {
  if (window.innerWidth <= parseInt(tailwind.theme.screens.md)) return "mobile";
  else return "desktop";
}
