import React, { useEffect, useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Label, InputText, ModalConfirmation, Select } from "@snu/ds/admin";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { useHistory } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";

export default function create() {
  const [etablissement, setEtablissement] = useState({});
  const [classe, setClasse] = useState({
    cohort: "CLE 23-24", // cohorte a définir
  });
  const [errors, setErrors] = useState({});
  const [referentClasse, setReferentClasse] = useState({});
  const [contacts, setContacts] = useState([]);
  const [referentList, setReferentList] = useState([]);
  const [modalConfirmation, setModalConfirmation] = useState(false);

  const history = useHistory();

  const getEtablissement = async () => {
    try {
      const { ok, code, data: response } = await api.get("/etablissement");

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setEtablissement(response);
      setClasse({ ...classe, uniqueKey: response.uai + "_11/10/2024_" }); //date a définir
      getContacts(response);
    } catch (e) {
      console.log(e);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement");
    }
  };

  const getContacts = async (etablissement) => {
    let contactList = etablissement.referentEtablissementIds.concat(etablissement.coordinateurIds);
    try {
      const requests = contactList.map(async (referentId) => {
        const { ok, code, data: response } = await api.get(`/referent/${referentId}`);

        if (!ok) {
          return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
        }

        return response;
      });
      const contactResponses = await Promise.all(requests);
      setContacts(contactResponses);
      setReferentList(contactResponses.map((contact) => ({ label: `${contact.firstName} ${contact.lastName}`, value: contact.id })));
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des contacts");
    }
  };

  useEffect(() => {
    getEtablissement();
  }, []);

  const actions = [
    <a key="cancel" href="/mes-classes" className="mr-2">
      <Button title="Annuler" type="secondary" disabled />
    </a>,
    <Button key="create" leftIcon={<ClasseIcon />} title="Créer cette classe" disabled={!classe.uniqueId} onClick={() => setModalConfirmation(true)} />,
  ];

  return (
    <Page>
      <Header
        title="Création d’une classe engagée"
        breadcrumb={[{ title: <ClasseIcon className="scale-[65%]" /> }, { title: "Mes classes", to: "/mes-classes" }, { title: "Créer une classe" }]}
        actions={actions}
      />
      <Container title="Informations générales">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" tooltip="This is a test and need to be replaced." />
            <InputText value={classe.cohort} disabled />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label title="Numéro d’identification" tooltip="This is a test and need to be replaced." />
            <div className="flex items-center justify-between gap-3">
              <InputText className="flex-1" value={classe.uniqueKey} disabled />
              <InputText
                className="flex-1"
                placeholder="Préciser (15 caractères max.)"
                value={classe.uniqueId}
                onChange={(e) => setClasse({ ...classe, uniqueId: e.target.value })}
                error={errors.uniqueId}
              />
            </div>
          </div>
        </div>
      </Container>
      <Container title="Référent de classe">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Nouveau référent de classe ..." />
            <InputText
              className="mb-3"
              label="Nom"
              placeholder="Préciser"
              value={referentClasse.lastName}
              onChange={(e) => setReferentClasse({ ...referentClasse, lastName: e.target.value })}
            />
            <InputText
              className="mb-3"
              label="Prénom"
              placeholder="Préciser"
              value={referentClasse.firstName}
              onChange={(e) => setReferentClasse({ ...referentClasse, firstName: e.target.value })}
            />
            <InputText
              label="Adresse email"
              type="email"
              placeholder="Préciser"
              value={referentClasse.email}
              onChange={(e) => setReferentClasse({ ...referentClasse, email: e.target.value })}
            />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label title="... ou référent de classe existant" />
            <Select
              className="mb-3"
              isActive={true}
              placeholder={"Choisissez un référent éxistant"}
              options={referentList}
              closeMenuOnSelect={true}
              value={referentClasse._id ? { label: `${referentClasse?.firstName} ${referentClasse?.lastName}`, value: referentClasse._id } : null}
              onChange={(options) => {
                setReferentClasse(referentList.find((referent) => referent.id === options.value));
              }}
              error={errors.type}
            />
          </div>
        </div>
      </Container>
      <div className="flex items-center justify-end">{actions}</div>

      <ModalConfirmation
        isOpen={modalConfirmation}
        onClose={() => setModalConfirmation(false)}
        className="md:max-w-[700px]"
        icon={<ProfilePic icon={({ size, className }) => <ClasseIcon size={size} className={className} />} />}
        title="Confirmez-vous ces informations ?"
        text={
          <div className="text-left w-[636px] text-ds-gray-900">
            <div className="my-6">
              <div className="text-lg mb-2">Informations générales</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Numéro d’identification</div>
                <div className="flex-1 font-bold text-right">75IDF_11/10/2024_XYZ12</div>
              </div>
            </div>
            <div className="my-6">
              <div className="text-lg mb-2">Référent de classe</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Prénom et Nom</div>
                <div className="flex-1 font-bold text-right">Amandine PIGNON</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Adresse email</div>
                <div className="flex-1 font-bold text-right">amandine.pignon@ac-paris.fr</div>
              </div>
            </div>
          </div>
        }
        actions={[
          { title: "Modifier", isCancel: true },
          { title: "Valider", onClick: () => history.push("/mes-classes/1") },
        ]}
      />
    </Page>
  );
}
