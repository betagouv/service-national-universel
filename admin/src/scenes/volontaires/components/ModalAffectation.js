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
import { getResultLabel, translate, SENDINBLUE_TEMPLATES, ES_NO_LIMIT, formatStringDateWithDayTimezoneUTC } from "../../../utils";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import ChevronRight from "../../../assets/icons/ChevronRight";

const LIST_PAGE_LIMIT = 3;

export default function ModalAffectations({ isOpen, onCancel, young }) {
  const FILTERS = ["SEARCH"];
  const [modal, setModal] = useState({ isOpen: false, message: "", onConfirm: () => {} });
  const [center, setCenter] = useState(null);
  const [step, setStep] = useState(1);
  const [pdrOption, setPdrOption] = useState("");

  const [loadingPdr, setLoadingPdr] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPdr, setInputPdr] = useState("");
  const [dataPdr, setDataPdr] = useState([]);
  const [dataLigneToPoint, setDataLigneToPoint] = useState([]);

  useEffect(() => {
    if (pdrOption !== "ref-select") return;
    loadList();
  }, [inputPdr, pdrOption]);

  const getDefaultQuery = () => {
    return {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": young.cohort } }, { term: { "status.keyword": "VALIDATED" } }] } },
      track_total_hits: true,
    };
  };
  const getDefaultQueryPdr = () => {
    // cohorts
    return {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohorts.keyword": young.cohort } }] } },
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

  async function loadList() {
    //setLoadingPdr(loadingPdr + 1);
    try {
      let url = "/point-de-rassemblement/ligneToPoint";
      url += "/" + young.cohort + "/" + center.cohesionCenterId;
      console.log(center);
      url += "?offset=" + currentPage * LIST_PAGE_LIMIT + "&limit=" + LIST_PAGE_LIMIT;
      url += "&filter=" + encodeURIComponent(inputPdr);

      const result = await api.get(url);
      if (result.ok) {
        setCurrentPage(0);
        console.log(result);
        //setDataPdr(result.data.pdrListToCenterArray);
        //setDataLigneBus(result.data.ligneBusArray);
        setDataPdr(result.data.map((el) => el.meetingPoint[0]));
        setDataLigneToPoint(result.data);
      } else {
        setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      }
    } catch (err) {
      //capture(err);
      setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
    }
    //setLoadingPdr(loadingPdr - 1);
  }

  return (
    <ModalTailwind centered isOpen={isOpen} onClose={onCancel} className="w-[850px] bg-white rounded-lg py-2 px-8">
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

        {step === 1 && (
          <>
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
                          onSend={() => {
                            setStep(2);
                            setCenter(hit);
                          }}
                        />
                      ))}
                    </div>
                  )}
                />
              </div>
            </ReactiveBase>
          </>
        )}

        {step === 2 && (
          <>
            {pdrOption === "" && (
              <>
                <div className="my-4 text-gray-900 text-xl text-center font-medium">Choix du point de rassemblement</div>
                <div className="flex flex-row flex-wrap gap-4 px-4">
                  <div
                    onClick={() => setPdrOption("ref-select")}
                    className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="text-sm w-5/6">
                      <span className="font-bold">Je choisis</span> un point de rassemblement
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="text-sm w-5/6">
                      <span className="font-bold">Je laisse {young.firstName} choisir</span> son point de rassemblement
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="text-sm w-5/6">
                      {young.firstName} se rendra au centre et en reviendra <span className="font-bold">par ses propres moyens</span>
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="text-sm w-5/6">
                      Plan de transport <span className="font-bold">transmis par les services locaux</span>
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                </div>
              </>
            )}
            {pdrOption === "ref-select" && (
              <>
                <div className="my-4 text-gray-900 text-xl text-center font-medium">Sélectionnez votre point de rassemblement</div>
                <div className="datasearch-searchfield shadow-sm self-center w-2/3 mx-auto">
                  <input className="searchbox" placeholder="Rechercher un point de rassemblement" value={inputPdr} onChange={(e) => setInputPdr(e.target.value)} />
                </div>

                <div className="flex flex-col justify-center items-center gap-4 w-full">
                  {dataPdr.map((hit) => (
                    <HitPdr
                      key={hit._id}
                      hit={hit}
                      ligneBus={dataLigneToPoint.filter((e) => e.meetingPointId === hit._id)[0]}
                      onSend={() => {
                        setStep(2);
                        setCenter(hit);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <ModalConfirm
          isOpen={modal.isOpen}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          onCancel={() => setModal((prevState) => ({ ...prevState, isOpen: false }))}
        />
      </div>
      <div
        onClick={() => {
          if (step === 1) return onCancel();
          if (step === 2 && pdrOption !== "") return setPdrOption("");
          setStep((step) => step - 1);
        }}
        className="border-[1px] border-gray-300 rounded text-center py-2 text-sm font-medium text-gray-700 cursor-pointer mb-2">
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

const HitPdr = ({ hit, onSend, ligneBus }) => {
  return (
    <>
      <hr />
      <div className="flex flex-row gap-4 justify-between items-center w-full px-2">
        <div className="w-1/2">
          <MultiLine>
            <span className="font-bold text-black">{hit.name}</span>
            <p>{`${hit.department || ""} • ${hit.address || ""}, ${hit.zip || ""} ${hit.city || ""}`}</p>
          </MultiLine>
        </div>
        <div className="w-1/3 text-xs text-[#738297]">
          Num. transport <span className="text-gray-900">{ligneBus?.busId}</span>
        </div>
        <div className="w-1/2 flex flex-col">
          <div className="text-xs text-[#738297]">
            Départ :{" "}
            <span className="text-gray-900 capitalize">
              {formatStringDateWithDayTimezoneUTC(ligneBus?.departuredDate)} {ligneBus?.lignetopoint.meetingHour}
            </span>
          </div>
          <div className="text-xs text-[#738297]">
            Retour :{" "}
            <span className="text-gray-900 capitalize">
              {formatStringDateWithDayTimezoneUTC(ligneBus?.returnDate)} {ligneBus?.lignetopoint.returnHour}
            </span>
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
        <path d="M18.5 14.1667L24.3333 20L18.5 25.8334" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <filter id="filter0_d_3100_51832" x="0" y="0" width="42" height="42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
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
