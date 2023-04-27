import React, { useEffect } from "react";
import { BsChevronDown, BsSearch } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, ROLES, translate, isSessionEditionOpen } from "snu-lib";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import Field from "./Field";

export default function ModalRattacherCentre({ isOpen, onSucess, onCancel, user, defaultCentre = null, editable = true }) {
  const history = useHistory();
  const [availableCohorts, setAvailableCohorts] = React.useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cohort");
        const filteredCohorts = data.filter((cohort) => isSessionEditionOpen(user, cohort) === true);
        const availableCohorts = filteredCohorts.map((cohort) => cohort.name);
        setAvailableCohorts(availableCohorts);
      } catch (err) {
        capture(err);
        toastr.error("Erreur", translate("Une erreur est survenue"));
      }
    })();
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

  useEffect(() => {
    if (defaultCentre) setSelectedCentre(defaultCentre);
  }, [defaultCentre]);

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
      toastr.success("La centre a été rattaché au séjour avec succès");
      onCancel();
      if (onSucess) onSucess(selectedCohort);
      history.push(`/centre/${selectedCentre._id}?cohorte=${selectedCohort}`);
      setSelectedCohort("");
      setPlacesTotal("");
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
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[600px] rounded-lg bg-white shadow-xl">
      <div className="flex h-[650px] w-full flex-col justify-between p-8">
        <div className="flex w-full flex-col">
          <div className="text-center text-xl font-medium leading-7 text-gray-800">Rattacher un centre à un séjour</div>
          <hr className="my-8" />
          <div className="text-sm font-medium leading-6 text-gray-800">Choisissez un séjour</div>
          <div className="flex flex-row flex-wrap gap-2 py-2">
            {availableCohorts.map((cohort) => (
              <>
                {defaultCentre && !selectedCentre?.cohorts?.includes(cohort) ? (
                  <div
                    key={cohort}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`cursor-pointer rounded-full border-[1px] px-3 py-1 text-xs font-medium leading-5 ${
                      selectedCohort === cohort ? "border-blue-600 bg-blue-600 text-white" : "border-[#66A7F4] bg-[#F9FCFF] text-[#0C7CFF] "
                    }`}>
                    {cohort}
                  </div>
                ) : null}
                {!defaultCentre ? (
                  <div
                    key={cohort}
                    onClick={() => setSelectedCohort(cohort)}
                    className={`cursor-pointer rounded-full border-[1px] px-3 py-1 text-xs font-medium leading-5 ${
                      selectedCohort === cohort ? "border-blue-600 bg-blue-600 text-white" : "border-[#66A7F4] bg-[#F9FCFF] text-[#0C7CFF] "
                    }`}>
                    {cohort}
                  </div>
                ) : null}
              </>
            ))}
          </div>
          {selectedCohort ? (
            <>
              <div className="mt-4 text-sm font-medium leading-6 text-gray-500">Sélectionnez un centre</div>
              <div className="relative">
                <div
                  ref={refContainer}
                  className={`mt-2 flex items-center justify-between rounded-lg bg-white py-2 pl-2 pr-4 ${open ? "border-2 border-blue-500" : "border-[1px] border-gray-300"}`}>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-normal leading-6 text-gray-500">Choisir un centre</div>
                    {!selectedCentre ? <div className="h-5 text-sm leading-6 text-gray-800" /> : <div className="text-sm leading-6 text-gray-800">{selectedCentre.name}</div>}
                  </div>
                  {editable && <BsChevronDown className={`text-gray-500 ${open ? "rotate-180 transform" : ""}`} />}
                </div>

                <div
                  ref={refSelect}
                  className={`${!open ? "hidden" : ""} ${
                    listCentre.length > 3 ? "h-[300px] overflow-y-auto" : ""
                  } absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg`}>
                  <div className="sticky top-0 z-10 bg-white pt-3">
                    <div className="flex flex-row items-center gap-2">
                      <BsSearch className="text-gray-400" />
                      <input
                        ref={refInput}
                        type="text"
                        placeholder="Rechercher un centre"
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-[13px] leading-3 text-gray-800"
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
                      className="flex cursor-pointer flex-col rounded-lg py-1 px-2 hover:bg-gray-50">
                      <div className="text-sm leading-5 text-gray-900">{centre.name}</div>
                      <div className="text-sm leading-5 text-gray-500">
                        {centre.department} • {centre.region}
                      </div>
                    </div>
                  ))}
                  {listCentre.length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <div className="text-xs leading-4 text-gray-900">Aucun centre trouvé</div>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex flex-col items-center justify-center gap-2 pb-3">
                    <div className="text-sm leading-5 text-gray-900">Le centre n’est pas dans la liste ?</div>
                    <div
                      className="cursor-pointer rounded-lg py-1 px-2 text-xs leading-4 text-blue-600 hover:bg-blue-50"
                      onClick={() => history.push(`/centre/nouveau?cohort=${selectedCohort}`)}>
                      Créer un centre
                    </div>
                  </div>
                </div>
              </div>
              {selectedCentre && (
                <div className="mt-4 text-sm font-medium leading-6">
                  <Field label="Nombre de places ouvertes" onChange={(e) => setPlacesTotal(e.target.value)} value={placesTotal} />
                </div>
              )}

              {user.role === ROLES.ADMIN && selectedCentre && (
                <div className="relative">
                  <div
                    ref={refStatus}
                    className={`mt-6 flex items-center justify-between rounded-lg bg-white py-2 pl-2 pr-4 ${
                      statusOpen ? "border-2 border-blue-500" : "border-[1px] border-gray-300"
                    }`}>
                    <div className="flex flex-col justify-center">
                      <div className="text-xs font-normal leading-6 text-gray-500 ">Statut de la session</div>
                      {status === "" ? (
                        <div className="h-5 text-sm leading-6 text-gray-800" />
                      ) : (
                        <div className="text-sm leading-6 text-gray-800">{statusOptions.find((e) => e.value === status).label}</div>
                      )}
                    </div>
                    <BsChevronDown className={`text-gray-500 ${open ? "rotate-180 transform" : ""}`} />
                  </div>
                  <div ref={refStatusSelect} className={`${!statusOpen ? "hidden" : ""} absolute z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg`}>
                    {statusOptions.map((item) => {
                      return (
                        <div
                          key={item.value}
                          onClick={() => {
                            setStatus(item.value);
                            setStatusOpen(false);
                          }}
                          className="flex cursor-pointer flex-col rounded-lg py-1 px-2 hover:bg-gray-50">
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
        <div className="mt-4 flex items-center gap-4">
          <button onClick={onCancel} className="w-1/2 rounded-lg border-[1px] border-gray-300 py-2 hover:shadow-ninaButton ">
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading}
            className="w-1/2 rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white hover:shadow-ninaButton disabled:cursor-not-allowed disabled:opacity-50">
            Créer la session
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
