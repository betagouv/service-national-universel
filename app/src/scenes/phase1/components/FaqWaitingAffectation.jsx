import React from "react";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import QuestionBlock from "./QuestionBlock";

const FaqWaitingAffectation = () => {
  return (
    <section className="mb-14">
      <h2 className="m-0 mb-4 text-xl font-bold">Questions fréquentes</h2>
      <div className="flex flex-col gap-4">
        <QuestionBlock
          questionText="Quand vais-je connaître mon lieu d'affectation ?"
          answerText={
            <>
              <p className="m-0 text-sm">
                Quelques semaines avant votre départ, vous recevrez un email pour vous indiquer que votre affectation est disponible sur votre compte volontaire. Le séjour approche
                et vous ne connaissez pas votre lieu d&apos;affectation ? Pas d&apos;inquiétude, nous ne vous avons pas oublié. Les affectations sont en cours.
              </p>
            </>
          }
        />
        <QuestionBlock
          questionText="Comment se passe le transport ?"
          answerText={
            <>
              <p className="m-0 text-sm">
                Vous serez pris en charge d&apos;un point de rassemblement situé au sein de votre département jusqu&apos;à votre centre du séjour de cohésion à l&apos;aller et au
                retour. Si exceptionnellement vous êtes affecté au sein de votre département, vous devrez vous rendre au centre du séjour de cohésion et en revenir par vos propres
                moyens.
              </p>
            </>
          }
          readMoreLink="https://support.snu.gouv.fr/base-de-connaissance/le-transport"
        />
        <QuestionBlock
          questionText="Pourquoi est-ce que je ne peux pas demander à être avec un(e) ami(e) ?"
          answerText={
            <p className="m-0 text-sm">
              Les principes du SNU étant la mixité et le brassage social et territorial, il n&apos;est pas possible de constituer des binômes ou des équipes définies.
              Rassurez-vous, tous les volontaires sont dans la même situation. Vous verrez, vous vous lierez d&apos;amitié rapidement avec d&apos;autres volontaires sur place !
            </p>
          }
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
      </div>
    </section>
  );
};

export default FaqWaitingAffectation;
