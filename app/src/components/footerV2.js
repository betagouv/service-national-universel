import React from "react";
import LogoFr from "../assets/fr.png";
import LinkTo from "../assets/icons/LinkTo";
import SNU from "../assets/logo-snu.svg";

const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row px-[1rem] md:px-[7rem] w-full bg-white pt-[1rem] md:pt-[2rem] pb-32 md:pb-8 justify-between border-t-2 md:border-t-blue-france-sun-113 mt-[0rem] md:mt-[4rem]">
      <div className="w-full flex">
        <img src={LogoFr} alt="République Française" className="w-26 h-24" />
        <img src={SNU} alt="Logo du SNU" className="w-24 ml-8 hidden md:block" />
      </div>
      <div className="w-full text-xs">
        <p className="leading-relaxed md:leading-loose py-[1rem] md:py-0 text-slate-500">
          Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des liens
          forts et se découvrir un talent pour l’engagement&nbsp;!
        </p>
        <nav className="flex flex-wrap gap-6 font-bold pt-2">
          <a href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer" className="flex gap-2 items-center">
            legifrance.gouv.fr
            <LinkTo />
          </a>
          <a href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer" className="flex gap-2 items-center">
            gouvernement.fr
            <LinkTo />
          </a>
          <a href="https://www.service-public.fr/" target="_blank" rel="noreferrer" className="flex gap-2 items-center">
            service-public.fr
            <LinkTo />
          </a>
          <a href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer" className="flex gap-2 items-center">
            data.gouv.fr
            <LinkTo />
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
