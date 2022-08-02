import useMobileSwitch from "../../../hooks/useMobileSwitch";
import DesktopView from "./desktop";
import MobileView from "./mobile";

export default function View() {
  return useMobileSwitch(MobileView, DesktopView);
}
