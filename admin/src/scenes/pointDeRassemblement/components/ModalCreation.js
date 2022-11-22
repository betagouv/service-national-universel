import React from "react";
import { BsChevronDown, BsSearch } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, START_DATE_SESSION_PHASE1 } from "snu-lib";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import Field from "./Field";

export default function ModalCreation({ isOpen, onCancel }) {
  const history = useHistory();
  const availableCohorts = Object.keys(START_DATE_SESSION_PHASE1).reduce((acc, cohort) => {
    return START_DATE_SESSION_PHASE1[cohort] > new Date() ? [...acc, cohort] : acc;
  }, []);

  const refSelect = React.useRef(null);
  const refInput = React.useRef(null);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refSelect.current && !refSelect.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const [listPDR, setListPDR] = React.useState([]);
  const [selectedCohort, setSelectedCohort] = React.useState();
  const [selectedPDR, setSelectedPDR] = React.useState();
  const [complementAddress, setComplementAddress] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      refInput.current.focus();
    }
  }, [open]);

  React.useEffect(() => {
    setDisabled(!selectedCohort || !selectedPDR);
  }, [selectedPDR, selectedCohort]);

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
                    fields: ["name", "address", "city", "zip", "department", "region", "code"],
                    type: "cross_fields",
                    operator: "and",
                  },
                },
                {
                  multi_match: {
                    query: search,
                    fields: ["name", "address", "city", "zip", "department", "region", "code"],
                    type: "phrase",
                    operator: "and",
                  },
                },
                {
                  multi_match: {
                    query: search,
                    fields: ["name", "address", "city", "zip", "department", "region", "code"],
                    type: "phrase_prefix",
                    operator: "and",
                  },
                },
              ],
              minimum_should_match: "1",
            },
          });
        }
        const { responses } = await api.esQuery("pointderassemblement", body);
        setListPDR(
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

      const {
        ok,
        code,
        data: PDR,
      } = await api.put(`/point-de-rassemblement/cohort/${selectedPDR._id}`, {
        cohort: selectedCohort,
        complementAddress,
      });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout du séjour", code);
        return setIsLoading(false);
      }
      history.push(`/point-de-rassemblement/${PDR._id}`);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout du séjour");
      setIsLoading(false);
    }
  };

  return (
    // <Modal centered isOpen={isOpen} onCancel={onCancel}>
    <ModalTailwind isOpen={isOpen} onClose={onCancel} size="w-[600px]">
      <div className="flex flex-col p-8 h-[600px] w-full justify-between">
        <div className="flex flex-col w-full">
          <div className="font-medium text-xl text-gray-800 leading-7 text-center">Rattacher un point à un séjour</div>
          <hr className="my-8" />
          <div className="text-gray-800 text-sm font-medium leading-6">Choisissez un séjour</div>
          <div className="flex flex-row gap-2 flex-wrap py-2">
            {availableCohorts.map((cohort) => (
              <div
                key={cohort}
                onClick={() => setSelectedCohort(cohort)}
                className={`rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] ${
                  selectedCohort === cohort ? "border-blue-600 text-white bg-blue-600" : "border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF] "
                }`}>
                {cohort}
              </div>
            ))}
          </div>
          {selectedCohort ? (
            <>
              <div className="text-gray-500 text-sm font-medium leading-6 mt-4">Sélectionnez un point de rassemblement</div>
              <div className="relative">
                <div
                  onClick={() => {
                    setOpen(!open);
                  }}
                  className={`mt-2 py-2 pl-2 pr-4 flex items-center justify-between shadow-sm rounded-lg bg-white ${
                    open ? "border-blue-500 border-2" : "border-[1px] border-gray-300"
                  }`}>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs leading-6 font-normal text-gray-500">Choisir un point de rassemblement</div>
                    {!selectedPDR ? <div className="text-sm leading-6 text-gray-800 h-5" /> : <div className="text-sm leading-6 text-gray-800">{selectedPDR.name}</div>}
                  </div>
                  <BsChevronDown className={`text-gray-500 ${open ? "transform rotate-180" : ""}`} />
                </div>

                <div
                  ref={refSelect}
                  className={`${!open ? "hidden" : ""} ${
                    listPDR.length > 3 ? "h-[300px] overflow-y-auto" : ""
                  } absolute left-0 w-full bg-white shadow-lg rounded-lg border border-gray-300 px-3 z-50`}>
                  <div className="sticky top-0 bg-white z-10 pt-3">
                    <div className="flex flex-row gap-2 items-center">
                      <BsSearch className="text-gray-400" />
                      <input
                        ref={refInput}
                        type="text"
                        placeholder="Rechercher un point de rassemblement"
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-gray-800 text-[13px] leading-3"
                      />
                    </div>
                    <hr className="my-2" />
                  </div>
                  {listPDR.map((pdr) => (
                    <div
                      key={pdr._id}
                      onClick={() => {
                        setSelectedPDR(pdr);
                        setOpen(false);
                      }}
                      className="flex flex-col py-1 px-2 cursor-pointer hover:bg-gray-50 rounded-lg">
                      <div className="text-sm leading-5 text-gray-900">{pdr.name}</div>
                      <div className="text-sm leading-5 text-gray-500">
                        {pdr.department} • {pdr.region}
                      </div>
                    </div>
                  ))}
                  {listPDR.length === 0 && (
                    <div className="flex items-center gap-2 py-2 justify-center">
                      <div className="text-xs leading-4 text-gray-900">Aucun point de rassemblement trouvé</div>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex flex-col items-center gap-2 justify-center pb-3">
                    <div className="text-sm leading-5 text-gray-900">Le point de rassemblement n’est pas dans la liste ?</div>
                    <div
                      className="text-xs leading-4 text-blue-600 py-1 px-2 rounded-lg hover:bg-blue-50 cursor-pointer"
                      onClick={() => history.push(`/point-de-rassemblement/nouveau?cohort=${selectedCohort}`)}>
                      Créer un point de rassemblement
                    </div>
                  </div>
                </div>
              </div>
              {selectedPDR && (
                <>
                  <div className="text-gray-500 text-sm font-medium leading-6 mt-4 mb-2">Ajouter un complément d’adresse (optionnel)</div>
                  <Field label="Complément d’adresse" onChange={(e) => setComplementAddress(e.target.value)} value={complementAddress} />
                </>
              )}
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="w-1/2 border-[1px] border-gray-300 py-2 rounded-lg hover:shadow-ninaButton ">
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading}
            className="border-[1px] border-blue-600 text-white bg-blue-600 py-2 w-1/2 rounded-lg hover:shadow-ninaButton disabled:opacity-50 disabled:cursor-not-allowed">
            Enregistrer
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
