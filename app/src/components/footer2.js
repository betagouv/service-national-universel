import React from "react";
import LogoFr from "../assets/fr.png";
import LinkTo from "../assets/icons/LinkTo";
import useDevice from "../hooks/useDevice";
import { useLocation } from "react-router-dom";
import SNU from "../assets/logo-snu.png";

const Footer = () => {
  const { pathname } = useLocation();
  return (
    // A tester: Si button sticky mt-[72px] pour mobile
    <div
      className={`${
        useDevice() === "desktop" ? " absolute bottom-0 border-t-[#000091] pt-3" : !["/preinscription/sejour"].includes(pathname) && "mb-[72px]"
      } w-full bg-white border-t border-t-[#E5E5E5] `}>
      <div className={`${useDevice() === "desktop" ? "flex justify-between w-full px-24" : "px-3"} text-sm text-[#3A3A3A] py-3`}>
        <div className={`${useDevice() === "desktop" && "basis-[50%]"} mb-4 flex`}>
          <img src={LogoFr} className="w-26 h-24" />
          {useDevice() === "desktop" && <img src={SNU} className="w-[90px] h-[90px] ml-8" />}
        </div>
        <div className={`${useDevice() === "desktop" && "basis-[50%]"}`}>
          <div className="leading-6 mb-4">
            Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des
            liens forts et se découvrir un talent pour l’engagement !
          </div>
          <div className={`${useDevice() === "mobile" ? "flex-col" : "items-center space-x-6"} flex font-bold`}>
            <div className={`${useDevice() === "mobile" ? "w-full mb-4" : "space-x-6"} flex `}>
              <div className={`${useDevice() === "mobile" && "basis-[50%]"} flex items-center space-x-1  cursor-pointer`}>
                <a href="https://www.legifrance.gouv.fr/" className="hover:text-[#3A3A3A]">
                  legifrance.gouv.fr
                </a>
                <LinkTo />
              </div>
              <div className={`${useDevice() === "mobile" && "basis-[50%]"} flex items-center space-x-1  cursor-pointer`}>
                <a href="https://www.gouvernement.fr/" className="hover:text-[#3A3A3A]">
                  gouvernement.fr
                </a>
                <LinkTo />
              </div>
            </div>
            <div className={`${useDevice() === "mobile" ? "w-full" : "space-x-6"} flex`}>
              <div className={`${useDevice() === "mobile" && "basis-[50%]"} flex items-center space-x-1  cursor-pointer`}>
                <a href="https://www.service-public.fr/" className="hover:text-[#3A3A3A]">
                  service-public.fr
                </a>
                <LinkTo />
              </div>
              <div className={`${useDevice() === "mobile" && "basis-[50%]"} flex items-center space-x-1  cursor-pointer`}>
                <a href="https://www.data.gouv.fr/fr/" className="hover:text-[#3A3A3A]">
                  data.gouv.fr
                </a>
                <LinkTo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
