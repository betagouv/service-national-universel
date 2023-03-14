import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue.js";
import jeVeuxAider from "../../../assets/programmes-engagement/je-veux-aider.jpg";
import reserveArmee from "../../../assets/programmes-engagement/reserve-armees.jpg";
import reserveGendarmerie from "../../../assets/programmes-engagement/reserve-gendarmerie.jpg";
import serviceCivique from "../../../assets/programmes-engagement/service-civique.jpg";

export default function Engagement() {
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

  return (
    <section>
      <p className="text-base font-bold my-4">Découvrez d’autres formes d’engagement</p>
      <div className="overflow-x-auto flex gap-6">
        {engagementPrograms.map((program) => {
          return <EngagementCard key={program.title} program={program} />;
        })}
      </div>
      <div className="mx-auto my-8 w-fit">
        <Link
          className="text-[#000091] text-center border-[1px] border-[#000091] px-3 py-2 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover"
          to="/public-engagements">
          Voir plus de formes d’engagement
        </Link>
      </div>
    </section>
  );
}

function EngagementCard({ program }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-60 flex-none border">
      <div className="w-full h-32">
        <a href={program.link} target="_blank" rel="noreferrer">
          <img src={program.picture} className="object-cover w-full h-full" />
        </a>
      </div>

      <div className="h-fit p-6 space-y-4">
        <div>
          <p className="font-medium leading-6 h-12">{program.title}</p>
          <p className={`text-gray-700 text-sm leading-6 text-ellipsis overflow-hidden ${isOpen ? "h-auto" : "h-[72px]"}`}>{program.description}</p>
        </div>
        <div className="flex justify-between items-center">
          <button
            className="text-xs text-gray-500"
            onClick={() => {
              setIsOpen(!isOpen);
            }}>
            {isOpen ? "Lire moins" : "Lire plus"}
          </button>
          <a href={program.link} target="_blank" rel="noreferrer">
            <ArrowRightBlue className="w-3 text-blue-france-sun-113 hover:text-blue-france-sun-113-hover" />
          </a>
        </div>
      </div>
    </div>
  );
}
