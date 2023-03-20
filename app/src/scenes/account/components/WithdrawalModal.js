import React, { useState } from "react";
import Modal from "../../../components/ui/modals/Modal";
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
import Close from "../../../assets/Close";
import { deleteYoungAccount, logoutYoung } from "../../../services/young.service";

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

  const onConfirm = async () => {
    const status = action === ACTION_DELETE_ACCOUNT ? YOUNG_STATUS.DELETED : action === ACTION_WITHDRAW ? YOUNG_STATUS.WITHDRAWN : YOUNG_STATUS.ABANDONED;
    try {
      if (action === ACTION_DELETE_ACCOUNT) {
        const { ok, code } = await deleteYoungAccount(young._id);
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        await logoutYoung();
        dispatch(setYoung(null));
      } else {
        const { ok, data, code } = await api.put(`/young`, {
          status,
          lastStatusAt: Date.now(),
          ...(withdrawnMessage && withdrawnReason ? { withdrawnMessage, withdrawnReason } : {}),
        });
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        dispatch(setYoung(data));
      }
      onCancel();
      history.push("/");
    } catch (e) {
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  console.log(young.historic);

  const { content, title, subTitle, confirmButtonName } = steps[action][step];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="bg-white w-full md:w-[512px]">
      <div className="p-6 flex flex-col md:items-center">
        <Close height={10} width={10} onClick={onCancel} className="self-end md:hidden" />
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
            withdrawnReasons={WITHRAWN_REASONS.filter(
              (r) => !r.phase2Only || young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED,
            )}
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
