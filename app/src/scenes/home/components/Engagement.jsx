import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowRightBlue from "../../../assets/icons/ArrowRightBlue";

export default function Engagement() {
  const engagementPrograms = [
    {
      title: "Service civique",
      description:
        "Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles.",
      imageString: "service-civique.jpg",

      link: "https://www.service-civique.gouv.fr/",
    },
    {
      title: "JeVeuxAider.gouv.fr par la Réserve Civique",
      description:
        "Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)",
      imageString: "je-veux-aider.jpg",
      link: "https://www.jeveuxaider.gouv.fr/",
    },
    {
      title: "Réserve de la Gendarmerie nationale",
      description:
        "La réserve opérationnelle de la gendarmerie renforce l'action des unités d’active et les structures de commandement. Les réservistes contribuent directement, à la production de sécurité et à la bonne exécution des lois.",
      imageString: "reserve-gendarmerie.jpg",
      link: "https://www.gendarmerie.interieur.gouv.fr/recrutement/recrutements-et-conditions-d-acces/reserviste-dans-la-reserve-operationnelle",
    },
    {
      title: "Réserve des Armées",
      description:
        "Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.",
      imageString: "reserve-armees.jpg",
      link: "https://www.reservistes.defense.gouv.fr/",
    },
  ];

  return (
    <section>
      <p className="my-4 text-base font-bold">Découvrez d’autres formes d’engagement</p>
      <div className="flex gap-6 overflow-x-auto">
        {engagementPrograms.map((program) => {
          return <EngagementCard key={program.title} program={program} />;
        })}
      </div>
      <div className="mx-auto my-8 w-fit">
        <Link
          className="border-[1px] border-[#000091] px-3 py-2 text-center text-[#000091] hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover"
          to="/public-engagements">
          Voir plus de formes d’engagement
        </Link>
      </div>
    </section>
  );
}

function EngagementCard({ program }) {
  const [isOpen, setIsOpen] = useState(false);
  const imgSrc = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;

  return (
    <div className="w-60 flex-none border">
      <div className="h-32 w-full">
        <a href={program.link} target="_blank" rel="noreferrer">
          <img src={imgSrc} className="h-full w-full object-cover" />
        </a>
      </div>

      <div className="h-fit space-y-4 p-6">
        <div>
          <p className="h-12 font-medium leading-6">{program.title}</p>
          <p className={`overflow-hidden text-ellipsis text-sm leading-6 text-gray-700 ${isOpen ? "h-auto" : "h-[72px]"}`}>{program.description}</p>
        </div>
        <div className="flex items-center justify-between">
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
