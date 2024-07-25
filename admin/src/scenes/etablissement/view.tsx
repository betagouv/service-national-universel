import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { HiHome, HiPlus } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { useQuery } from "@tanstack/react-query";

import { Page, Header, Button } from "@snu/ds/admin";
import { SUB_ROLES, ROLES, translate } from "snu-lib";
import api from "@/services/api";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";
import { AuthState } from "@/redux/auth/reducer";
import { ContactType } from "./components/types";
import { AlerteMessageDto } from "snu-lib/src/dto";

import Contact from "./components/Contact";
import GeneralInfos from "./components/GeneralInfos";
import FirstLoginAdminChef from "./components/modale/FirstLoginAdminChef";
import FirstLoginAdminCoordinator from "./components/modale/FirstLoginAdminCoordinator";
import FirstLoginRefClasse from "./components/modale/FirstLoginRefClasse";
import ButtonAddCoordinator from "./components/ButtonAddCoordinator";
import InfoMessage from "../dashboardV2/components/ui/InfoMessage";

export default function View() {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const { id } = useParams<{ id: string }>();
  const [classeId, setClasseId] = useState("");
  const [etablissement, setEtablissement] = useState<EtablissementDto | null>(null);
  const [contacts, setContacts] = useState<ContactType[]>([]);

  const history = useHistory();

  const { data: messages } = useQuery<AlerteMessageDto[]>({
    queryKey: ["alerte-messages", "user"],
    queryFn: async () => {
      const { ok, code, data: response } = await api.get(`/alerte-message`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des messages", translate(code));
        throw new Error(translate(code));
      }
      return response.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
  });

  const getEtablissement = async () => {
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
    getEtablissement();
  }, []);

  if (!etablissement) return <Loader />;

  return (
    <Page>
      {messages?.map((msg) => <InfoMessage key={msg._id} title={msg.title} message={msg.content} priority={msg.priority} className="mb-6" />)}
      <Header
        title={etablissement.name}
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Fiche de mon établissement" }]}
        actions={[
          [ROLES.ADMIN].includes(user.role) && (
            <Button
              key="create-classe"
              title="Créer une classe"
              leftIcon={<HiPlus size={20} />}
              onClick={() => history.push("/classes/create?etablissementId=" + etablissement._id)}
              disabled={true}
            />
          ),
          user.subRole === SUB_ROLES.referent_etablissement && <ButtonAddCoordinator etablissement={etablissement} />,
        ]}
      />
      <Contact contacts={contacts} user={user} etablissementId={etablissement?._id} getEtablissement={getEtablissement} />

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
