import React from "react";
import { BsChevronDown, BsSearch } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, START_DATE_SESSION_PHASE1, ROLES, translate } from "snu-lib";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import Field from "./Field";

export default function ModalRattacherCentre({ isOpen, onSucess, onCancel, user, defaultCentre = null, editable = true }) {
  const history = useHistory();
  const availableCohorts = Object.keys(START_DATE_SESSION_PHASE1).reduce((acc, cohort) => {
    return START_DATE_SESSION_PHASE1[cohort] > new Date() ? [...acc, cohort] : acc;
  }, []);

  const refSelect = React.useRef(null);
  const refInput = React.useRef(null);
  const refContainer = React.useRef(null);

  const refStatus = React.useRef(null);
  const refStatusSelect = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && refContainer.current.contains(event.target)) {
        editable && setOpen((open) => !open);
      } else if (refSelect.current && !refSelect.current.contains(event.target)) {
        setOpen(false);
      }
      if (refStatus.current && refStatus.current.contains(event.target)) {
        editable && setStatusOpen((open) => !open);
      } else if (refStatus.current && !refStatus.current.contains(event.target)) {
        setStatusOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const [listCentre, setListCentre] = React.useState([]);
  const [selectedCohort, setSelectedCohort] = React.useState();
  const [selectedCentre, setSelectedCentre] = React.useState(defaultCentre);
  const [placesTotal, setPlacesTotal] = React.useState("");
  const [status, setStatus] = React.useState("WAITING_VALIDATION");
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [statusOpen, setStatusOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!refInput.current) return;
    if (open) {
      refInput.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    setDisabled(!selectedCohort || !selectedCentre || placesTotal === "");
  }, [selectedCentre, selectedCohort, placesTotal]);

  React.useEffect(() => {
    if (selectedCohort) {
      (async () => {
        const body = {
          query: { bool: { must: [], must_not: { term: { "cohorts.keyword": selectedCohort } } } },
          size: ES_NO_LIMIT,
          track_total_hits: true,
        };
        if (search) {
          body.query.bool.must.push({
            bool: {
              should: [
                {
                  multi_match: {
                    query: search,
                    fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
                    type: "cross_fields",
                    operator: "and",
                  },
                },
                {
                  multi_match: {
                    query: search,
                    fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
                    type: "phrase",
                    operator: "and",
                  },
                },
                {
                  multi_match: {
                    query: search,
                    fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
                    type: "phrase_prefix",
                    operator: "and",
                  },
                },
              ],
              minimum_should_match: "1",
            },
          });
        }
        const { responses } = await api.esQuery("cohesioncenter", body);
        setListCentre(
          responses[0].hits.hits.map((hit) => {
            return { ...hit._source, _id: hit._id };
          }),
        );
      })();
    }
  }, [search, selectedCohort]);

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      const { ok, code } = await api.put(`/cohesion-center/${selectedCentre._id}/session-phase1`, {
        cohort: selectedCohort,
        placesTotal,
        status,
      });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout de la session", translate(code));
        return setIsLoading(false);
      }
      setIsLoading(false);
      setSelectedCentre("");
      setSelectedCohort("");
      setPlacesTotal("");
      toastr.success("La centre a été rattaché au séjour avec succès");
      onCancel();
      if (onSucess) onSucess();
      setSelectedCentre({ ...selectedCentre, cohorts: [...selectedCentre.cohorts, selectedCohort] });
      history.push(`/centre/${selectedCentre._id}?cohorte=${selectedCohort}`);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la session");
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: "VALIDATED", label: "Validée" },
    { value: "WAITING_VALIDATION", label: "En attente de validation" },
  ];

  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[600px] bg-white rounded-lg shadow-xl">
      <div className="flex flex-col p-8 h-[650px] w-full justify-between">
        <div className="flex flex-col w-full">
          <div className="font-medium text-xl text-gray-800 leading-7 text-center">Rattacher un centre à un séjour</div>
          <hr className="my-8" />
          <div className="text-gray-800 text-sm font-medium leading-6">Choisissez un séjour</div>
          <div className="flex flex-row gap-2 flex-wrap py-2">
            {availableCohorts.map((cohort) => (
              <>
                {defaultCentre && !selectedCentre?.cohorts?.includes(cohort) ? (
                  <div
                    key={cohort}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] ${
                      selectedCohort === cohort ? "border-blue-600 text-white bg-blue-600" : "border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF] "
                    }`}>
                    {cohort}
                  </div>
                ) : null}
                {!defaultCentre ? (
                  <div
                    key={cohort}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] ${
                      selectedCohort === cohort ? "border-blue-600 text-white bg-blue-600" : "border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF] "
                    }`}>
                    {cohort}
                  </div>
                ) : null}
              </>
            ))}
          </div>
          {selectedCohort ? (
            <>
              <div className="text-gray-500 text-sm font-medium leading-6 mt-4">Sélectionnez un centre</div>
              <div className="relative">
                <div
                  ref={refContainer}
                  className={`mt-2 py-2 pl-2 pr-4 flex items-center justify-between rounded-lg bg-white ${open ? "border-blue-500 border-2" : "border-[1px] border-gray-300"}`}>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs leading-6 font-normal text-gray-500">Choisir un centre</div>
                    {!selectedCentre ? <div className="text-sm leading-6 text-gray-800 h-5" /> : <div className="text-sm leading-6 text-gray-800">{selectedCentre.name}</div>}
                  </div>
                  {editable && <BsChevronDown className={`text-gray-500 ${open ? "transform rotate-180" : ""}`} />}
                </div>

                <div
                  ref={refSelect}
                  className={`${!open ? "hidden" : ""} ${
                    listCentre.length > 3 ? "h-[300px] overflow-y-auto" : ""
                  } absolute left-0 w-full bg-white shadow-lg rounded-lg border border-gray-300 px-3 z-50`}>
                  <div className="sticky top-0 bg-white z-10 pt-3">
                    <div className="flex flex-row gap-2 items-center">
                      <BsSearch className="text-gray-400" />
                      <input
                        ref={refInput}
                        type="text"
                        placeholder="Rechercher un centre"
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-gray-800 text-[13px] leading-3"
                      />
                    </div>
                    <hr className="my-2" />
                  </div>
                  {listCentre.map((centre) => (
                    <div
                      key={centre._id}
                      onClick={() => {
                        setSelectedCentre(centre);
                        setOpen(false);
                      }}
                      className="flex flex-col py-1 px-2 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <div className="text-sm leading-5 text-gray-900">{centre.name}</div>
                      <div className="text-sm leading-5 text-gray-500">
                        {centre.department} • {centre.region}
                      </div>
                    </div>
                  ))}
                  {listCentre.length === 0 && (
                    <div className="flex items-center gap-2 py-2 justify-center">
                      <div className="text-xs leading-4 text-gray-900">Aucun centre trouvé</div>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex flex-col items-center gap-2 justify-center pb-3">
                    <div className="text-sm leading-5 text-gray-900">Le centre n’est pas dans la liste ?</div>
                    <div
                      className="text-xs leading-4 text-blue-600 py-1 px-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                      onClick={() => history.push(`/centre/nouveau?cohort=${selectedCohort}`)}>
                      Créer un centre
                    </div>
                  </div>
                </div>
              </div>
              {selectedCentre && (
                <div className="text-sm font-medium leading-6 mt-4">
                  <Field label="Nombre de places ouvertes" onChange={(e) => setPlacesTotal(e.target.value)} value={placesTotal} />
                </div>
              )}

              {user.role === ROLES.ADMIN && selectedCentre && (
                <div className="relative">
                  <div
                    ref={refStatus}
                    className={`mt-6 py-2 pl-2 pr-4 flex items-center justify-between rounded-lg bg-white ${
                      statusOpen ? "border-blue-500 border-2" : "border-[1px] border-gray-300"
                    }`}>
                    <div className="flex flex-col justify-center">
                      <div className="text-xs leading-6 font-normal text-gray-500 ">Statut de la session</div>
                      {status === "" ? (
                        <div className="text-sm leading-6 text-gray-800 h-5" />
                      ) : (
                        <div className="text-sm leading-6 text-gray-800">{statusOptions.find((e) => e.value === status).label}</div>
                      )}
                    </div>
                    <BsChevronDown className={`text-gray-500 ${open ? "transform rotate-180" : ""}`} />
                  </div>
                  <div ref={refStatusSelect} className={`${!statusOpen ? "hidden" : ""} absolute w-full bg-white shadow-lg rounded-lg border border-gray-300 px-3 z-50`}>
                    {statusOptions.map((item) => {
                      return (
                        <div
                          key={item.value}
                          onClick={() => {
                            setStatus(item.value);
                            setStatusOpen(false);
                          }}
                          className="flex flex-col py-1 px-2 cursor-pointer hover:bg-gray-50 rounded-lg">
                          <div className="text-sm leading-5 text-gray-900">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button onClick={onCancel} className="w-1/2 border-[1px] border-gray-300 py-2 rounded-lg hover:shadow-ninaButton ">
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading}
            className="border-[1px] border-blue-600 text-white bg-blue-600 py-2 w-1/2 rounded-lg hover:shadow-ninaButton disabled:opacity-50 disabled:cursor-not-allowed">
            Créer la session
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
