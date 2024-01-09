import React, { useEffect, useState } from "react";
import { BsChevronDown, BsSearch } from "react-icons/bs";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, isPdrEditionOpen } from "snu-lib";
import { Select } from "@snu/ds/admin";
import ModalTailwind from "../../../components/modals/ModalTailwind";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import Field from "./Field";
import { useSelector } from "react-redux";

export default function ModalCreation({ isOpen, onCancel, defaultPDR = null, editable = true }) {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [availableCohorts, setAvailableCohorts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/cohort");
        const filteredCohorts = data.filter((cohort) => isPdrEditionOpen(user, cohort) === true && !defaultPDR?.cohorts.includes(cohort.name));
        const availableCohorts = filteredCohorts.map((cohort) => cohort.name);
        setAvailableCohorts(availableCohorts);
      } catch (err) {
        capture(err);
        toastr.error("Erreur", "Une erreur est survenue");
      }
    })();
  }, []);

  const refSelect = React.useRef(null);
  const refInput = React.useRef(null);
  const refContainer = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContainer.current && refContainer.current.contains(event.target)) {
        editable && setOpen((open) => !open);
      } else if (refSelect.current && !refSelect.current.contains(event.target)) {
        editable && setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const [listPDR, setListPDR] = React.useState([]);
  const [selectedCohort, setSelectedCohort] = React.useState();
  const [selectedPDR, setSelectedPDR] = React.useState(defaultPDR);
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
        const { ok, data } = await api.post("/elasticsearch/pointderassemblement/export", { filters: { searchbar: [search] } });
        if (!ok) return toastr.error("Oups, une erreur est survenue lors de la récupération des points de rassemblement");
        setListPDR(data);
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
      setIsLoading(false);
      setSelectedCohort(null);
      setComplementAddress("");
      setSearch("");
      !defaultPDR && setSelectedPDR(null);
      !defaultPDR && history.push(`/point-de-rassemblement/${PDR._id}?cohort=${selectedCohort}`);
      defaultPDR && onCancel(selectedCohort);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout du séjour");
      setIsLoading(false);
    }
  };

  const onClose = () => {
    setSelectedCohort(null);
    setComplementAddress("");
    setSearch("");
    !defaultPDR && setSelectedPDR(null);
    onCancel();
  };

  return (
    <ModalTailwind isOpen={isOpen} onClose={onClose} className="w-[600px] rounded-lg bg-white shadow-xl">
      <div className="flex w-full flex-col justify-between p-8">
        <div className="flex w-full flex-col">
          <div className="text-center text-xl font-medium leading-7 text-gray-800">Rattacher un point à un séjour</div>
          <hr className="my-8" />
          <div className="text-sm font-medium leading-6 text-gray-800">Choisissez un séjour</div>
          <div className="flex flex-row flex-wrap gap-2 py-2">
            <Select
              className="w-full"
              placeholder={"Choisissez une cohorte"}
              options={availableCohorts?.map((c) => ({ value: c, label: c }))}
              noOptionsMessage="Aucun séjour disponible"
              isSearchable
              isClearable
              closeMenuOnSelect
              value={selectedCohort ? { value: selectedCohort, label: selectedCohort } : null}
              onChange={(options) => {
                setSelectedCohort(options?.value);
              }}
            />
          </div>
          {selectedCohort ? (
            <>
              <div className="mt-4 text-sm font-medium leading-6 text-gray-500">Sélectionnez un point de rassemblement</div>
              <div className="relative">
                <div
                  ref={refContainer}
                  className={`mt-2 flex items-center justify-between rounded-lg bg-white py-2 pl-2 pr-4 shadow-sm ${
                    open ? "border-2 border-blue-500" : "border-[1px] border-gray-300"
                  }`}>
                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-normal leading-6 text-gray-500">Choisir un point de rassemblement</div>
                    {!selectedPDR ? <div className="h-5 text-sm leading-6 text-gray-800" /> : <div className="text-sm leading-6 text-gray-800">{selectedPDR.name}</div>}
                  </div>
                  {editable && <BsChevronDown className={`text-gray-500 ${open ? "rotate-180 transform" : ""}`} />}
                </div>

                <div
                  ref={refSelect}
                  className={`${!open ? "hidden" : ""} ${
                    listPDR.length > 3 ? "h-[300px] overflow-y-auto" : ""
                  } absolute left-0 z-50 w-full rounded-lg border border-gray-300 bg-white px-3 shadow-lg`}>
                  <div className="sticky top-0 z-10 bg-white pt-3">
                    <div className="flex flex-row items-center gap-2">
                      <BsSearch className="text-gray-400" />
                      <input
                        ref={refInput}
                        type="text"
                        placeholder="Rechercher un point de rassemblement"
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full text-[13px] leading-3 text-gray-800"
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
                      className="flex cursor-pointer flex-col rounded-lg py-1 px-2 hover:bg-gray-50">
                      <div className="text-sm leading-5 text-gray-900">{pdr.name}</div>
                      <div className="text-sm leading-5 text-gray-500">
                        {pdr.department} • {pdr.region}
                      </div>
                    </div>
                  ))}
                  {listPDR.length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <div className="text-xs leading-4 text-gray-900">Aucun point de rassemblement trouvé</div>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex flex-col items-center justify-center gap-2 pb-3">
                    <div className="text-sm leading-5 text-gray-900">Le point de rassemblement n’est pas dans la liste ?</div>
                    <div
                      className="cursor-pointer rounded-lg py-1 px-2 text-xs leading-4 text-blue-600 hover:bg-blue-50"
                      onClick={() => history.push(`/point-de-rassemblement/nouveau?cohort=${selectedCohort}`)}>
                      Créer un point de rassemblement
                    </div>
                  </div>
                </div>
              </div>
              {selectedPDR && (
                <>
                  <div className="mt-4 mb-2 text-sm font-medium leading-6 text-gray-500">Ajouter un complément d’adresse (optionnel)</div>
                  <Field label="Complément d’adresse" onChange={(e) => setComplementAddress(e.target.value)} value={complementAddress} />
                </>
              )}
            </>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button onClick={onClose} className="w-1/2 rounded-lg border-[1px] border-gray-300 py-2 hover:shadow-ninaButton ">
            Annuler
          </button>
          <button
            onClick={onSubmit}
            disabled={disabled || isLoading}
            className="w-1/2 rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white hover:shadow-ninaButton disabled:cursor-not-allowed disabled:opacity-50">
            Enregistrer
          </button>
        </div>
      </div>
    </ModalTailwind>
  );
}
