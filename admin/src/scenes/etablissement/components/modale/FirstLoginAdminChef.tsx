import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation, Button } from "@snu/ds/admin";
import { User } from "@/types";
import { ROLES, SUB_ROLES } from "snu-lib";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";

import ButtonAddCoordinator from "../ButtonAddCoordinator";

interface Props {
  user: User;
  etablissement: EtablissementDto;
}

export default function FirstLoginAdminChef({ user, etablissement }: Props) {
  const [modalChef, setModalChef] = useState(false);
  const history = useHistory();
  const firstLogin = localStorage.getItem("cle_referent_signup_first_time");

  useEffect(() => {
    if (firstLogin && user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.referent_etablissement) {
      setModalChef(true);
    }
  }, [firstLogin]);

  {
    /* First login ADMINISTRATEUR_CLE referent_etablissement */
  }

  return (
    <ModalConfirmation
      isOpen={modalChef}
      onClose={() => {
        setModalChef(false);
        localStorage.removeItem("cle_referent_signup_first_time");
      }}
      className="md:max-w-[700px]"
      icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
      title={`Bonjour ${user.firstName} ${user.lastName} !`}
      text="Bienvenue sur votre compte Administrateur CLE en tant que Chef d’établissement. Vous pouvez créer une classe engagée et ajouter un coordinateur d'établissement."
      actions={
        <div className="flex items-center justify-between gap-3">
          <Button title="Créer une classe engagée" leftIcon={<HiOutlineOfficeBuilding size={20} />} onClick={() => history.push("/classes/create")} />
          <ButtonAddCoordinator etablissement={etablissement} />
        </div>
      }
    />
  );
}
