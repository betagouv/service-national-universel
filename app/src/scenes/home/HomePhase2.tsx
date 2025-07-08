import hero from "../../assets/hero/home.png";
import React, { useState } from "react";
import useAuth from "@/services/useAuth";
import { Link } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";
import ButtonLink from "@/components/ui/buttons/ButtonLink";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import { useMutation } from "@tanstack/react-query";
import API from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate, YOUNG_STATUS_PHASE2 } from "snu-lib";
import { useDispatch } from "react-redux";
import { setYoung } from "@/redux/auth/actions";

export default function HomePhase2() {
  const dispatch = useDispatch();
  const { young } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const { mutate: unsubscribeMissions } = useMutation({
    mutationFn: async () => {
      const { ok, code, data } = await API.put("/young/unsubscribe-missions");
      if (!ok) {
        throw new Error(code);
      }
      return data;
    },
    onSuccess: (data: { statusPhase2: keyof typeof YOUNG_STATUS_PHASE2 }) => {
      toastr.success("Vous ne recevrez plus d'offres de mission.", "");
      dispatch(setYoung({ ...young, statusPhase2: data.statusPhase2 }));
      setShowModal(false);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue", translate(error.message));
      setShowModal(false);
    },
  });

  const { mutate: subscribeMissions } = useMutation({
    mutationFn: async () => {
      const { ok, code, data } = await API.put("/young/subscribe-missions");
      if (!ok) {
        throw new Error(code);
      }
      return data;
    },
    onSuccess: (data: { statusPhase2: keyof typeof YOUNG_STATUS_PHASE2 }) => {
      toastr.success("Vous recevrez désormais les offres de mission.", "");
      dispatch(setYoung({ ...young, statusPhase2: data.statusPhase2 }));
      setShowModal(false);
    },
    onError: (error) => {
      toastr.error("Une erreur est survenue", translate(error.message));
      setShowModal(false);
    },
  });

  return (
    <HomeContainer>
      <HomeHeader title={`${young.firstName}, ${young.gender === "female" ? "prête " : "prêt "} pour la phase engagement ?`} img={hero}>
        <p className="mt-6 leading-relaxed">
          Mettez votre énergie au service d&apos;une société plus solidaire et découvrez votre talent pour l&apos;engagement en réalisant une mission d&apos;intérêt général ou en
          rejoignant un programme d'engagement.
        </p>

        <div className="grid grid-cols-1 mt-8 gap-2 md:max-w-xs">
          <Link
            to="/phase2"
            className="text-center rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
            onClick={() => plausibleEvent("Phase 2/CTA - Realiser ma mission")}>
            Je m&apos;engage
          </Link>

          <Link
            to="/phase1"
            className="text-center rounded-[10px] border-[1px] border-blue-600 bg-white py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:!bg-blue-600 hover:!text-white">
            Voir les détails de ma phase 1
          </Link>

          {young.statusPhase2 !== YOUNG_STATUS_PHASE2.DESENGAGED ? (
            <ButtonLink onClick={() => setShowModal(true)}>Je ne souhaite plus recevoir d’offres de mission</ButtonLink>
          ) : (
            <ButtonLink onClick={() => setShowModal(true)}>Je souhaite de nouveau recevoir les offres de mission</ButtonLink>
          )}
        </div>

        {young.statusPhase2 !== YOUNG_STATUS_PHASE2.DESENGAGED ? (
          <ConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Je ne souhaite plus recevoir d’offres de mission"
            subTitle="Votre référent ne pourra plus vous envoyer des propositions de MIG et vous ne serez plus informé des nouvelles offres publiées."
            onConfirm={() => unsubscribeMissions()}
            onCancel={() => setShowModal(false)}
          />
        ) : (
          <ConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Je souhaite de nouveau recevoir les offres de mission"
            subTitle="Votre référent pourra de nouveau vous envoyer des propositions de MIG et vous recevrez à nouveau les nouvelles offres publiées."
            onConfirm={() => subscribeMissions()}
            onCancel={() => setShowModal(false)}
          />
        )}
      </HomeHeader>
    </HomeContainer>
  );
}
