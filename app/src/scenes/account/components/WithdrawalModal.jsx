import React, { useState } from "react";
import Modal from "../../../components/ui/modals/Modal";
import { YOUNG_STATUS, YOUNG_STATUS_PHASE1, translate, WITHRAWN_REASONS } from "../../../utils";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../redux/auth/actions";
import { ACTION_ABANDON, ACTION_WITHDRAW, CONTENT_CHANGE_DATE, CONTENT_CONFIRM, CONTENT_FORM, steps } from "../utils";
import WithdrawFormModalContent from "./WithdrawFormModalContent";
import WithdrawOrChangeDateModalContent from "./WithdrawOrChangeDateModalContent";
import ConfirmationModalContent from "./ConfirmationModalContent";
import Close from "../../../assets/Close";
import { abandonYoungAccount, withdrawYoungAccount } from "../../../services/young.service";

const WithdrawalModal = ({ isOpen, onCancel: onCancelProps, young }) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const [step, setStep] = useState(0);

  const onCancel = () => {
    if (isLoading) {
      return null;
    }
    setStep(0);
    setWithdrawnMessage("");
    setWithdrawnReason("");
    onCancelProps();
  };

  const action = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status) ? ACTION_ABANDON : ACTION_WITHDRAW;

  const onConfirm = async () => {
    setIsLoading(true);

    try {
      if (action === ACTION_WITHDRAW) {
        const { ok, data, code } = await withdrawYoungAccount({ withdrawnMessage, withdrawnReason });
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        dispatch(setYoung(data));
      }

      if (action === ACTION_ABANDON) {
        const { ok, data, code } = await abandonYoungAccount({ withdrawnMessage, withdrawnReason });
        if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
        dispatch(setYoung(data));
      }

      onCancel();
      history.push("/");
    } catch (e) {
      toastr.error("Oups, une erreur est survenue :", translate(e.code));
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const { content, title, subTitle, confirmButtonName } = steps[action][step];

  return (
    <Modal isOpen={isOpen} onClose={onCancel} className="w-full bg-white md:w-[512px]">
      <div className="flex flex-col p-6 md:items-center">
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
            ).filter((r) => !r.cohortOnly || r.cohortOnly.includes(young.cohort))}
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
          <ConfirmationModalContent
            isLoading={isLoading}
            loadingMessage={loadingMessage}
            onConfirm={onConfirm}
            onBack={() => setStep(step - 1)}
            title={title}
            subTitle={subTitle}
          />
        )}
      </div>
    </Modal>
  );
};

export default WithdrawalModal;
