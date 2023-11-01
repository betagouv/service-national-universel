import React, { useContext } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";
import jeVeuxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
import CardEngagement from "../components/CardEngagement";

export default function NonEligible() {
  const history = useHistory();
  // eslint-disable-next-line no-unused-vars
  const [data, __, removePersistedData] = useContext(PreInscriptionContext);

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
    removePersistedData();
    history.push("/");
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer
        title="Nous n'avons pas trouvé de séjour qui correspond à votre situation."
        supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}>
        {data?.message === "age" && (
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Pour participer au SNU, vous devez avoir <strong>entre 15 et 17 ans</strong>.
          </p>
        )}

        {data?.message === "nationality" && (
          <p className="mb-2 mt-4 border-l-8 border-l-[#6A6AF4] pl-4">
            Pour participer au SNU, vous devez être de <strong>nationalité française</strong>.
          </p>
        )}

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
        <SignupButtonContainer onClickNext={onClickButton} labelNext="Revenir à l'accueil" />
      </DSFRContainer>
    </>
  );
}
