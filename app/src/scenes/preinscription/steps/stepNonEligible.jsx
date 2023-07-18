import React, { useState, useContext } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import jeVeuxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import arrowRightBlue from "../../../assets/arrowRightBlue.svg";
import DSFRContainer from "../../../components/inscription/DSFRContainer";
import SignupButtonContainer from "../../../components/inscription/SignupButtonContainer";

export default function NonEligible() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const [data, __, removePersistedData] = useContext(PreInscriptionContext);
  console.log("🚀 ~ file: stepNonEligible.jsx:16 ~ NonEligible ~ data:", data);

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
    removePersistedData(true);
    history.push("/");
  };

  return (
    <DSFRContainer>
      {data.birthDate < new Date(2005, 9, 15) ? (
        <>
          <h1 className="text-[22px] font-bold">Il n’y a pas de séjour proposé dans votre zone géographique.</h1>
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Soyez informé(e) de l’ouverture des inscriptions pour les prochaines sessions SNU via le lien suivant : <a>https://www.snu.gouv.fr/</a>.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-[22px] font-bold">Vous n’êtes malheureusement pas éligible au SNU.</h1>
          {data.msg && <div className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">{data.msg}</div>}
        </>
      )}

      <div className="my-4 text-base font-bold">Découvrez d’autres formes d’engagement</div>
      <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-2">
        {engagementPrograms.map((program, index) => (
          <CardEngagement program={program} key={index} />
        ))}
      </div>
      <dic className="mt-6 flex justify-center">
        <button
          className="hove mx-auto my-4 w-full border-[1px] border-blue-france-sun-113 p-2 text-center text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover md:w-96"
          onClick={() => {
            history.push("/public-engagements");
          }}>
          Voir plus de formes d’engagement
        </button>
      </dic>
      <SignupButtonContainer onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
    </DSFRContainer>
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
