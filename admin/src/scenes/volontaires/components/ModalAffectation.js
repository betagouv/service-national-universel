import { DataSearch, ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, Modal, UncontrolledDropdown } from "reactstrap";
import CloseSvg from "../../../assets/Close";
import ModalButton from "../../../components//buttons/ModalButton";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import Chevron from "../../../components/Chevron";
import { BottomResultStats, Filter, MultiLine, ResultTable, Table } from "../../../components/list";
import { Footer, ModalContainer } from "../../../components/modals/Modal";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { getResultLabel, translate, SENDINBLUE_TEMPLATES } from "../../../utils";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import ModalTailwind from "../../../components/modals/ModalTailwind";

export default function ModalAffectations({ isOpen, onCancel, young }) {
  const FILTERS = ["SEARCH"];
  const [modal, setModal] = useState({ isOpen: false, message: "", onConfirm: () => {} });
  const [step, setStep] = useState(1);
  const getDefaultQuery = () => {
    return {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": young.cohort } }, { term: { "status.keyword": "VALIDATED" } }] } },
      track_total_hits: true,
    };
  };
  const handleAffectation = async (center) => {
    try {
      const session = await api.get(`/cohesion-center/${center._id}/cohort/${center.session}/session-phase1`);
      const response = await api.post(`/session-phase1/${session.data._id}/assign-young/${young._id}`);
      if (!response.ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(response.code));
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.PHASE_1_AFFECTATION}`);
      toastr.success(`${response.young.firstName} a été affecté(e) au centre ${center.name} !`);
      setModal((prevState) => ({ ...prevState, isOpen: false }));
      history.go(`/volontaire/${young._id}/phase!`);
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune. Il semblerait que ce centre soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      return toastr.error("Oups, une erreur est survenue lors du traitement de l'affectation du jeune", translate(error?.code));
    }
  };

  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[750px] bg-white rounded-lg shadow-xl py-2 px-8">
      <div className="mb-4 ">
        <div className="flex flex-row w-full justify-between gap-6 mt-6">
          <div className="w-1/3">
            <div className="h-1 bg-blue-600 rounded mb-2" />
            <div className="uppercase text-xs text-blue-600">étape 1</div>
            <div className="text-gray-900 font-medium text-xs">Le centre</div>
          </div>
          <div className="w-1/3">
            <div className={`h-1 ${step > 1 ? "bg-blue-600" : "bg-gray-200"} rounded mb-2`} />
            <div className={`uppercase text-xs ${step > 1 ? "text-blue-600" : "text-gray-500"}`}>étape 2</div>
            <div className="text-gray-900 font-medium text-xs">Le point de rassemblement</div>
          </div>
          <div className="w-1/3">
            <div className={`h-1 ${step > 2 ? "bg-blue-600" : "bg-gray-200"} rounded mb-2`} />
            <div className={`uppercase text-xs ${step > 2 ? "text-blue-600" : "text-gray-500"}`}>étape 3</div>
            <div className="text-gray-900 font-medium text-xs">Résumé</div>
          </div>
        </div>

        <div className="my-4 text-gray-900 text-xl text-center font-medium">Sélectionnez votre centre</div>
        <ReactiveBase url={`${apiURL}/es`} app="sessionphase1" headers={{ Authorization: `JWT ${api.getToken()}` }}>
          <DataSearch
            defaultQuery={getDefaultQuery}
            showIcon={false}
            placeholder="Rechercher par mots clés, ville, code postal..."
            componentId="SEARCH"
            dataField={["nameCentre", "cityCentre", "zipCentre", "codeCentre"]}
            react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
            style={{ marginRight: "1rem", flex: 1 }}
            innerClass={{ input: "searchbox" }}
            className="datasearch-searchfield shadow-sm self-center w-2/3 mx-auto"
            URLParams={true}
            autosuggest={false}
          />
          <div className="reactive-result w-full">
            <ReactiveListComponent
              defaultQuery={getDefaultQuery}
              scrollOnChange={false}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              showTopResultStats={false}
              size={3}
              render={({ data }) => (
                <div className="flex flex-col justify-center items-center gap-4 w-full">
                  {data.map((hit) => (
                    <HitCenter
                      key={hit._id}
                      hit={hit}
                      onSend={(center) =>
                        setModal({
                          isOpen: true,
                          title: "Changement de centre",
                          message: (
                            <p>
                              Voulez-vous affecter <b>{young.firstName}</b> au centre <b>{center.name}</b> au séjour de <b>{center.session}</b>.
                            </p>
                          ),
                          onConfirm: () => handleAffectation(center),
                        })
                      }
                    />
                  ))}
                </div>
              )}
            />
          </div>
        </ReactiveBase>
        <ModalConfirm
          isOpen={modal.isOpen}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          onCancel={() => setModal((prevState) => ({ ...prevState, isOpen: false }))}
        />
      </div>
      <div onClick={onCancel} className="border-[1px] border-gray-300 rounded text-center py-2 text-sm font-medium text-gray-700 cursor-pointer">
        Retour
      </div>
    </ModalTailwind>
  );
}

const HitCenter = ({ hit, onSend }) => {
  return (
    <>
      <hr />
      <div className="flex flex-row gap-4 justify-between items-center w-full px-2">
        <div className="w-1/2">
          <MultiLine>
            <span className="font-bold text-black">{hit.nameCentre}</span>
            <p>{`${hit.cityCentre || ""} • ${hit.department || ""}`}</p>
          </MultiLine>
        </div>
        <div className="w-1/4">
          <div key={hit.cohort} className={`rounded-full text-xs font-medium leading-5 px-3 py-1 w-fit border-[1px] border-[#0C7CFF] text-[#0C7CFF] bg-[#F9FCFF]`}>
            {hit.cohort}
          </div>
        </div>
        <div className="cursor-pointer" onClick={onSend}>
          <RightArrow />
        </div>
      </div>
    </>
  );
};

const RightArrow = () => {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#filter0_d_3100_51832)">
        <rect x="2" y="1" width="38" height="38" rx="19" fill="#2563EB" />
        <path d="M18.5 14.1667L24.3333 20L18.5 25.8334" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <defs>
        <filter id="filter0_d_3100_51832" x="0" y="0" width="42" height="42" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3100_51832" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3100_51832" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};
