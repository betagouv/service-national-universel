import React from "react";
import LogoFr from "../assets/fr.png";
import LinkTo from "../assets/icons/LinkTo";
import useDevice from "../hooks/useDevice";
import SNU from "../assets/logo-snu.png";

const Footer = ({ marginBottom }) => {
  const mobile = useDevice() === "mobile";
  return mobile ? (
    <div className={`${marginBottom ? marginBottom : ""} border-t border-t-[#E5E5E5] w-full bg-white  pb-3 `}>
      <div className="px-3 text-sm text-[#3A3A3A] py-3">
        <div className="mb-4 flex">
          <img src={LogoFr} className="w-26 h-24" />
        </div>
        <div>
          <div className="leading-6 mb-4">
            Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des
            liens forts et se découvrir un talent pour l’engagement !
          </div>
          <div className="flex-col flex font-bold">
            <div className="w-full mb-4 flex ">
              <div className="basis-[50%] flex items-center space-x-1  cursor-pointer">
                <a href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  legifrance.gouv.fr
                </a>
                <LinkTo />
              </div>
              <div className="basis-[50%] flex items-center space-x-1  cursor-pointer">
                <a href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  gouvernement.fr
                </a>
                <LinkTo />
              </div>
            </div>
            <div className="w-full flex">
              <div className="basis-[50%] flex items-center space-x-1  cursor-pointer">
                <a href="https://www.service-public.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  service-public.fr
                </a>
                <LinkTo />
              </div>
              <div className="basis-[50%] flex items-center space-x-1  cursor-pointer">
                <a href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  data.gouv.fr
                </a>
                <LinkTo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className={`${marginBottom ? marginBottom : ""} border-t-[#000091] border-t pt-3 px-3 w-full bg-white  pb-3`}>
      <div className="flex justify-between w-full px-[108px] text-sm text-[#3A3A3A] py-3">
        <div className="basis-[50%] mb-4 flex">
          <img src={LogoFr} className="w-26 h-24" />
          <img src={SNU} className="w-[90px] h-[90px] ml-8" />
        </div>
        <div className="basis-[50%]">
          <div className="leading-6 mb-4">
            Le Service national universel s’adresse à tous les jeunes de 15 à 17 ans qui souhaitent vivre une belle expérience collective, se rendre utile aux autres, créer des
            liens forts et se découvrir un talent pour l’engagement !
          </div>
          <div className="items-center flex font-bold flex-wrap">
            <div className="space-x-6 flex mr-6 mb-2">
              <div className="flex items-center space-x-1  cursor-pointer">
                <a href="https://www.legifrance.gouv.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  legifrance.gouv.fr
                </a>
                <LinkTo />
              </div>
              <div className="flex items-center space-x-1  cursor-pointer">
                <a href="https://www.gouvernement.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  gouvernement.fr
                </a>
                <LinkTo />
              </div>
            </div>
            <div className="space-x-6 flex mb-2">
              <div className="flex items-center space-x-1  cursor-pointer">
                <a href="https://www.service-public.fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
                  service-public.fr
                </a>
                <LinkTo />
              </div>
              <div className="flex items-center space-x-1  cursor-pointer">
                <a href="https://www.data.gouv.fr/fr/" target="_blank" rel="noreferrer" className="hover:text-[#3A3A3A]">
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
