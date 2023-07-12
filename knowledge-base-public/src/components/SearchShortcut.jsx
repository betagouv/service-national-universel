import { useEffect, useState } from "react";

export default function SearchShortcut() {
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    if (window.navigator.platform.includes("Mac")) {
      setPlatform("Mac");
    }
    if (window.navigator.platform.includes("Win") || window.navigator.platform.includes("Linux")) {
      setPlatform("PC");
    }
  }, []);

  if (platform === "Mac") {
    return <p className="hidden gap-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-[#32257F] opacity-80 md:flex">⌘K</p>;
  }
  if (platform === "PC") {
    return <p className="hidden gap-1 rounded bg-gray-200 px-1.5 py-0.5 text-xs text-[#32257F] opacity-80 md:flex">Ctrl K</p>;
  }
  return null;
}
