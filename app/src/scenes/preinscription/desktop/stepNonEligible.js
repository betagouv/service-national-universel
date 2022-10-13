import React, { useState } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import jeVauxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";

export default function NonEligible() {
  const history = useHistory();
  const [data] = React.useContext(PreInscriptionContext);

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
  const onClickButton = () => {
    history.push("/");
  };

  return (
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[60%] mx-auto my-0 px-[102px] py-[60px]">
          <h1 className="text-[22px] font-bold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
          {data.msg && <div className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">{data.msg}</div>}
          <div className="text-base font-bold my-4">Découvrez d’autres formes d’engagement</div>
          <div className="overflow-x-auto flex flex-wrap justify-between">
            {engagementPrograms.map((program, index) => {
              const [isOpen, setIsOpen] = useState(false);

              return (
                <div key={index} className="flex basis-[48%] mt-4 ">
                  <div className="w-full h-min-[700px] ">
                    <div className="w-full h-[155px] ">
                      <a href={program.link} target="_blank" rel="noreferrer">
                        <img src={program.picture} className="object-cover w-full h-full" />
                      </a>
                    </div>
                    <div className={`min-h-min pl-4 pr-1 pb-2 border border-[#E5E5E5] ${!isOpen && "h-[250px]"}`}>
                      <div className="font-semibold my-4 min-h-[40px]">{program.title}</div>
                      <div className={`text-[13px] leading-6 mb-4 ${!isOpen && "h-[70px] text-ellipsis overflow-hidden"}`}>
                        {" "}
                        <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                          {program.description}
                        </a>
                      </div>
                      <div
                        className="text-[13px] flex justify-between pr-2 cursor-pointer"
                        onClick={() => {
                          setIsOpen(!isOpen);
                        }}>
                        {" "}
                        <div>{isOpen ? "Lire moins" : "Lire plus"}</div>
                        <img src={arrowRightBlue} className="w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* <div
      className="text-blue-600 text-center border-2 border-blue-600 my-4 p-2"
      onClick={() => {
        history.push("https://www.jeveuxaider.gouv.fr/");
      }}>
      Voir plus de formes d’engagement
    </div> */}
          <div className="w-full border-t border-t-[#E5E5E5] mt-5 flex justify-end">
            <button
              className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:bg-white hover:!text-[#000091] hover:border hover:border-[#000091] mt-4"
              onClick={onClickButton}>
              Revenir à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
