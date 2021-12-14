import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";

import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, translate, WITHRAWN_REASONS } from "../../utils";
import ComponentConfirm from "./components/ComponentConfirm";
import ComponentWithdrawn from "./components/ComponentWithdrawn";
import api from "../../services/api";
import { setYoung } from "../../redux/auth/actions";

export default function Desistement() {
  const young = useSelector((state) => state.Auth.young);
  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;
  const dispatch = useDispatch();

  const onConfirm = async (status, values) => {
    young.historic.push({
      phase: young.phase,
      userName: `${young.firstName} ${young.lastName}`,
      userId: young._id,
      status,
      note: WITHRAWN_REASONS.find((r) => r.value === values.withdrawnReason)?.label + " " + values.withdrawnMessage,
    });
    try {
      const { ok, code } = await api.put(`/young`, { ...values, status, lastStatusAt: Date.now() });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      logout();
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  async function logout() {
    await api.post(`/young/logout`);
    dispatch(setYoung(null));
  }

  return (
    <>
      {mandatoryPhasesDone ? (
        <ComponentConfirm
          title="Suppression du compte SNU"
          message="Vous êtes sur le point de supprimer votre compte. Vous serez immédiatement déconnecté(e). Souhaitez-vous réellement supprimer votre compte ?"
          onConfirm={() => {
            onConfirm(YOUNG_STATUS.DELETED);
          }}
        />
      ) : (
        <ComponentWithdrawn
          title="Vous souhaitez vous désister ?"
          message="Précisez la raison de votre désistement"
          placeholder="Précisez en quelques mots la raison de votre désistement"
          onConfirm={(values) => {
            onConfirm(YOUNG_STATUS.WITHDRAWN, values);
          }}
        />
      )}
    </>
  );
}
