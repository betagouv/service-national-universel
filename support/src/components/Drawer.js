import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { environment } from "../config";
import NavLink from "./ActiveLink";

const Drawer = () => {
  const [environmentBannerVisible, setEnvironmentBannerVisible] = useState(true);

  function getTextEnvironmentBanner() {
    if (environment === "staging") return "Espace de Test";
    if (environment === "development") return "Développement";
    return "";
  }

  return (
    <nav className="bg-snu-purple-900 h-full w-64 flex-col text-white">
      <div className="p-4 flex items-center justify-center">
        <Image src="/assets/logo-snu.png" width={38} height={38} />
        <span className="uppercase text-sm ml-4">Admin support</span>
      </div>
      {environment !== "production" && !!environmentBannerVisible && (
        <div className="flex bg-red-600  w-full h-10  items-center justify-center" onClick={() => setEnvironmentBannerVisible(false)}>
          <span className="italic">{getTextEnvironmentBanner()}</span>
        </div>
      )}
      <ul className="mt-2">
        <NavLink href="/admin/knowledge-base">Base de connaissance</NavLink>
      </ul>
    </nav>
  );
};

export default Drawer;
