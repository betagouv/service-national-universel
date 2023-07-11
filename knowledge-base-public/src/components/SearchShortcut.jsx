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

  if (platform)
    return (
      <div className="hidden gap-1 md:flex">
        {platform === "Mac" ? (
          <div className="flex h-5 w-5 items-center justify-center rounded-sm border-[1px] border-white text-xs opacity-30">⌘</div>
        ) : (
          <div className="flex h-5 w-7 items-center justify-center rounded-sm border-[1px] border-white text-xs opacity-30">Ctrl</div>
        )}
        <div className="flex h-5 w-5 items-center justify-center rounded-sm border-[1px] border-white text-xs opacity-30">K</div>
      </div>
    );
  return null;
}
