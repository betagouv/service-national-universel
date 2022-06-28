import React from "react";
import Hammer from "../../../assets/icons/Hammer";
import { HiOutlineSearch, HiOutlineAdjustments } from "react-icons/hi";
import Screwdriver from "../../../assets/icons/Screwdriver";
import AdjustableWrench from "../../../assets/icons/AdjustableWrench";
import ProposalMission from "../view/proposalMission";
import CreateMission from "../view/createMission";
import { useHistory } from "react-router-dom";

export default function Toolbox({ young }) {
  const [openProposalMission, setOpenProposalMission] = React.useState(false);
  const [openCreateMission, setOpenCreateMission] = React.useState(false);
  const history = useHistory();

  return (
    <div className="flex flex-col">
      <div className="text-2xl leading-8 font-bold">Mes outils pour aider mon volontaire</div>
      <div className="flex items-stretch gap-3 my-4">
        <div className="flex flex-col bg-white rounded-xl shadow-block p-4 basis-1/3">
          <div className="flex items-center gap-6 mb-4 flex-1">
            <Hammer />
            <div className="flex flex-col gap-2 flex-1">
              <div className="text-lg font-bold">Proposer une mission existante</div>
              <div className="text-gray-600">Trouvez une mission existante et proposez-là au volontaire.</div>
            </div>
          </div>
          <button
            className="group flex gap-1 rounded-[10px] border-[1px] py-2 items-center justify-center border-blue-600 hover:border-[#4881FF] bg-blue-600 hover:bg-[#4881FF]"
            onClick={() => {
              setOpenCreateMission(false);
              setOpenProposalMission(!openProposalMission);
            }}>
            <HiOutlineSearch className="text-blue-300 w-5 h-5" />
            <div className="text-blue-100 group-hover:text-white text-sm ">Trouver une mission</div>
          </button>
        </div>
        <div className="flex flex-col bg-white rounded-xl shadow-block p-4 basis-1/3">
          <div className="flex items-center gap-6 mb-4 flex-1">
            <Screwdriver />
            <div className="flex flex-col gap-2 flex-1">
              <div className="text-lg font-bold">Déclarer une équivalence MIG</div>
              <div className="text-gray-600">Reconnaissez l’engagement externe du volontaire comme équivalence MIG.</div>
            </div>
          </div>
          <button className="group flex gap-1 rounded-[10px] border-[1px] py-2 items-center justify-center border-blue-600 hover:border-[#4881FF] bg-blue-600 hover:bg-[#4881FF]">
            <div className="text-blue-100 group-hover:text-white text-sm ">Déclarer une équivalence MIG</div>
          </button>
        </div>
        <div className="flex flex-col bg-white rounded-xl shadow-block p-4 basis-1/3">
          <div className="flex items-center gap-6 mb-4 flex-1">
            <AdjustableWrench />
            <div className="flex flex-col gap-2 flex-1">
              <div className="text-lg font-bold">Créer une mission personnalisée</div>
              <div className="text-gray-600">Renseignez une mission non existante pour le volontaire.</div>
            </div>
          </div>
          <button
            className="group flex gap-1 rounded-[10px] border-[1px] py-2 items-center justify-center border-blue-600 hover:border-[#4881FF] bg-blue-600 hover:bg-[#4881FF]"
            onClick={() => {
              setOpenProposalMission(false);
              setOpenCreateMission(!openCreateMission);
            }}>
            <HiOutlineAdjustments className="text-blue-300 w-5 h-5" />
            <div className="text-blue-100 group-hover:text-white text-sm ">Créer une mission personnalisée</div>
          </button>
        </div>
      </div>
      {openProposalMission ? (
        <div className="bg-white rounded-xl px-2 pb-2.5">
          <ProposalMission young={young} onSend={() => history.go(0)} />{" "}
        </div>
      ) : null}
      {openCreateMission ? (
        <div className="bg-white rounded-xl">
          <CreateMission young={young} onSend={() => history.go(0)} />{" "}
        </div>
      ) : null}
    </div>
  );
}
