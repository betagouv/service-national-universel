import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { translate, isSessionEditionOpen, validateEmailAcademique } from "snu-lib";
import { InputText, Label, Select } from "@snu/ds/admin";

import { Center, User } from "@/types";
import { CohortState } from "@/redux/cohorts/reducer";
import ModalTailwind from "@/components/modals/ModalTailwind";
import { capture } from "@/sentry";
import api from "@/services/api";

interface Props {
  isOpen?: boolean;
  onSuccess: (cohortName?: string) => void;
  onCancel: () => void;
  user: User;
  defaultCentre?: Center | null;
  editable?: boolean;
}

export default function ModalRattacherCentre({ isOpen, onSuccess, onCancel, user, defaultCentre = null, editable = true }: Props) {
  const history = useHistory();
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const availableCohorts = isOpen ? cohorts.filter((c) => isSessionEditionOpen(user, c)).map((c) => c.name) : [];

  const [selectedCohort, setSelectedCohort] = React.useState<string>();
  const [selectedCentre, setSelectedCentre] = React.useState(defaultCentre || null);
  const [placesTotal, setPlacesTotal] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const disabled = !selectedCohort || !selectedCentre || placesTotal === "" || isLoading;

  const fetchCenters = async (q) => {
    const { responses } = await api.post("/elasticsearch/cohesioncenter/not-in-cohort/" + selectedCohort, { filters: { searchbar: [q] } });
    return responses[0].hits.hits.map((hit) => {
      return { label: hit._source.name, value: hit._id, center: hit._source };
    });
  };

  const onSubmit = async () => {
    if (email && !validateEmailAcademique(email)) {
      toastr.error("L’adresse email ne semble pas valide.", "Veuillez vérifier qu’il s’agit bien d’une adresse académique.");
      return;
    }
    if (!selectedCentre) {
      toastr.error("Veuillez sélectionner un centre", "");
      return;
    }
    try {
      setIsLoading(true);
      const { ok, code, data } = await api.put(`/cohesion-center/${selectedCentre}/session-phase1`, {
        cohort: selectedCohort,
        placesTotal,
        email,
      });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout de la session", translate(code));
        return setIsLoading(false);
      }
      setIsLoading(false);
      toastr.success("La centre a été rattaché au séjour avec succès", "");
      onCancel();
      if (onSuccess) onSuccess(data);
      history.push(`/centre/${selectedCentre}?cohorte=${selectedCohort}`);
      setSelectedCohort("");
      setPlacesTotal("");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la session", "");
      setIsLoading(false);
    }
  };

  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[600px] rounded-lg bg-white shadow-xl">
      <form onSubmit={onSubmit} className="flex w-full flex-col justify-between p-8">
        <div className="flex w-full flex-col">
          <div className="text-center text-xl font-medium leading-7 text-gray-800">Rattacher un centre à un séjour</div>
          <hr className="my-8" />
          <Label title="Choisissez un séjour" name="cohorte" />
          <Select
            className="w-full"
            placeholder={"Choisissez une cohorte"}
            options={availableCohorts.map((c) => ({ value: c, label: c }))}
            isSearchable
            isClearable
            closeMenuOnSelect
            value={selectedCohort ? { value: selectedCohort, label: selectedCohort } : null}
            onChange={(options) => setSelectedCohort(options?.value)}
          />
          {selectedCohort ? (
            <>
              <Label title="Choisissez un centre" name="centre" className="mt-4" />
              <Select
                placeholder="Choisissez un centre"
                value={selectedCentre ? { label: selectedCentre.name, value: selectedCentre._id } : null}
                onChange={(option) => setSelectedCentre(option.center)}
                closeMenuOnSelect
                isAsync
                loadOptions={(q) => fetchCenters(q)}
                readOnly={!editable}
              />
              {selectedCentre && (
                <InputText
                  name="placesTotal"
                  label={`Nombre de places ouvertes pour le séjour ${selectedCohort}`}
                  onChange={(e) => setPlacesTotal(e.target.value)}
                  value={placesTotal}
                  className="mt-4"
                />
              )}
              {selectedCentre?.region === "Provence-Alpes-Côte d'Azur" && selectedCohort === "Juin 2024 - 2" && (
                <div className="mt-3">
                  <Label title="Adresse email académique" tooltip="Adresse email académique sécurisée" name="email" />
                  <InputText name="email" label="Adresse email académique" onChange={(e) => setEmail(e.target.value)} value={email} className="mt-1" />
                </div>
              )}
            </>
          ) : null}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <button type="button" onClick={onCancel} className="w-1/2 rounded-lg border-[1px] border-gray-300 py-2 hover:shadow-ninaButton ">
            Annuler
          </button>
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="w-1/2 rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white hover:shadow-ninaButton disabled:cursor-not-allowed disabled:opacity-50">
            Créer la session
          </button>
        </div>
      </form>
    </ModalTailwind>
  );
}
