import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { YOUNG_STATUS_PHASE3, translate, translatePhase1 } from "snu-lib";
import Check from "../../../assets/icons/Check";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import Warning from "../../../assets/icons/Warning";
import ConfirmationModal from "./ConfirmationModal";

export default function PhaseStatusSelector({ young, onChange }) {
  const [phaseChoiceOpened, setPhaseChoiceOpened] = useState(false);
  const [statusOpened, setStatusOpened] = useState(0);
  const [phaseStatuses, setPhaseStatuses] = useState([]);
  const [confirmChangeModal, setConfirmChangeModal] = useState(null);

  const containerRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current) {
        let target = e.target;
        while (target) {
          if (target === containerRef.current) {
            return;
          }
          target = target.parentNode;
        }
        setPhaseChoiceOpened(false);
        setStatusOpened(0);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    let tags;
    switch (statusOpened) {
      case 1:
        tags = ["AFFECTED", "WAITING_AFFECTATION", "EXEMPTED", "DONE", "NOT_DONE"]; //"WAITING_LIST", "WAITING_ACCEPTATION", "CANCEL", "WITHDRAWN"
        break;
      case 2:
        tags = ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED"]; //, "WITHDRAWN"
        break;
      case 3:
        tags = ["WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED"]; //, "WITHDRAWN"
        break;
      default:
        tags = [];
        break;
    }

    setPhaseStatuses(
      tags.map((t) => (
        <div
          key={t}
          className={`flex items-center whitespace-nowrap rounded-b-[6px] bg-[#FFFFFF] px-[16px] py-[8px] text-[14px] text-[#374151] hover:bg-[#F3F4F6] ${
            young[`statusPhase${statusOpened}`] === t ? "font-medium" : "cursor-pointer"
          }`}
          onClick={() => confirmChangePhaseStatus(statusOpened, t)}>
          {young[`statusPhase${statusOpened}`] === t && <Check />}
          <div className="ml-[6px]">{statusOpened === 1 ? translatePhase1(t) : translate(t)}</div>
        </div>
      )),
    );
  }, [statusOpened, young]);

  function confirmChangePhaseStatus(phase, status) {
    setConfirmChangeModal({
      phase,
      status,
      message: (
        <div>
          Voulez-vous vraiment modifier le statut de la phase {phase}
          <br />
          du statut <b>{translate(young[`statusPhase${phase}`])}</b> au statut <b>{translate(status)}</b>.
        </div>
      ),
    });
  }

  async function changePhaseStatus(phase, status) {
    if (young[`statusPhase${phase}`] !== status) {
      console.log("set phase, status: ", phase, status);
      setStatusOpened(0);
      setPhaseChoiceOpened(false);

      try {
        const result = await api.put(`/young-edition/${young._id}/phasestatus`, { [`statusPhase${phase}`]: status });
        if (result.ok) {
          toastr.success("Le nouveau statut a bien été modifié.");
          onChange && onChange();
        } else {
          toastr.error("Erreur !", "Nous n'avons pas pu enregistrer le changement de statut. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        console.log(err);
        toastr.error("Erreur !", "Nous n'avons pas pu enregistrer le changement de statut. Veuillez réessayer dans quelques instants.");
      }
    }
  }

  return (
    <>
      <div ref={containerRef} className={`relative rounded-[6px] border-[1px] border-[#D1D5DB] border-[#D1D5DB] bg-white`}>
        <div className="flex cursor-pointer items-center p-[13px]" onClick={() => setPhaseChoiceOpened(!phaseChoiceOpened)}>
          <div className="whitespace-nowrap text-[14px] text-[#6B7280]">Statuts de phases</div>
          <ChevronDown className="ml-[8px] text-[#1F2937]" />
        </div>
        {phaseChoiceOpened && (
          <div className="absolute top-[100%] right-[0px] z-10 mt-[8px] rounded-[6px] border-[1px] border-[#E5E7EB] bg-[#FFFFFF] text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <div
              className={`flex items-center whitespace-nowrap rounded-t-[6px] px-[16px] py-[8px] ${
                statusOpened === 1 ? "bg-[#F3F4F6]" : "cursor-pointer bg-[#FFFFFF] hover:bg-[#F3F4F6]"
              }`}
              onClick={() => setStatusOpened(1)}>
              <div className="mr-[9px] text-[14px] text-[#111827]">Phase 1</div>
              <div className="grow text-[12px] text-[#6B7280]">{translatePhase1(young.statusPhase1)}</div>
              <ChevronRight className="ml-[9px] text-[#1F2937]" />
            </div>
            <div
              className={`flex items-center whitespace-nowrap px-[16px] py-[8px] ${statusOpened === 2 ? "bg-[#F3F4F6]" : "cursor-pointer bg-[#FFFFFF] hover:bg-[#F3F4F6]"}`}
              onClick={() => setStatusOpened(2)}>
              <div className="mr-[9px] text-[14px] text-[#111827]">Phase 2</div>
              <div className="grow text-[12px] text-[#6B7280]">{translate(young.statusPhase2)}</div>
              <ChevronRight className="ml-[9px] text-[#1F2937]" />
            </div>
            {[YOUNG_STATUS_PHASE3.WAITING_VALIDATION, YOUNG_STATUS_PHASE3.VALIDATED].includes(young.statusPhase3) && (
              <div
                className={`flex items-center whitespace-nowrap rounded-b-[6px] px-[16px] py-[8px] ${
                  statusOpened === 3 ? "bg-[#F3F4F6]" : "cursor-pointer bg-[#FFFFFF] hover:bg-[#F3F4F6]"
                }`}
                onClick={() => setStatusOpened(3)}>
                <div className="mr-[9px] text-[14px] text-[#111827]">Phase 3</div>
                <div className="grow text-[12px] text-[#6B7280]">{translate(young.statusPhase3)}</div>
                <ChevronRight className="ml-[9px] text-[#1F2937]" />
              </div>
            )}
            {statusOpened > 0 && (
              <div className="absolute top-[0px] right-[100%] z-10 mr-[4px] overflow-hidden rounded-[6px] border-[1px] border-[#E5E7EB] bg-[#FFFFFF] text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
                {phaseStatuses}
              </div>
            )}
          </div>
        )}
      </div>
      {confirmChangeModal && (
        <ConfirmationModal
          isOpen={true}
          icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
          title={"Changement de statut"}
          message={confirmChangeModal.message}
          confirmText="Confirmer le changement"
          onCancel={() => setConfirmChangeModal(null)}
          onConfirm={() => changePhaseStatus(confirmChangeModal.phase, confirmChangeModal.status)}
        />
      )}
    </>
  );
}
