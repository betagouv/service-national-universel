import Img3 from "../../../assets/fr.png";
import Img2 from "../../../assets/logo-snu.png";
import React from "react";
import { Link } from "react-router-dom";

export default function HeaderComponent() {
  return (
    <div className="sticky left-0 top-0 z-20 flex w-full items-center justify-between bg-white border-0 shadow-none" style={{ borderBottom: "none", boxShadow: "none", borderTop: "none", borderLeft: "none", borderRight: "none", outline: "none" }}>
      <div className="flex flex-1 items-center" style={{ color: "rgba(58, 58, 58, 0)" }}>
        <a href="https://www.snu.gouv.fr/" style={{ border: "none", outline: "none" }}>
          <img className="hidden h-20 py-1 px-4 align-top md:block" src={Img3} style={{ border: "none", outline: "none", display: "block" }} />
        </a>
        <a href="https://www.snu.gouv.fr/" style={{ border: "none", outline: "none" }}>
          <img className="h-10 py-1 px-4 align-top md:h-20" src={Img2} style={{ border: "none", outline: "none", display: "block" }} />
        </a>
      </div>
      <div className="flex flex-col border-l border-gray-200">
        <Link
          to="/auth"
          className="inline-block flex-1 border-b border-gray-200 p-3 text-center text-xs uppercase text-brand-grey transition-colors hover:bg-gray-100 hover:text-snu-purple-600">
          espace&nbsp;administrateur
        </Link>
        <a
          href="https://moncompte.snu.gouv.fr/"
          className="inline-block flex-1 p-3 text-center text-xs uppercase text-brand-grey transition-colors hover:bg-gray-100 hover:text-snu-purple-600"
          target="_blank"
          rel="noreferrer">
          espace&nbsp;volontaire
        </a>
      </div>
    </div>
  );
}
