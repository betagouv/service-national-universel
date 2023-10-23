import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import jeVeuxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
import { setYoung } from "@/redux/auth/actions";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";

export default function NonEligible() {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
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
  const onClickButton = async () => {
    setLoading(true);
    await API.post(`/young/logout`);
    dispatch(setYoung(null));
    toastr.info("Vous avez bien été déconnecté.", { timeOut: 10000 });
    return history.push("/auth");
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}>
        <h1 className="text-[22px] font-bold">Nous n'avons pas trouvé de séjour qui correspond à votre situation.</h1>
        <p className="mb-2 mt-4 border-l-8 border-l-[#0a0a0d] pl-4">
          Les inscriptions sont actuellement uniquement ouvertes aux volontaires <strong>âgés de 15 à 17 ans</strong> et <strong>scolarisés en seconde</strong>{" "}
          <strong>en Nouvelle-Calédonie ou à Wallis-et-Futuna</strong>.
        </p>
        <p className="text-gray-500 mt-4">
          Soyez informé(e) de l&apos;ouverture des inscriptions pour les prochaines sessions du SNU via le lien suivant :{" "}
          <a href="https://www.snu.gouv.fr/" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:decoration-2 hover:underline hover:text-gray-800">
            snu.gouv.fr
          </a>
          .
        </p>
        <div className="my-4 text-base font-bold">Découvrez d’autres formes d’engagement</div>
        <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-2">
          {engagementPrograms.map((program, index) => (
            <CardEngagement program={program} key={index} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            className="hove mx-auto my-4 w-full border-[1px] border-blue-france-sun-113 p-2 text-center text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover md:w-96"
            onClick={() => {
              history.push("/public-engagements");
            }}>
            Voir plus de formes d’engagement
          </button>
        </div>
        <SignupButtonContainer onClickNext={onClickButton} labelNext="Revenir à l'accueil" disabled={loading} />
      </DSFRContainer>
    </>
  );
}

function CardEngagement({ program }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-min-[700px] min-w-[16rem] md:w-full ">
      <div className="h-[155px] w-full ">
        <a href={program.link} target="_blank" rel="noreferrer">
          <img src={program.picture} className="h-full w-full object-cover" />
        </a>
      </div>
      <div className={`min-h-min border border-[#E5E5E5] px-4 pr-1 pb-2 ${!isOpen && "h-[250px]"}`}>
        <div className="my-4 min-h-[40px] font-semibold">{program.title}</div>
        <div className={`mb-4 text-[13px] leading-6 ${!isOpen && "h-[70px] overflow-hidden text-ellipsis"}`}>
          <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
            {program.description}
          </a>
        </div>
        <div
          className="flex justify-between pr-2 text-[13px]"
          onClick={() => {
            setIsOpen(!isOpen);
          }}>
          <div>{isOpen ? "Lire moins" : "Lire plus"}</div>
          <img src={arrowRightBlue} className="w-3" />
        </div>
      </div>
    </div>
  );
}
