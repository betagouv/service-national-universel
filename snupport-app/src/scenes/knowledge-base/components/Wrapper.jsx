import React, { useContext } from "react";
import SeeAsContext from "../contexts/seeAs";

const Wrapper = ({ children }) => {
  const { seeAs } = useContext(SeeAsContext);

  return (
    <div className="flex min-h-screen w-full flex-col">
      {!!seeAs && <button className="noprint rounded-none border-none bg-red-500 font-normal">Vous visualisez la base de connaissance en tant que {seeAs}</button>}
      <main className="flex-1 bg-[#F3F4F6] print:bg-transparent">{children}</main>
      <footer className="wrapper flex w-full flex-col gap-6 bg-white print:hidden ">
        <div className="wrapper flex w-full flex-col gap-6">
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <a target="_blank" href="https://www.snu.gouv.fr/mentions-legales-10" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Mentions légales</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.snu.gouv.fr/accessibilite-du-site-24" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Accessibilité</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Données personnelles et cookies</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://moncompte.snu.gouv.fr/conditions-generales-utilisation" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">Conditions générales d'utilisation</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.snu.gouv.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">SNU</span>
            </a>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <span className="cursor-pointer text-center text-xs text-[#6A6A6A]">Tous droits réservés - Ministère de l'éducation nationale et de la jeunesse - 2022</span>
          </div>
          <div className="flex max-w-full flex-wrap items-center justify-center  gap-4">
            <a target="_blank" href="https://www.gouvernement.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">gouvernement.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.education.gouv.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">education.gouv.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://jeunes.gouv.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">jeunes.gouv.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://presaje.sga.defense.gouv.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">majdc.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.service-public.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">service-public.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.legifrance.gouv.fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">legifrance.gouv.fr</span>
            </a>
            <span className="hidden text-base text-[#E5E5E5] md:block">|</span>
            <a target="_blank" href="https://www.data.gouv.fr/fr/" rel="noreferrer">
              <span className="shrink-0 cursor-pointer text-xs text-[#6A6A6A]">data.gouv.fr</span>
            </a>
          </div>
          {/* <span href="#">
              <span className="text-[#6A6A6A] text-xs cursor-pointer shrink-0">Plan du site</span>
            </Link>
            <span className="text-[#E5E5E5] text-base hidden md:block">|</span> */}
        </div>
      </footer>
    </div>
  );
};

export default Wrapper;
