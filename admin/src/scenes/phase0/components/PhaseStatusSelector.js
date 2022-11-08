import React, { useEffect, useRef, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { translate } from "snu-lib";
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
        tags = ["AFFECTED", "WAITING_AFFECTATION", "WAITING_ACCEPTATION", "CANCEL", "EXEMPTED", "DONE", "NOT_DONE", "WITHDRAWN", "WAITING_LIST"];
        break;
      case 2:
        tags = ["WAITING_REALISATION", "IN_PROGRESS", "VALIDATED", "WITHDRAWN"];
        break;
      case 3:
        tags = ["WAITING_REALISATION", "WAITING_VALIDATION", "VALIDATED", "WITHDRAWN"];
        break;
      default:
        tags = [];
        break;
    }

    setPhaseStatuses(
      tags.map((t) => (
        <div
          key={t}
          className={`flex items-center px-[16px] py-[8px] whitespace-nowrap rounded-b-[6px] bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#374151] text-[14px] ${
            young[`statusPhase${statusOpened}`] === t ? "font-medium" : "cursor-pointer"
          }`}
          onClick={() => confirmChangePhaseStatus(statusOpened, t)}>
          {young[`statusPhase${statusOpened}`] === t && <Check />}
          <div className="ml-[6px]">{translate(t)}</div>
        </div>
      )),
    );
  }, [statusOpened, young]);

  function confirmChangePhaseStatus(phase, status) {
    setConfirmChangeModal({
      phase,
      fromStatus: young[`statusPhase${phase}`],
      toStatus: status,
      message: (
        <div>
          Voulez-vous vraiment modifier le statut de la phase {confirmChangeModal.phase}
          <br />
          du statut <b>{translate(confirmChangeModal.fromStatus)}</b> au statut <b>{translate(confirmChangeModal.toStatus)}</b>.
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
      <div ref={containerRef} className={`relative bg-white border-[#D1D5DB] border-[1px] rounded-[6px] border-[#D1D5DB]`}>
        <div className="p-[13px] flex items-center cursor-pointer" onClick={() => setPhaseChoiceOpened(!phaseChoiceOpened)}>
          <div className="text-[#6B7280] text-[14px] whitespace-nowrap">Statuts de phases</div>
          <ChevronDown className="text-[#1F2937] ml-[8px]" />
        </div>
        {phaseChoiceOpened && (
          <div className="absolute z-10 mt-[8px] top-[100%] right-[0px] border-[#E5E7EB] border-[1px] rounded-[6px] bg-[#FFFFFF] text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)]">
            <div
              className={`flex items-center px-[16px] py-[8px] whitespace-nowrap rounded-t-[6px] ${
                statusOpened === 1 ? "bg-[#F3F4F6]" : "bg-[#FFFFFF] hover:bg-[#F3F4F6] cursor-pointer"
              }`}
              onClick={() => setStatusOpened(1)}>
              <div className="text-[14px] text-[#111827] mr-[9px]">Phase 1</div>
              <div className="grow text-[12px] text-[#6B7280]">{translate(young.statusPhase1)}</div>
              <ChevronRight className="text-[#1F2937] ml-[9px]" />
            </div>
            <div
              className={`flex items-center px-[16px] py-[8px] whitespace-nowrap ${statusOpened === 2 ? "bg-[#F3F4F6]" : "bg-[#FFFFFF] hover:bg-[#F3F4F6] cursor-pointer"}`}
              onClick={() => setStatusOpened(2)}>
              <div className="text-[14px] text-[#111827] mr-[9px]">Phase 2</div>
              <div className="grow text-[12px] text-[#6B7280]">{translate(young.statusPhase2)}</div>
              <ChevronRight className="text-[#1F2937] ml-[9px]" />
            </div>
            <div
              className={`flex items-center px-[16px] py-[8px] whitespace-nowrap rounded-b-[6px] ${
                statusOpened === 3 ? "bg-[#F3F4F6]" : "bg-[#FFFFFF] hover:bg-[#F3F4F6] cursor-pointer"
              }`}
              onClick={() => setStatusOpened(3)}>
              <div className="text-[14px] text-[#111827] mr-[9px]">Phase 3</div>
              <div className="grow text-[12px] text-[#6B7280]">{translate(young.statusPhase3)}</div>
              <ChevronRight className="text-[#1F2937] ml-[9px]" />
            </div>
            {statusOpened > 0 && (
              <div className="absolute z-10 mr-[4px] top-[0px] right-[100%] border-[#E5E7EB] border-[1px] rounded-[6px] bg-[#FFFFFF] text-[#1F2937] shadow-[0px_8px_16px_-3px_rgba(0,0,0,0.05)] overflow-hidden">
                {phaseStatuses}
              </div>
            )}
          </div>
        )}
      </div>
      {confirmChangeModal && (
        <ConfirmationModal
          isOpen={true}
          icon={<Warning className="text-[#D1D5DB] w-[36px] h-[36px]" />}
          title={"Changement de statut"}
          message={confirmChangeModal.message}
          confirmText="Confirmer le changement"
          onCancel={() => setConfirmChangeModal(null)}
          onConfirm={() => changePhaseStatus(confirmChangeModal.phase, confirmChangeModal.toStatus)}
        />
      )}
    </>
  );
}
