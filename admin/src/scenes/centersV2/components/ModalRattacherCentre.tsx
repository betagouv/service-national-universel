import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { translate, isSessionEditionOpen, validateEmailAcademique, COHORT_TYPE } from "snu-lib";
import { InputText, Label, Select } from "@snu/ds/admin";
import Sejour from "@/scenes/dashboardV2/components/ui/icons/Sejour";
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
  const availableCohorts = cohorts.filter((c) => isSessionEditionOpen(user, c)).map((c) => c.name);

  const [selectedCohort, setSelectedCohort] = React.useState<string>();
  const [selectedCentre, setSelectedCentre] = React.useState(defaultCentre);
  const [placesTotal, setPlacesTotal] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const disabled = !selectedCohort || !selectedCentre || !placesTotal || isLoading;

  const selectedCohortData = cohorts.find((c) => c.name === selectedCohort);

  const fetchCenters = async (q: string) => {
    const { responses } = await api.post("/elasticsearch/cohesioncenter/not-in-cohort/" + selectedCohort, { filters: { searchbar: [q] } });
    const options = responses[0].hits.hits.map((hit) => ({ label: hit._source.name, value: hit._id, center: { ...hit._source, _id: hit._id } }));
    return options;
  };

  const handleChange = (option) => {
    if (option.value === "new") {
      history.push(`/centre/nouveau?cohort=${selectedCohort}`);
      return;
    }
    setSelectedCentre(option.center);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (email && !validateEmailAcademique(email)) {
      setErrors({ email: "L’adresse email ne semble pas valide. Veuillez vérifier qu’il s’agit bien d’une adresse académique." });
      return;
    }
    if (!selectedCentre) {
      setErrors({ center: "Veuillez sélectionner un centre" });
      return;
    }

    try {
      setIsLoading(true);
      const { ok, code, data } = await api.put(`/cohesion-center/${selectedCentre._id}/session-phase1`, {
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
      history.push(`/centre/${selectedCentre._id}?cohorte=${selectedCohort}`);
      setSelectedCohort("");
      setPlacesTotal("");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de l'ajout de la session", "");
      setIsLoading(false);
    }
  };

  return (
    <ModalTailwind isOpen={isOpen} onClose={onCancel} className="w-[42rem] rounded-xl bg-white shadow-xl">
      <form onSubmit={onSubmit} className="p-8">
        <div className="mx-auto rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center">
          <Sejour />
        </div>
        <h2 className="text-center text-xl font-medium leading-7 text-gray-800 mx-0 my-4">Rattacher un centre à un séjour</h2>
        <Label title="Séjour" name="cohorte" className="my-3" />
        <Select
          placeholder={"Choisissez une cohorte"}
          options={availableCohorts.map((c) => ({ value: c, label: c }))}
          isSearchable
          isClearable
          closeMenuOnSelect
          value={selectedCohort ? { value: selectedCohort, label: selectedCohort } : null}
          onChange={(options) => setSelectedCohort(options?.value)}
        />
        {selectedCohort && (
          <>
            <Label title="Centre" name="centre" className="my-3" />
            <Select
              label="Nom du centre"
              placeholder="Nom du centre"
              value={selectedCentre ? { label: selectedCentre.name, value: selectedCentre._id } : null}
              onChange={handleChange}
              closeMenuOnSelect
              isAsync
              loadOptions={fetchCenters}
              readOnly={!editable}
              error={errors.center}
            />
          </>
        )}
        {selectedCentre && (
          <>
            <Label title={`Places ouvertes pour le séjour ${selectedCohort || ""}`} name="placesTotal" className="my-3" />
            <InputText name="placesTotal" label="Nombre de places ouvertes" onChange={(e) => setPlacesTotal(e.target.value)} value={placesTotal} className="mt-3" />
          </>
        )}

        {selectedCohortData?.type === COHORT_TYPE.VOLONTAIRE && (
          <>
            <Label
              title="Réception des fiches sanitaires (facultatif)"
              tooltip="Si vous renseignez l'adresse email suivante, elle sera visible sur l'espace personnel des volontaires. Ils seront ainsi invités à envoyer leurs fiches sanitaires à cette adresse. Seules les adresses emails académiques sécurisées sont autorisées."
              name="email"
              className="my-3"
            />
            <InputText name="email" label="Adresse email académique" onChange={(e) => setEmail(e.target.value)} value={email} error={errors.email} />
          </>
        )}

        <div className="mt-10 flex items-center gap-4">
          <button type="button" onClick={onCancel} className="w-1/2 rounded-lg border-[1px] border-gray-300 py-2">
            Annuler
          </button>
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="w-1/2 rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50">
            Créer la session
          </button>
        </div>
      </form>
    </ModalTailwind>
  );
}
