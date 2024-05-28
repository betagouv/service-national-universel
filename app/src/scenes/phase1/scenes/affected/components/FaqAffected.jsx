import React from "react";
import ArrowUpRight from "../../../../../assets/icons/ArrowUpRight";
import QuestionBlock from "../../../components/QuestionBlock";

const FaqAffected = ({ className }) => {
  return (
    <section className={`m-[1rem] md:mx-[4rem] ${className}`}>
      <h2 className="my-4 text-xl font-bold">Questions fréquentes</h2>
      <div className="flex flex-col gap-4">
        <QuestionBlock
          questionText="Comment se passe le transport ?"
          answerText={
            <p className="text-sm">
              Vous serez pris en charge d&apos;un point de rassemblement situé au sein de votre département jusqu&apos;à votre centre du séjour de cohésion à l&apos;aller et au
              retour. Si exceptionnellement vous êtes affecté au sein de votre département, vous devrez vous rendre au centre du séjour de cohésion et en revenir par vos propres
              moyens.
            </p>
          }
          readMoreLink="https://support.snu.gouv.fr/base-de-connaissance/le-transport"
        />

        <QuestionBlock
          questionText="Que prendre dans ma valise ?"
          answerText={
            <p className="text-sm">
              Une tenue complète vous sera donnée à votre arrivée sur le centre de séjour. Cette tenue est à compléter avec vos effets personnels. Vous pouvez consulter la liste
              des affaires à apporter en cliquant sur “Lire plus”.
            </p>
          }
          readMoreLink="https://support.snu.gouv.fr/base-de-connaissance/dans-ma-valise-materiel-trousseau-copie-copie"
        />

        <a
          className="flex w-full items-center justify-between rounded-lg border-[1px] border-gray-200 py-[22px] px-6 hover:text-inherit"
          href="https://support.snu.gouv.fr/base-de-connaissance/phase-1-le-sejour-de-cohesion"
          target="_blank"
          rel="noreferrer">
          <span className="font-bold">J&apos;ai des questions sur le séjour</span>
          <span className="text-gray-400">
            <ArrowUpRight />
          </span>
        </a>

        <a
          className="flex w-full items-center justify-between rounded-lg border-[1px] border-gray-200 py-[22px] px-6 hover:text-inherit"
          href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/SNU-reglement-interieur-2024.pdf"
          target="_blank"
          rel="noreferrer">
          <span className="font-bold">Lire le règlement intérieur</span>
          <span className="text-gray-400">
            <ArrowUpRight />
          </span>
        </a>
      </div>
    </section>
  );
};

export default FaqAffected;
