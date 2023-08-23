import React from "react";
import LogoFr from "../assets/fr.png";
import LinkTo from "../../../assets/icons/LinkTo";
import SNU from "../assets/logo-snu.png";

const Footer = () => {
  return (
    <footer className="mt-[0rem] flex w-full flex-col justify-between border-t-2 bg-white px-[1rem] pt-[1rem] pb-32 md:mt-[4rem] md:flex-row md:border-t-blue-france-sun-113 md:px-[7rem] md:pt-[2rem] md:pb-8">
      <div className="flex w-full items-center">
        <img src={LogoFr} alt="République Française" className="w-26 h-24" />
        <img src={SNU} alt="Logo du SNU" className="ml-8 hidden h-20 w-20 flex-none md:block" />
      </div>
      <div className="w-full text-xs">
        <p className="py-[1rem] leading-relaxed text-slate-500 md:py-0 md:leading-loose">
          Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des liens
          forts et se découvrir un talent pour l’engagement&nbsp;!
        </p>
        <nav className="flex flex-wrap gap-6 pt-2 font-bold">
          <a href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
            legifrance.gouv.fr
            <LinkTo />
          </a>
          <a href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
            gouvernement.fr
            <LinkTo />
          </a>
          <a href="https://www.service-public.fr/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
            service-public.fr
            <LinkTo />
          </a>
          <a href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer" className="flex items-center gap-2">
            data.gouv.fr
            <LinkTo />
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
