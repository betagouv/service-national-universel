import React from "react";
import LogoFr from "../../../assets/fr.png";
import LinkTo from "../../../assets/icons/LinkTo";

const Footer = () => {
  return (
    <div className="w-full bg-white border-t border-t-[#E5E5E5]">
      <div className="text-sm text-[#3A3A3A] py-3 px-3">
        <img src={LogoFr} className="w-24 mb-4" />
        <div className="leading-6">
          Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des liens
          forts et se découvrir un talent pour l’engagement !
        </div>
        <div className="flex flex-col">
          <div className="flex w-full">
            <div className="flex items-center space-x-1 basis-[50%]">
              <div>legifrance.gouv.fr</div>
              <LinkTo />
            </div>
            <div className="flex items-center space-x-1 basis-[50%] ">
              <div>gouvernement.fr</div>
              <LinkTo />
            </div>
          </div>
          <div className="flex w-full">
            <div className="flex items-center space-x-1 basis-[50%]">
              <div>service-public.fr</div>
              <LinkTo />
            </div>
            <div className="flex items-center space-x-1 basis-[50%]">
              <div>data.gouv.fr</div>
              <LinkTo />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
