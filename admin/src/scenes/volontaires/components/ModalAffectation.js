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
import { getResultLabel, translate, SENDINBLUE_TEMPLATES, ES_NO_LIMIT, formatStringDateWithDayTimezoneUTC, sessions2023 } from "../../../utils";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import ChevronRight from "../../../assets/icons/ChevronRight";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import LinearIceBerg from "../../../assets/Linear-IceBerg";
import LinearMap from "../../../assets/Linear-Map";
import dayjs from "dayjs";

const LIST_PAGE_LIMIT = 3;

export default function ModalAffectations({ isOpen, onCancel, young, center = null, sessionId = null }) {
  const FILTERS = ["SEARCH"];
  const [modal, setModal] = useState({ isOpen: false, message: "", onConfirm: () => {} });
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(1);
  const [pdrOption, setPdrOption] = useState("");
  const [loading, setLoading] = useState(false);

  const [loadingPdr, setLoadingPdr] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [inputPdr, setInputPdr] = useState("");
  const [dataPdr, setDataPdr] = useState([]);
  const [dataLigneToPoint, setDataLigneToPoint] = useState([]);
  const [selectedPdr, setSelectedPdr] = useState(null);
  const [sessionSearch, setSessionSearch] = useState("");

  const sessionObject = sessions2023.find((s) => s.name === young.cohort);

  // true à J - 12 du départ
  const youngSelectDisabled = !dayjs(sessionObject?.dateStart).subtract(12, "day").isAfter(dayjs());

  const closeModal = () => {
    setInputPdr("");
    setPdrOption("");
    setStep(1);
    setSessionSearch("");
    onCancel();
  };

  useEffect(() => {
    if (pdrOption !== "ref-select") return;
    loadList();
  }, [inputPdr, pdrOption]);

  useEffect(() => {
    if (!center) {
      setPdrOption("");
      return setStep(1);
    }
    (async () => {
      try {
        const { data, ok } = await api.get("/session-phase1/" + sessionId);
        if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération de la session", translate(data.code));
        setSession(data);
        setStep(2);
        setPdrOption("ref-select");
      } catch (e) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la session", e);
        console.log(e);
      }
    })();
  }, [center]);

  const getDefaultQuery = () => {
    return {
      // query sur les sessions qui ont des places dispos
      query: {
        bool: {
          must: { match_all: {} },
          filter: [{ term: { "cohort.keyword": young.cohort } }, { term: { "status.keyword": "VALIDATED" } }, { range: { placesLeft: { gt: 0 } } }],
        },
      },
      track_total_hits: true,
    };
  };
  const handleAffectation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/young/${young._id}/phase1/affectation`, {
        centerId: session.cohesionCenterId,
        sessionId: session._id,
        pdrOption,
        meetingPointId: selectedPdr?.pdr._id,
        ligneId: selectedPdr?.ligneBus._id,
      });
      if (!response.ok) return toastr.error("Oups, une erreur est survenue lors de l'affectation du jeune", translate(response.code));
      /*
      await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.PHASE_1_AFFECTATION}`);
      */
      setModal((prevState) => ({ ...prevState, isOpen: false }));
      toastr.success(`L'affectation du jeune a bien été effectuée`);
      history.go(`/volontaire/${young._id}/phase1`);
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
    setLoadingPdr(true);
    try {
      let url = "/point-de-rassemblement/ligneToPoint";
      url += "/" + young.cohort + "/" + session.cohesionCenterId;
      url += "?offset=" + currentPage * LIST_PAGE_LIMIT + "&limit=" + LIST_PAGE_LIMIT;
      url += "&filter=" + encodeURIComponent(inputPdr);

      const result = await api.get(url);
      if (result.ok) {
        setCurrentPage(0);
        setDataPdr(result.data.map((el) => el.meetingPoint));
        setDataLigneToPoint(result.data);
      } else {
        setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      }
      setLoadingPdr(false);
    } catch (err) {
      //capture(err);
      setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      setLoadingPdr(false);
    }
    //setLoadingPdr(loadingPdr - 1);
  }

  return (
    <ModalTailwind centered isOpen={isOpen} onClose={closeModal} className="w-[850px] bg-white rounded-lg py-2 px-8">
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
                value={sessionSearch}
                onChange={(value, triggerQuery, event) => {
                  setSessionSearch(value);
                }}
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
                  pageSize={3}
                  render={({ data }) => (
                    <div className="flex flex-col justify-center items-center gap-4 w-full">
                      {data.map((hit) => (
                        <HitCenter
                          key={hit._id}
                          hit={hit}
                          onSend={() => {
                            setStep(2);
                            setSession(hit);
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

                  {/* disable j-12 du depart en sejour */}
                  <div
                    onClick={() => {
                      if (youngSelectDisabled) return;
                      setPdrOption("young-select");
                      setStep(3);
                    }}
                    className={`flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg ${
                      youngSelectDisabled ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"
                    } hover:bg-gray-100`}>
                    <div className="text-sm w-5/6">
                      <span className="font-bold">Je laisse {young.firstName} choisir</span> son point de rassemblement
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div
                    onClick={() => {
                      setPdrOption("self-going");
                      setStep(3);
                    }}
                    className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div className="text-sm w-5/6">
                      {young.firstName} se rendra au centre et en reviendra <span className="font-bold">par ses propres moyens</span>
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div
                    onClick={() => {
                      setPdrOption("local");
                      setStep(3);
                    }}
                    className="flex flex-row gap-4 items-center justify-center border-[1px] border-gray-200 w-1/3 flex-auto py-3 rounded-lg hover:bg-gray-100 cursor-pointer">
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

                <div className="flex flex-col justify-start items-center gap-4 w-full h-[300px]">
                  {loadingPdr ? (
                    <div className="mt-2">Chargement ...</div>
                  ) : (
                    <>
                      {dataPdr.length === 0 ? (
                        <div className="mt-2">Aucun résultat.</div>
                      ) : (
                        <>
                          {dataPdr.slice(LIST_PAGE_LIMIT * currentPage, LIST_PAGE_LIMIT * currentPage + LIST_PAGE_LIMIT).map((hit) => (
                            <HitPdr
                              key={hit._id}
                              hit={hit}
                              ligneBus={dataLigneToPoint.filter((e) => e.meetingPointId === hit._id)[0]}
                              onSend={() => {
                                setStep(3);
                                setSelectedPdr({ pdr: hit, ligneBus: dataLigneToPoint.filter((e) => e.meetingPointId === hit._id)[0] });
                              }}
                            />
                          ))}
                          <div className="flex flex-row gap-4 self-end">
                            {currentPage > 0 && (
                              <div className="border-[1px] p rounded border-gray-300 cursor-pointer" onClick={() => setCurrentPage((currentPage) => currentPage - 1)}>
                                <BiChevronLeft className="text-gray-400" size={40} />
                              </div>
                            )}
                            {LIST_PAGE_LIMIT * currentPage + LIST_PAGE_LIMIT < dataPdr.length && (
                              <div className="border-[1px] p rounded border-gray-300 cursor-pointer" onClick={() => setCurrentPage((currentPage) => currentPage + 1)}>
                                <BiChevronRight className="text-gray-400" size={40} />
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {step === 3 && (
          <div className="flex flex-col justify-center items-center">
            <div className="mt-4 mb text-gray-900 text-xl text-center font-medium">
              Vérifiez l&apos;affectation de {young.firstName} {young.lastName}
            </div>
            <div className="text-sm text-gray-500">Un email sera automatiquement envoyé au volontaire et à ses représentants légaux.</div>

            <div className="flex flex-row gap-4 my-4">
              <div className="w-1/2 flex flex-row gap-2 justify-center items-center mx-2">
                <div>
                  <LinearIceBerg />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xl">Lieu d&apos;affectation</div>
                  <div className="text-sm">
                    {session.nameCentre}, {session.cityCentre} ({session.zipCentre}), {session.region}
                  </div>
                </div>
              </div>
              <div className="w-1/2 flex flex-row gap-2 justify-center items-center mx-2">
                <div>
                  <LinearMap fill-opacity={`${pdrOption !== "ref-select" && "0.5"}`} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-xl">Lieu de rassemblement</div>
                  {pdrOption === "ref-select" ? (
                    <div>
                      {selectedPdr.pdr.name}, {selectedPdr.pdr.city} ({selectedPdr.pdr.zip}), {selectedPdr.pdr.region}
                    </div>
                  ) : pdrOption === "self-going" ? (
                    <div>Le volontaire se rendra directement au centre et en reviendra par ses propres moyens.</div>
                  ) : pdrOption === "local" ? (
                    <div>Les informations de transport sont transmises par les services locaux.</div>
                  ) : (
                    <div>Le volontaire choisira lui-même son point de rassemblement.</div>
                  )}
                </div>
              </div>
            </div>
            {selectedPdr && (
              <div className="flex flex-row justify-center gap-6 mb-2">
                <div className="flex flex-row">
                  <div className="bg-white shadow-sm flex flex-col items-center justify-center p-1 px-2 rounded-lg font-bold">
                    <div className="text-orange-600 capitalize">{dayjs(selectedPdr.ligneBus?.departuredDate).locale("fr").format("MMM")}</div>
                    <div className="text-gray-700 text-lg">{dayjs(selectedPdr.ligneBus?.departuredDate).locale("fr").format("D")}</div>
                  </div>
                  <div className="flex flex-col items-start justify-center ml-2">
                    <div className="text-gray-900 font-bold">Aller à {selectedPdr.ligneBus.lignetopoint.departureHour}</div>
                    <div className="text-gray-600 first-letter:capitalize">{dayjs(selectedPdr.ligneBus?.departuredDate).locale("fr").format("dddd D MMMM")}</div>
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="bg-white shadow-sm flex flex-col items-center justify-center p-1 px-2 rounded-lg font-bold">
                    <div className="text-orange-600 capitalize">{dayjs(selectedPdr.ligneBus?.returnDate).locale("fr").format("MMM")}</div>
                    <div className="text-gray-700 text-lg">{dayjs(selectedPdr.ligneBus?.returnDate).locale("fr").format("D")}</div>
                  </div>
                  <div className="flex flex-col items-start justify-center ml-2">
                    <div className="text-gray-900 font-bold">Retour à {selectedPdr.ligneBus.lignetopoint.returnHour}</div>
                    <div className="text-gray-600 first-letter:capitalize">{dayjs(selectedPdr.ligneBus?.returnDate).locale("fr").format("dddd D MMMM")}</div>
                  </div>
                </div>
              </div>
            )}
            {pdrOption === "self-going" && (
              <div className="flex flex-row justify-center gap-6 mb-2">
                <div className="flex flex-row">
                  <div className="bg-white shadow-sm flex flex-col items-center justify-center p-1 px-2 rounded-lg font-bold">
                    <div className="text-orange-600 capitalize">{dayjs(sessionObject.dateStart).locale("fr").format("MMM")}</div>
                    <div className="text-gray-700 text-lg">{dayjs(sessionObject.dateStart).locale("fr").format("D")}</div>
                  </div>
                  <div className="flex flex-col items-start justify-center ml-2">
                    <div className="text-gray-900 font-bold">Aller à 16h</div>
                    <div className="text-gray-600 first-letter:capitalize">{dayjs(sessionObject.dateStart).locale("fr").format("dddd D MMMM")}</div>
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="bg-white shadow-sm flex flex-col items-center justify-center p-1 px-2 rounded-lg font-bold">
                    <div className="text-orange-600 capitalize">{dayjs(sessionObject.dateEnd).locale("fr").format("MMM")}</div>
                    <div className="text-gray-700 text-lg">{dayjs(sessionObject.dateEnd).locale("fr").format("D")}</div>
                  </div>
                  <div className="flex flex-col items-start justify-center ml-2">
                    <div className="text-gray-900 font-bold">Retour à 11h</div>
                    <div className="text-gray-600 first-letter:capitalize">{dayjs(sessionObject.dateEnd).locale("fr").format("dddd D MMMM")}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <ModalConfirm
          isOpen={modal.isOpen}
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          onCancel={() => setModal((prevState) => ({ ...prevState, isOpen: false }))}
        />
      </div>
      <div className="flex flex-row gap-2 w-full">
        <div
          onClick={() => {
            if (step === 1) {
              setPdrOption("");
              return closeModal();
            }
            if (step === 2 && pdrOption === "ref-select") return setPdrOption("");
            if (step === 2 && pdrOption === "" && center) return closeModal();

            if (step === 3) {
              setSelectedPdr(null);
              setPdrOption("");
            }
            setStep((step) => step - 1);
          }}
          className="flex-1 border-[1px] border-gray-300 rounded text-center py-2 text-sm font-medium text-gray-700 cursor-pointer mb-2">
          Retour
        </div>

        {step === 3 && (
          <div onClick={handleAffectation} className="flex-1 border-[1px] rounded bg-blue-600 text-center py-2 text-sm font-medium text-white cursor-pointer mb-2">
            Confirmer
          </div>
        )}
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
              {formatStringDateWithDayTimezoneUTC(ligneBus?.departuredDate)} {ligneBus?.lignetopoint.departureHour}
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
