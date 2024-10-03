import React, { useState, useEffect } from "react";
import { HiPlus } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import { Button, ModalConfirmation, InputText, Label, Select } from "@snu/ds/admin";
import { ProfilePic } from "@snu/ds";
import validator from "validator";
import { capture } from "@/sentry";
import api from "@/services/api";
import { ERRORS, translate, ReferentType, EtablissementType } from "snu-lib";

interface Props {
  etablissement: EtablissementType;
  onChange: () => void;
}
interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  coordinator?: string;
}
interface NewCoordinator {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
}

export default function ButtonAddCoordinator({ etablissement, onChange }: Props) {
  const [modalAddCoordinator, setModalAddCoordinator] = useState(false);
  const [newCoordinator, setNewCoordinator] = useState<NewCoordinator>({ firstName: "", lastName: "", email: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [referentList, setReferentList] = useState<ReferentType[]>([]);

  useEffect(() => {
    loadReferents({ etablissementId: etablissement._id, coordinateurs: etablissement.coordinateurs });
  }, []);

  const loadReferents = async ({ etablissementId, coordinateurs }) => {
    try {
      const { ok, code, data: classes } = await api.get(`/cle/classe/from-etablissement/${etablissementId}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des referents", translate(code));
      }

      const refList = classes.flatMap((classe) =>
        classe.referent
          .filter((r) => Boolean(r))
          .map((referent) => ({
            ...referent,
            value: referent._id,
            label: `${referent.firstName} ${referent.lastName}`,
          })),
      );
      const uniqueIds = new Set();

      const uniqueArray = [...(coordinateurs ?? []), ...refList].filter((item) => {
        if (!uniqueIds.has(item._id)) {
          uniqueIds.add(item._id);
          return true;
        }
        return false;
      });
      setReferentList(uniqueArray);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des contacts", "");
    }
  };

  const sendInvitation = async () => {
    try {
      setErrors({});
      const error: Errors = {};

      if (!newCoordinator.firstName) error.firstName = "Ce champ est obligatoire";
      if (!newCoordinator.lastName) error.lastName = "Ce champ est obligatoire";
      if (!newCoordinator.email || !validator.isEmail(newCoordinator.email)) error.email = "L'email est incorrect";
      if (etablissement.coordinateurIds.length === 2) error.coordinator = "Vous avez déjà deux coordinateurs pour cet établissement.";

      if (Object.keys(error).length > 0) {
        setErrors(error);
        return;
      }

      const { ok, code } = await api.post(`/cle/referent/invite-coordonnateur`, { ...newCoordinator, etablissementId: etablissement._id });

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(code));
        setNewCoordinator({ firstName: "", lastName: "", email: "" });
        return setModalAddCoordinator(false);
      }

      setErrors({});
      setNewCoordinator({ firstName: "", lastName: "", email: "" });
      setModalAddCoordinator(false);
      onChange();
      return toastr.success("Succès", "Invitation envoyée");
    } catch (e) {
      capture(e);
      setNewCoordinator({ firstName: "", lastName: "", email: "" });
      setModalAddCoordinator(false);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED)
        return toastr.error("Cette adresse email est déjà utilisée.", `${newCoordinator.email} a déjà un compte sur cette plateforme.`, { timeOut: 10000 });
      toastr.error("Oups, une erreur est survenue lors de l'ajout du nouveau membre", translate(e));
    }
  };

  return (
    <>
      <Button
        key="modal-coordinator"
        className="ml-2"
        title="Ajouter un coordinateur"
        leftIcon={<HiPlus size={20} className="mt-0.5" />}
        onClick={() => setModalAddCoordinator(true)}
      />
      <ModalConfirmation
        isOpen={modalAddCoordinator}
        onClose={() => {
          setModalAddCoordinator(false);
          setNewCoordinator({ firstName: "", lastName: "", email: "" });
          setErrors({});
        }}
        className="md:max-w-[700px]"
        icon={<ProfilePic />}
        title="Ajouter un coordinateur d’établissement"
        tooltip="Vous pouvez ajouter jusqu’à deux coordinateurs d’établissement par établissement."
        text={
          <div className="mt-6 w-[636px] text-left text-ds-gray-900">
            {errors.coordinator && <div className="text-red-500 mb-2">{errors.coordinator}</div>}
            <Label name="" title="Renseignez les informations du nouveau coordinateur ..." />
            <InputText
              className="mb-3"
              label="Nom"
              placeholder="Préciser"
              error={errors.lastName}
              name={"lastName"}
              value={newCoordinator.lastName}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, lastName: e.target.value })}
            />
            <InputText
              className="mb-3"
              label="Prénom"
              placeholder="Préciser"
              error={errors.firstName}
              name={"firstName"}
              value={newCoordinator.firstName}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, firstName: e.target.value })}
            />
            <InputText
              className="mb-3"
              type="email"
              label="Adresse email"
              placeholder="Préciser"
              error={errors.email}
              name={"email"}
              value={newCoordinator.email}
              onChange={(e) => setNewCoordinator({ ...newCoordinator, email: e.target.value })}
            />
            <div className="flex-1">
              <Label name="" title="... ou ajoutez référent de classe existant" />
              <Select
                className="mb-3"
                isActive={true}
                placeholder={"Choisir un référent existant"}
                noOptionsMessage={"Aucun référent trouvé"}
                // @ts-ignore
                options={referentList}
                closeMenuOnSelect={true}
                isClearable={true}
                value={newCoordinator?._id ? { label: `${newCoordinator?.firstName} ${newCoordinator?.lastName}`, value: newCoordinator._id } : null}
                onChange={(options) => {
                  // @ts-ignore
                  options ? setNewCoordinator(referentList.find((referent) => referent._id === options.value)) : setNewCoordinator({});
                }}
              />
            </div>
          </div>
        }
        actions={[
          { title: "Annuler", isCancel: true },
          { title: "Valider", onClick: () => sendInvitation() },
        ]}
      />
    </>
  );
}
