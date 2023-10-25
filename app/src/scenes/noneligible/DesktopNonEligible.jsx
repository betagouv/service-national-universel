import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import serviceCivique from "../../assets/programmes-engagement/service-civique.jpg";
import jeVeuxAider from "../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveGendarmerie from "../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import reserveArmee from "../../assets/programmes-engagement/reserve-armees.jpg";
import arrowRightBlue from "../../assets/arrowRightBlue.svg";
import { capture } from "../../sentry";
import { useDispatch, useSelector } from "react-redux";
import API from "../../services/api";
import { setYoung } from "../../redux/auth/actions";
import { toastr } from "react-redux-toastr";

export default function NonEligible() {
  const young = useSelector((state) => state.Auth.young);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();

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
  const logout = async () => {
    setLoading(true);
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  const getMessageNonEligible = async (young) => {
    const res = await API.post("/cohort-session/eligibility/2023", young);
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
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[60%] bg-white px-[102px] py-[60px]">
          <h1 className="text-[22px] font-bold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
          {msg && <div className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">{msg}</div>}
          <div className="my-4 text-base font-bold">Découvrez d’autres formes d’engagement</div>
          <div className="flex flex-wrap justify-between overflow-x-auto">
            {engagementPrograms.map((program, index) => {
              const [isOpen, setIsOpen] = useState(false);

              return (
                <div key={index} className="mt-4 flex basis-[48%] ">
                  <div className="h-min-[700px] w-full ">
                    <div className="h-[155px] w-full ">
                      <a href={program.link} target="_blank" rel="noreferrer">
                        <img src={program.picture} className="h-full w-full object-cover" />
                      </a>
                    </div>
                    <div className={`min-h-min border border-[#E5E5E5] pl-4 pr-1 pb-2 ${!isOpen && "h-[250px]"}`}>
                      <div className="my-4 min-h-[40px] font-semibold">{program.title}</div>
                      <div className={`mb-4 text-[13px] leading-6 ${!isOpen && "h-[70px] overflow-hidden text-ellipsis"}`}>
                        {" "}
                        <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
                          {program.description}
                        </a>
                      </div>
                      <div
                        className="flex cursor-pointer justify-between pr-2 text-[13px]"
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
          <div className="my-8 flex justify-center">
            <div
              className="w-[50%] cursor-pointer border-[1px] border-[#000091] p-2  text-center text-[#000091]"
              onClick={() => {
                history.push("/public-engagements");
              }}>
              Voir plus de formes d’engagement
            </div>
          </div>

          <div className="flex w-full justify-end border-t border-t-[#E5E5E5]">
            <button
              className="mt-4 flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]"
              onClick={logout}
              disabled={loading}>
              Revenir à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
