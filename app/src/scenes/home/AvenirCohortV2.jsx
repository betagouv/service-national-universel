import React from "react";
import useAuth from "@/services/useAuth";
import Img3 from "../../assets/homePhase2Mobile.png";
import Img2 from "../../assets/homePhase2Desktop.png";
import Clock from "../../assets/icons/Clock";
import { YOUNG_STATUS } from "snu-lib";

const YoungStatusConfig = [
  {
    statuses: [YOUNG_STATUS.WAITING_LIST, YOUNG_STATUS.VALIDATED],
    title: (young) => `Bonjour ${young.firstName} ${young.lastName},`,
    message: "Votre inscription a été reportée sur un prochain séjour dont les dates vous seront communiquées ultérieurement.",
  },
  {
    statuses: [YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION],
    title: (young) =>
      young.status === YOUNG_STATUS.WAITING_VALIDATION ? "Votre dossier d'inscription n'a pas été validé à temps." : "Votre dossier d'inscription n'a pas été corrigé à temps.",
    message:
      "Les inscriptions ont été clôturées pour les sessions du premier semestre de l'année en cours. Votre inscription a toutefois été reportée sur un prochain séjour dont les dates vous seront communiquées prochainement.",
  },
];

const MessageComponent = ({ title, message }) => (
  <main className="bg-white md:rounded-xl shadow-sm md:m-8 flex flex-col md:flex-row max-w-7xl pb-20 md:pb-0">
    <img className="block md:hidden" src={Img3} />
    <div className="px-[1rem] md:p-[4rem]">
      <h1 className="text-3xl md:text-5xl md:mb-16 max-w-lg">{title}</h1>
      <hr className="my-4" />
      <div className="flex gap-6">
        <div className="flex-1">
          <Clock />
        </div>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
      <hr className="my-4" />
    </div>
    <img className="flex-1 hidden xl:block" src={Img2} />
  </main>
);

const AvenirCohort = () => {
  const { young } = useAuth();

  const config = YoungStatusConfig.find((conf) => conf.statuses.includes(young.status));

  return <MessageComponent title={config.title(young)} message={config.message} />;
};

export default AvenirCohort;
