import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

import { Page, Header, Button } from "@snu/ds/admin";
import { ROLES, translate, isCoordinateurEtablissement, isChefEtablissement, isReferentOrAdmin, ReferentDto, EtablissementType } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";
import { AuthState } from "@/redux/auth/reducer";

import Contact from "./components/Contact";
import GeneralInfos from "./components/GeneralInfos";
import FirstLoginAdminChef from "./components/modale/FirstLoginAdminChef";
import FirstLoginAdminCoordinator from "./components/modale/FirstLoginAdminCoordinator";
import FirstLoginRefClasse from "./components/modale/FirstLoginRefClasse";
import ButtonAddCoordinator from "./components/ButtonAddCoordinator";

export default function View() {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const { id } = useParams<{ id: string }>();
  const [classeId, setClasseId] = useState("");
  const [etablissement, setEtablissement] = useState<EtablissementType | null>(null);
  const [contacts, setContacts] = useState<ReferentDto[]>([]);

  const history = useHistory();

  const loadEtablissement = async () => {
    try {
      const url = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "/cle/etablissement/from-user" : `/cle/etablissement/${id}`;
      const { ok, code, data: response } = await api.get(url);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setEtablissement(response);
      setContacts(response.referents.concat(response.coordinateurs));
      if (user.role === ROLES.REFERENT_CLASSE) {
        setClasseId(response.classes[0].id);
      }
    } catch (e) {
      capture(e);
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la récupération de l'établissement");
    }
  };

  useEffect(() => {
    loadEtablissement();
  }, []);

  if (!etablissement) return <Loader />;

  const breadcrumb = ![ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)
    ? [
        { title: "Séjours" },
        {
          title: "Établissements",
          to: "/etablissement",
        },
      ]
    : [{ title: "Fiche de l'établissement" }];

  return (
    <Page>
      <Header
        title={etablissement.name}
        breadcrumb={breadcrumb}
        actions={[
          [ROLES.ADMIN].includes(user.role) && (
            <Button
              key="create-classe"
              title="Créer une classe"
              leftIcon={<HiPlus size={20} />}
              onClick={() => history.push("/classes/create?etablissementId=" + etablissement._id)}
            />
          ),
          (isChefEtablissement(user) || isReferentOrAdmin(user)) && contacts.filter(isCoordinateurEtablissement).length < 2 && (
            <ButtonAddCoordinator etablissement={etablissement} onChange={loadEtablissement} />
          ),
        ]}
      />
      <Contact contacts={contacts} user={user} etablissementId={etablissement?._id} onChange={loadEtablissement} />

      <GeneralInfos etablissement={etablissement} onUpdateEtab={setEtablissement} user={user} />

      {/* First login ADMINISTRATEUR_CLE referent-etablissement */}
      <FirstLoginAdminChef user={user} etablissement={etablissement} />

      {/* First login ADMINISTRATEUR_CLE coordinateur-cle */}
      <FirstLoginAdminCoordinator user={user} />

      {/* First login REFERENT_CLASSE */}
      <FirstLoginRefClasse user={user} classeId={classeId} />
    </Page>
  );
}
