import dayjs from "@/utils/dayjs.utils";
import React, { useCallback, useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { toastr } from "react-redux-toastr";
import ReactTooltip from "react-tooltip";
import LinearIceBerg from "../../../assets/Linear-IceBerg";
import LinearMap from "../../../assets/Linear-Map";
import ChevronRight from "../../../assets/icons/ChevronRight";
import Eye from "../../../assets/icons/Eye";
import { ResultTable } from "../../../components/filters-system-v2";
import { buildQuery } from "../../../components/filters-system-v2/components/filters/utils";
import { MultiLine } from "../../../components/list";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import api from "../../../services/api";
import { debounce, formatDateFR, getZonedDate, translate } from "../../../utils";
import RightArrow from "./RightArrow";
import MeetingInfo from "./phase1/MeetingInfo";

const LIST_PAGE_LIMIT = 3;

export default function ModalAffectations({ isOpen, onCancel, young, center = null, sessionId = null, cohort }) {
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

  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({ page: 0, size: 3 });
  const [data, setData] = useState([]);

  async function getPdrs(data) {
    for (const center of data) {
      const res = await api.get(`/point-de-rassemblement/ligneToPoint/${young.cohort}/${center.cohesionCenterId}`);
      const pdr = res.data.map((item) => item.meetingPoint);
      const ligne = res.data.map((item) => item.ligneBus);
      center.meetingPoint = pdr;
      center.ligneBus = ligne;
    }
    return data;
  }

  const updateOnParamChange = useCallback(
    debounce(async (selectedFilters, paramData) => {
      buildQuery(`/elasticsearch/sessionPhase1/young-affectation/${young.cohort}/search`, selectedFilters, paramData?.page, [], paramData?.sort).then(async (res) => {
        if (!res) return;
        const newParamData = {
          count: res.count,
        };
        if (paramData.count !== res.count) newParamData.page = 0;
        const dataPdrs = await getPdrs(res.data);
        setParamData((paramData) => ({ ...paramData, ...newParamData }));
        setData(dataPdrs);
      });
    }, 250),
    [],
  );

  useEffect(() => {
    updateOnParamChange(selectedFilters, paramData);
  }, [selectedFilters, paramData.page]);

  // true à J - 12 du départ
  const date = cohort?.pdrChoiceLimitDate;
  const youngSelectDisabled = date ? dayjs.utc().isAfter(dayjs(date)) : false;

  const closeModal = () => {
    setInputPdr("");
    setPdrOption("");
    setStep(1);
    setSelectedFilters({});
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
        setPdrOption("");
      } catch (e) {
        toastr.error("Oups, une erreur est survenue lors de la récupération de la session", e);
        console.log(e);
      }
    })();
  }, [center]);

  const handleAffectation = async () => {
    try {
      setLoading(true);
      const response = await api.post(`/young/${young._id}/phase1/affectation`, {
        centerId: session.cohesionCenterId,
        sessionId: session._id,
        pdrOption,
        meetingPointId: selectedPdr?.pdr._id,
        ligneId: selectedPdr?.data.ligneBus._id,
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
        result.data.sort((a, b) => {
          if (a.meetingPoint.department === young.department && b.meetingPoint.department !== young.department) {
            return -1;
          } else if (a.meetingPoint.department !== young.department && b.meetingPoint.department === young.department) {
            return 1;
          } else {
            return 0;
          }
        });
        setDataPdr(result.data.map((el) => el.meetingPoint));
        let newData = result.data;

        newData.map((d) => {
          const ligneId = d.ligneBus._id;
          d.meetingPoint.lineId = ligneId;
          return d;
        });

        setDataLigneToPoint(newData);
      } else {
        setError("Impossible de récupérer la liste des points de rassemblement. Veuillez réessayer dans quelques instants.");
      }
      setLoadingPdr(false);
    } catch (err) {
      //capture(err);
      setError("Impossible de récupérer la liste des points de rassemblement. Veuillez réessayer dans quelques instants.");
      setLoadingPdr(false);
    }
    //setLoadingPdr(loadingPdr - 1);
  }

  return (
    <ModalTailwind centered isOpen={isOpen} onClose={closeModal} className="w-[850px] rounded-lg bg-white py-2 px-8">
      <div className="mb-4 ">
        <div className="mt-6 flex w-full flex-row justify-between gap-6">
          <div className="w-1/3">
            <div className="mb-2 h-1 rounded bg-blue-600" />
            <div className="text-xs uppercase text-blue-600">étape 1</div>
            <div className="text-xs font-medium text-gray-900">Le centre</div>
          </div>
          <div className="w-1/3">
            <div className={`h-1 ${step > 1 ? "bg-blue-600" : "bg-gray-200"} mb-2 rounded`} />
            <div className={`text-xs uppercase ${step > 1 ? "text-blue-600" : "text-gray-500"}`}>étape 2</div>
            <div className="text-xs font-medium text-gray-900">Le point de rassemblement</div>
          </div>
          <div className="w-1/3">
            <div className={`h-1 ${step > 2 ? "bg-blue-600" : "bg-gray-200"} mb-2 rounded`} />
            <div className={`text-xs uppercase ${step > 2 ? "text-blue-600" : "text-gray-500"}`}>étape 3</div>
            <div className="text-xs font-medium text-gray-900">Résumé</div>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="my-4 text-center text-xl font-medium text-gray-900">Sélectionnez votre centre</div>
            <div className="h-[38px] w-2/3 mx-auto overflow-hidden rounded-md border-[1px] border-gray-300 px-2.5">
              <input
                name={"searchbar"}
                placeholder="Rechercher par mots clés, ville, code postal..."
                value={selectedFilters?.searchbar?.filter[0] || ""}
                onChange={(e) => {
                  setSelectedFilters({ ...selectedFilters, [e.target.name]: { filter: [e.target.value] } });
                }}
                className={`h-full w-full text-xs text-gray-600`}
              />
            </div>

            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={data?.length}
              render={
                <div className="flex w-full flex-col items-center justify-center gap-4">
                  {data.map((hit) => (
                    <HitCenter
                      key={hit._id}
                      hit={hit}
                      young={young}
                      onSend={() => {
                        setStep(2);
                        setSession(hit);
                      }}
                    />
                  ))}
                </div>
              }
            />
          </>
        )}

        {step === 2 && (
          <>
            {pdrOption === "" && (
              <>
                <div className="my-4 text-center text-xl font-medium text-gray-900">Choix du point de rassemblement</div>
                {youngSelectDisabled ? (
                  <ReactTooltip id="tooltip-delai" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
                    <div className="text-[black]">Le délai de confirmation du point de rassemblement par le volontaire est dépassé</div>
                  </ReactTooltip>
                ) : null}
                <div className="flex flex-row flex-wrap gap-4 px-4">
                  <div
                    onClick={() => setPdrOption("ref-select")}
                    className="flex w-1/3 flex-auto cursor-pointer flex-row items-center justify-center gap-4 rounded-lg border-[1px] border-gray-200 py-3 hover:bg-gray-100">
                    <div className="w-5/6 text-sm">
                      <span className="font-bold">Je choisis</span> un point de rassemblement
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>

                  {/* disable j-12 du depart en sejour */}
                  <div
                    data-tip=""
                    data-for="tooltip-delai"
                    onClick={() => {
                      if (youngSelectDisabled) return;
                      setPdrOption("young-select");
                      setStep(3);
                    }}
                    className={`flex w-1/3 flex-auto flex-row items-center justify-center gap-4 rounded-lg border-[1px] border-gray-200 py-3 ${
                      youngSelectDisabled ? "cursor-not-allowed bg-gray-100" : "cursor-pointer"
                    } hover:bg-gray-100`}>
                    <div className="w-5/6 text-sm">
                      <span className="font-bold">Je laisse {young.firstName} choisir</span> son point de rassemblement
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div
                    onClick={() => {
                      setPdrOption("self-going");
                      setStep(3);
                    }}
                    className="flex w-1/3 flex-auto cursor-pointer flex-row items-center justify-center gap-4 rounded-lg border-[1px] border-gray-200 py-3 hover:bg-gray-100">
                    <div className="w-5/6 text-sm">
                      {young.firstName} se rendra au centre et en reviendra <span className="font-bold">par ses propres moyens</span>
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                  <div
                    onClick={() => {
                      setPdrOption("local");
                      setStep(3);
                    }}
                    className="flex w-1/3 flex-auto cursor-pointer flex-row items-center justify-center gap-4 rounded-lg border-[1px] border-gray-200 py-3 hover:bg-gray-100">
                    <div className="w-5/6 text-sm">
                      Plan de transport <span className="font-bold">transmis par email</span>
                    </div>
                    <ChevronRight className="text-gray-400" width={8} height={16} />
                  </div>
                </div>
              </>
            )}
            {pdrOption === "ref-select" && (
              <>
                <div className="my-4 text-center text-xl font-medium text-gray-900">Sélectionnez votre point de rassemblement</div>
                <div className="datasearch-searchfield mx-auto w-2/3 self-center shadow-sm">
                  <input className="searchbox" placeholder="Rechercher un point de rassemblement" value={inputPdr} onChange={(e) => setInputPdr(e.target.value)} />
                </div>

                <div className="flex h-[300px] w-full flex-col items-center justify-start gap-2 mt-4">
                  {loadingPdr ? (
                    <div className="mt-2">Chargement ...</div>
                  ) : (
                    <>
                      {dataPdr.length === 0 ? (
                        <div className="mt-2">Aucun résultat.</div>
                      ) : (
                        <>
                          {dataPdr.slice(LIST_PAGE_LIMIT * currentPage, LIST_PAGE_LIMIT * currentPage + LIST_PAGE_LIMIT).map((hit) => (
                            <>
                              <HitPdr
                                key={hit._id}
                                hit={hit}
                                data={dataLigneToPoint.filter((e) => e.meetingPoint.lineId === hit.lineId)[0]}
                                young={young}
                                onSend={() => {
                                  setStep(3);
                                  setSelectedPdr({ pdr: hit, data: dataLigneToPoint.filter((e) => e.meetingPoint.lineId === hit.lineId)[0] });
                                }}
                              />
                            </>
                          ))}
                          <div className="flex flex-row gap-4 self-end absolute bottom-[3.75rem]">
                            {currentPage > 0 && (
                              <div className="p cursor-pointer rounded border-[1px] border-gray-300" onClick={() => setCurrentPage((currentPage) => currentPage - 1)}>
                                <BiChevronLeft className="text-gray-400" size={40} />
                              </div>
                            )}
                            {LIST_PAGE_LIMIT * currentPage + LIST_PAGE_LIMIT < dataPdr.length && (
                              <div className="p cursor-pointer rounded border-[1px] border-gray-300" onClick={() => setCurrentPage((currentPage) => currentPage + 1)}>
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
          <div className="flex flex-col items-center justify-center">
            <div className="mb mt-4 text-center text-xl font-medium text-gray-900">
              Vérifiez l&apos;affectation de {young.firstName} {young.lastName}
            </div>
            <div className="text-sm text-gray-500">Un email sera automatiquement envoyé au volontaire et à ses représentants légaux.</div>

            <div className="my-4 flex flex-row gap-4">
              <div className="mx-2 flex w-1/2 flex-row items-center justify-center gap-2">
                <div>
                  <LinearIceBerg />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">Lieu d&apos;affectation</div>
                  <div className="text-sm">
                    {session.nameCentre}, {session.cityCentre} ({session.zipCentre}), {session.region}
                  </div>
                </div>
              </div>
              <div className="mx-2 flex w-1/2 flex-row items-center justify-center gap-2">
                <div>
                  <LinearMap fill-opacity={`${pdrOption !== "ref-select" && "0.5"}`} />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">Lieu de rassemblement</div>
                  {pdrOption === "ref-select" ? (
                    <div>
                      {selectedPdr.pdr.name}, {selectedPdr.pdr.city} ({selectedPdr.pdr.zip}), {selectedPdr.pdr.region}
                    </div>
                  ) : pdrOption === "self-going" ? (
                    <div>Le volontaire se rendra directement au centre et en reviendra par ses propres moyens.</div>
                  ) : pdrOption === "local" ? (
                    <div>Les informations de transport sont transmises par email.</div>
                  ) : (
                    <div>Le volontaire choisira lui-même son point de rassemblement.</div>
                  )}
                </div>
              </div>
            </div>
            {session && cohort && pdrOption !== "local" && <MeetingInfo young={young} session={session} cohort={cohort} selectedPdr={selectedPdr?.data} />}
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
      <div className="flex w-full flex-row gap-2">
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
          className=" mt-5 mb-2 flex-1 cursor-pointer rounded border-[1px] border-gray-300 py-2 text-center text-sm font-medium text-gray-700">
          Retour
        </div>

        {step === 3 && (
          <div onClick={handleAffectation} className="mb-2 mt-5 flex-1 cursor-pointer rounded border-[1px] bg-blue-600 py-2 text-center text-sm font-medium text-white">
            Confirmer
          </div>
        )}
      </div>
    </ModalTailwind>
  );
}

const ListPdr = (hit) => {
  return (
    <>
      <p className="text-gray-900 text-sm font-medium">Points de rassemblement proposés à ce jeune</p>
      <ul>
        {hit.hit.meetingPoint.map((pdr) => {
          if (pdr.department === hit.young.department) {
            return (
              <li className="font-bold text-[12px] leading-5 p-2 text-gray-900" key={pdr._id}>
                {pdr.name}
                <p className="font-normal">
                  {pdr.department}, {pdr.region} - <span className="text-gray-500">N°ligne : </span>
                  {pdr.busId}
                </p>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </>
  );
};

const HitCenter = ({ hit, onSend, young }) => {
  const pdr = hit.meetingPoint.filter((pdr) => pdr.department === young.department).length;
  hit.meetingPoint.map((pdr) => {
    for (let i = 0; i < hit.ligneBus.length; i++) {
      if (hit.ligneBus[i].meetingPointsIds.filter((item) => item === pdr._id).length > 0) {
        pdr.busId = hit.ligneBus[i].busId;
      }
    }
  });
  return (
    <>
      <hr />
      {pdr === 0 ? (
        <ReactTooltip id="pdr-vide" className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
          <div className="text-gray-900 text-[12px] leading-[24px] w-[260px]">
            <p>Auncune ligne de transport avec des places disponibles ne correspond à ce trajet</p>
          </div>
        </ReactTooltip>
      ) : (
        <ReactTooltip id={hit._id} className="bg-white text-black !opacity-100 shadow-xl" arrowColor="white" disable={false}>
          <div className="text-[black] text-sm">
            <ListPdr hit={hit} young={young} />
          </div>
        </ReactTooltip>
      )}

      <div className="flex w-full flex-row items-center justify-between gap-4 px-2">
        <div className="w-1/2">
          <MultiLine>
            <span className="font-bold text-[15px] leading-6 text-gray-900">{hit.nameCentre}</span>
            <p className="text-[12px] leading-[15px]">{`${hit.cityCentre || ""} • ${hit.department || ""}`}</p>
          </MultiLine>
        </div>
        <div className="flex flex-row m-auto justify-center align-middle" data-tip data-for={pdr === 0 ? "pdr-vide" : hit._id}>
          <div className={`w-fit rounded-full border-[0.5px] border-gray-400 ${pdr === 0 ? "bg-[#FFFFFF]" : "bg-gray-100"}  px-3 py-1 text-[12px] leading-[22px] text-gray-500`}>
            <Eye className="text-gray-500 inline" /> {pdr} points de rassemblement proposés
          </div>
        </div>
        <div className="cursor-pointer" onClick={onSend}>
          <RightArrow />
        </div>
      </div>
    </>
  );
};

const HitPdr = ({ hit, onSend, data, young }) => {
  return (
    <>
      <hr />
      <div className="flex w-full flex-row items-center justify-between gap-2 px-2 border-t-[1px] border-[#F4F5FA] pt-3">
        <div className="w-2/3">
          <MultiLine>
            <div className="flex flex-row justify-start align-top">
              <span className="text-[15px] leading-6 font-bold text-gray-900 w-1/2">{hit.name}</span>
              {hit.department === young.department ? (
                <div
                  className={` flex rounded-full border-[0.5px] border-gray-500 bg-gray-50 text-[12px] font-medium leading-[22px] w-[130px] h-[25px] justify-center align-middle mt-1`}>
                  <span className="text-gray-600">proposé au jeune</span>
                </div>
              ) : null}
            </div>
            <div className="text-[12px] leading-[18px]">
              <p>{`${hit.department || ""} • ${hit.address || ""}, ${hit.zip || ""} ${hit.city || ""}`}</p>
              <p>
                N° transport: <span className="text-gray-900">{data?.ligneBus.busId}</span>
              </p>
            </div>
          </MultiLine>
        </div>
        <div className="flex w-1/3 flex-col text-[12px] leading-[18px]">
          <div className="text-gray-500">
            Départ :{" "}
            <span className=" text-gray-900">
              {formatDateFR(getZonedDate(data?.ligneBus.departuredDate))} {data?.ligneToPoint.departureHour}
            </span>
          </div>
          <div className=" text-gray-500">
            Retour :{" "}
            <span className=" text-gray-900">
              {formatDateFR(getZonedDate(data?.ligneBus?.returnDate))} {data?.ligneToPoint.returnHour}
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
