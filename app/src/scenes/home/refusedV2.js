import React from "react";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import arrowRightBlue from "../../assets/arrowRightBlue.svg";
import jeVauxAider from "../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveArmee from "../../assets/programmes-engagement/reserve-armees.jpg";
import reserveGendarmerie from "../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import serviceCivique from "../../assets/programmes-engagement/service-civique.jpg";

import { translateField, translateCorrectionReason, formatDateFR, PHASE1_YOUNG_ACCESS_LIMIT, translate } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import { redirectToCorrection } from "../../utils/navigation";

const engagementPrograms = [
  {
    title: "Service civique",
    description:
      "Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles.",
    picture: serviceCivique,
    link: "https://www.service-civique.gouv.fr/",
  },
  {
    title: "JeVeuxAider.gouv.fr par la Réserve Civique",
    description:
      "Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)",
    picture: jeVauxAider,
    link: "https://www.jeveuxaider.gouv.fr/",
  },
  {
    title: "Réserve la Gendarmerie nationale",
    description:
      "La réserve opérationnelle de la gendarmerie renforce l'action des unités d’active et les structures de commandement. Les réservistes contribuent directement, à la production de sécurité et à la bonne exécution des lois.",
    picture: reserveGendarmerie,
    link: "https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste",
  },
  {
    title: "Réserve des Armées",
    description:
      "Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.",
    picture: reserveArmee,
    link: "https://www.reservistes.defense.gouv.fr/",
  },
];

export default function RefusedV2() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const [isOpen, setIsOpen] = React.useState({});

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden lg:flex">
        <div className="my-12 mx-10 w-full">
          <div className="flex justify-between items-stretch rounded-lg bg-white">
            <div className="w-full p-10">
              <div className="text-[44px] font-medium leading-tight tracking-tight text-gray-800">
                <strong>{young.firstName},</strong> nous sommes désolés.
              </div>
              <div className="text-[#242526] font-bold text-xl mt-3">Votre inscription n&apos;a pas pu être retenue.</div>
              <div className="text-[#738297] text-sm mt-2">
                Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
                <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
              </div>
              <div className="text-lg font-bold mb-4 mt-12">Découvrez d’autres formes d’engagement</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 overflow-x-auto flex-wrap justify-between gap-5">
                {engagementPrograms.map((program, index) => {
                  return (
                    <div key={index} className="flex col-span-1">
                      <div className="w-full h-min-[700px] ">
                        <div className="w-full h-[155px] ">
                          <a href={program.link} target="_blank" rel="noreferrer">
                            <img src={program.picture} className="object-cover w-full h-full" />
                          </a>
                        </div>
                        <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen[index] && "h-[250px]"} overflow-hidden`}>
                          <div className="font-semibold my-4 min-h-[40px]">{program.title}</div>
                          <div className={`text-[13px] leading-6 mb-4 ${!isOpen[index] && "h-[70px] text-ellipsis overflow-hidden"}`}>
                            <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                              {program.description}
                            </a>
                          </div>
                          <div
                            className="text-[13px] flex justify-between pr-2 cursor-pointer"
                            onClick={() => {
                              setIsOpen({ ...isOpen, [index]: !isOpen[index] });
                            }}>
                            <div>{isOpen[index] ? "Lire moins" : "Lire plus"}</div>
                            <img src={arrowRightBlue} className="w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center my-8">
                <div
                  className="text-[#000091] text-center border-[1px] border-[#000091] w-[50%]  p-2 cursor-pointer"
                  onClick={() => {
                    history.push("/public-engagements");
                  }}>
                  Voir plus de formes d’engagement
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-10">
            <a
              className="w-40"
              href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
              onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
              <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
            </a>
          </div>
        </div>
      </div>
      {/* MOBILE */}
      <div className="flex flex-col lg:hidden w-full">
        <div className="flex flex-col w-full">
          <img src={require("../../assets/homePhase2Mobile.png")} />
          <div className="px-4 pb-4 flex-col w-full">
            <div className="text-3xl font-medium leading-tight tracking-tight text-gray-800">
              <strong>{young.firstName},</strong> nous sommes désolés.
            </div>
            <div className="text-[#242526] font-bold text-base mt-3">Votre inscription n&apos;a pas pu être retenue.</div>
            <div className="text-[#738297] text-sm mt-2">
              Suite au traitement de votre dossier d&apos;inscription, votre référent n&apos;a pas pu retenir votre inscription, en voici la raison principale&nbsp;:
              <div className="mt-1">{young?.inscriptionRefusedMessage}</div>
            </div>
            <div className="text-lg font-bold mb-4 mt-12">Découvrez d’autres formes d’engagement</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto flex-wrap justify-between gap-5">
              {engagementPrograms.map((program, index) => {
                return (
                  <div key={index} className="flex col-span-1">
                    <div className="w-full h-min-[700px] ">
                      <div className="w-full h-[155px] ">
                        <a href={program.link} target="_blank" rel="noreferrer">
                          <img src={program.picture} className="object-cover w-full h-full" />
                        </a>
                      </div>
                      <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen[index] && "h-[250px]"} overflow-hidden`}>
                        <div className="font-semibold my-4 min-h-[40px]">{program.title}</div>
                        <div className={`text-[13px] leading-6 mb-4 ${!isOpen[index] && "h-[70px] text-ellipsis overflow-hidden"}`}>
                          <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                            {program.description}
                          </a>
                        </div>
                        <div
                          className="text-[13px] flex justify-between pr-2 cursor-pointer"
                          onClick={() => {
                            setIsOpen({ ...isOpen, [index]: !isOpen[index] });
                          }}>
                          <div>{isOpen[index] ? "Lire moins" : "Lire plus"}</div>
                          <img src={arrowRightBlue} className="w-3" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center my-8">
              <div
                className="text-[#000091] text-center border-[1px] border-[#000091] w-full  p-2 cursor-pointer"
                onClick={() => {
                  history.push("/public-engagements");
                }}>
                Voir plus de formes d’engagement
              </div>
            </div>
            <div className="flex justify-center mt-20">
              <a
                className="w-36"
                href="https://voxusagers.numerique.gouv.fr/Demarches/3154?&view-mode=formulaire-avis&nd_mode=en-ligne-enti%C3%A8rement&nd_source=button&key=060c41afff346d1b228c2c02d891931f"
                onClick={() => plausibleEvent("Compte/CTA - Je donne mon avis", { statut: translate(young.status) })}>
                <img src="https://voxusagers.numerique.gouv.fr/static/bouton-blanc.svg" alt="Je donne mon avis" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
