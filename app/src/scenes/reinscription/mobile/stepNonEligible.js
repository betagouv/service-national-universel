import React, { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getDepartmentByZip } from "snu-lib";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import jeVeuxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import Footer from "../../../components/footerV2";
import StickyButton from "../../../components/inscription/stickyButton";
import { capture } from "../../../sentry";
import API from "../../../services/api";

export default function NonEligible() {
  const young = useSelector((state) => state.Auth.young);
  const [msg, setMsg] = useState("");
  const history = useHistory();

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
      picture: jeVeuxAider,
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

  const getMessageNonEligible = async (young) => {
    const res = await API.post("/cohort-session/eligibility/2023", {
      department: young.school?.departmentName || young.school?.department || getDepartmentByZip(young.zip) || null,
      birthDate: young.birthdateAt,
      schoolLevel: young.grade,
      frenchNationality: young.frenchNationality,
    });
    if (!res.ok) {
      capture(res.code);
    }
    setMsg(res.data.msg);
  };

  useEffect(() => {
    if (!young) return null;

    getMessageNonEligible(young);
  }, [young]);

  return (
    <>
      <div className="bg-white p-4">
        <h1 className="text-[22px] font-bold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
        {msg && <div className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">{msg}</div>}
        <div className="text-base font-bold my-4">Découvrez d’autres formes d’engagement</div>
        <div className="overflow-x-auto flex space-x-6">
          {engagementPrograms.map((program, index) => {
            const [isOpen, setIsOpen] = useState(false);

            return (
              <div key={index} className="flex w-96">
                <div className="w-64 h-min-[700px] ">
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
      <Footer marginBottom={"88px"} />
      <StickyButton text="Revenir à l'accueil" onClick={onClickButton} />
    </>
  );
}
