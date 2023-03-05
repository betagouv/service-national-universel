import React, { useState } from "react";
import { Modal } from "reactstrap";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, YOUNG_STATUS_PHASE2, translate, WITHRAWN_REASONS } from "../../../utils";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../redux/auth/actions";
import { ACTION_ABANDON, ACTION_DELETE_ACCOUNT, ACTION_WITHDRAW, CONTENT_CHANGE_DATE, CONTENT_CONFIRM, CONTENT_FORM, steps } from "../utils";
import WithdrawFormModalContent from "./WithdrawFormModalContent";
import WithdrawOrChangeDateModalContent from "./WithdrawOrChangeDateModalContent";
import ConfirmationModalContent from "./ConfirmationModalContent";

const WithdrawalModal = ({ isOpen, onCancel: onCancelProps, young }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [step, setStep] = useState(0);

  const onCancel = () => {
    setStep(0);
    setWithdrawnMessage("");
    setWithdrawnReason("");
    onCancelProps();
  };

  const mandatoryPhasesDone = young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED;

  const action = mandatoryPhasesDone
    ? ACTION_DELETE_ACCOUNT
    : [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status)
    ? ACTION_ABANDON
    : ACTION_WITHDRAW;

  async function logout() {
    await api.post(`/young/logout`);
    history.push("/");
    dispatch(setYoung(null));
  }

  const onConfirm = async () => {
    const status = action === ACTION_DELETE_ACCOUNT ? YOUNG_STATUS.DELETED : action === ACTION_WITHDRAW ? YOUNG_STATUS.WITHDRAWN : YOUNG_STATUS.ABANDONED;
    // @todo: is it useful?
    young.historic.push({
      phase: young.phase,
      userName: `${young.firstName} ${young.lastName}`,
      userId: young._id,
      status,
      note: withdrawnMessage && withdrawnReason ? WITHRAWN_REASONS.find((r) => r.value === withdrawnReason)?.label + " " + withdrawnMessage : null,
    });
    try {
      const { ok, code } = await api.put(`/young`, { status, lastStatusAt: Date.now(), ...(withdrawnMessage && withdrawnReason ? { withdrawnMessage, withdrawnReason } : {}) });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      logout();
    } catch (e) {
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  const { content, title, subTitle, confirmButtonName } = steps[action][step];

  return (
    <Modal isOpen={isOpen} onCancel={onCancel} centered size="l">
      <div className="p-6 flex flex-col items-center">
        {content === CONTENT_CHANGE_DATE && (
          <WithdrawOrChangeDateModalContent
            onCancel={onCancel}
            title={title}
            subTitle={subTitle}
            confirmButtonName={confirmButtonName}
            onConfirm={() => setStep(step + 1)}
            onChangeDate={() => history.push("/changer-de-sejour")}
          />
        )}
        {content === CONTENT_FORM && (
          <WithdrawFormModalContent
            withdrawnMessage={withdrawnMessage}
            setWithdrawnMessage={setWithdrawnMessage}
            withdrawnReason={withdrawnReason}
            setWithdrawnReason={setWithdrawnReason}
            onCancel={onCancel}
            title={title}
            subTitle={subTitle}
            confirmButtonName={confirmButtonName}
            onConfirm={() => setStep(step + 1)}
            onBack={() => setStep(step - 1)}
          />
        )}
        {content === CONTENT_CONFIRM && (
          <ConfirmationModalContent onConfirm={onConfirm} onBack={action === ACTION_DELETE_ACCOUNT ? onCancel : () => setStep(step - 1)} title={title} subTitle={subTitle} />
        )}
      </div>
    </Modal>
  );
};

export default WithdrawalModal;
