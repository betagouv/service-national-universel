import React from "react";
import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import Unlock from "../../../../assets/icons/Unlock";
import AttestationButton from "./components/AttestationButton";
import InfoConvocation from "../../components/modals/InfoConvocation";
import { isCohortDone } from "../../../../utils/cohorts";
import hero from "../../../../assets/hero/phase1.png";
import JDCDone from "./components/JDCDone";
import JDCNotDone from "./components/JDCNotDone";
import JDMDone from "./components/JDMDone";
import JDMNotDone from "./components/JDMNotDone";
import NextStep from "./components/NextStep";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import Notice from "@/components/ui/alerts/Notice";
import dayjs from "dayjs";

export default function Done() {
  const { young } = useAuth();
  const { cohort, isCohortNeedJdm } = useCohort();
  const [modalOpen, setModalOpen] = React.useState(false);
  const showJDM = young.frenchNationality === "true";
  const cohortEndDate = dayjs(cohort.dateEnd);
  const cohortEndDatePlusFifteenDays = cohortEndDate.add(15, "day").format("DD/MM/YYYY");

  async function handleClickModal() {
    setModalOpen(true);
  }

  const title = `${young.firstName}, vous avez validé votre Phase 1 !`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="mt-3 ">
          <p className="text-sm leading-relaxed text-gray-500">Vous avez réalisé votre séjour de cohésion.</p>
          <p className="text-sm  leading-relaxed text-gray-500">Bravo pour votre participation à cette aventure unique !</p>
        </div>

        <div className="mt-4 flex items-center gap-5">
          {!isCohortDone(cohort, 3) && (
            <>
              <button className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs font-medium leading-4 hover:border-gray-500" onClick={handleClickModal}>
                Mes informations de retour de séjour
              </button>
              <InfoConvocation isOpen={modalOpen} onCancel={() => setModalOpen(false)} />
            </>
          )}

          {isCohortDone(cohort, 15) ? <AttestationButton /> : <Notice>Votre attestation de réalisation de la phase 1 sera disponible le {cohortEndDatePlusFifteenDays}.</Notice>}
        </div>
      </HomeHeader>

      <div className="mt-12 grid gap-16">
        <div className="flex flex-col md:flex-row gap-12 md:gap-4">
          <div className="md:w-2/5 flex flex-col items-center gap-3 md:border-r md:pr-4 md:mr-4">
            <Unlock />
            <div className="text-center text-xl font-bold leading-7">Le code de la route, c’est facile !</div>
            <div className="text-center text-xs font-medium leading-relaxed text-gray-500">
              Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la plateforme en ligne d’apprentissage du code de la route.{" "}
            </div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
              className="mt-3 cursor-pointer rounded-lg border-[1px] border-blue-700 px-12 py-2 text-sm font-medium leading-5 text-blue-700 transition duration-100 ease-in-out hover:bg-blue-700 hover:text-white">
              Plus d’informations
            </a>
          </div>

          <div className="md:w-3/5">
            {showJDM && (isCohortNeedJdm ? young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone /> : young.cohesionStayPresence === "true" ? <JDCDone /> : <JDCNotDone />)}
          </div>
        </div>

        <NextStep />
      </div>
    </HomeContainer>
  );
}
