import React, { useEffect, useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Label, InputText, ModalConfirmation, Select } from "@snu/ds/admin";
import ClasseIcon from "@/components/drawer/icons/Classe";
import { useHistory } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate, ROLES, SUB_ROLES } from "snu-lib";

export default function create() {
  const [etablissement, setEtablissement] = useState({});
  const [classe, setClasse] = useState({
    cohort: "CLE 23-24", // cohorte a définir
  });
  const [errors, setErrors] = useState({});
  const [referentClasse, setReferentClasse] = useState({});
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
      getReferents(response._id);
    } catch (e) {
      console.log(e);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement");
    }
  };

  const getReferents = async (id) => {
    try {
      const { ok, code, data: classes } = await api.get(`/cle/classe/from-etablissement/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération des referents", translate(code));
      }
      const referentsList = classes.flatMap((classe) =>
        classe.referents.map((referent) => ({
          ...referent,
          value: referent._id,
          label: `${referent.firstName} ${referent.lastName}`,
        })),
      );
      setReferentList(referentsList);
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
      <Button title="Annuler" type="secondary" />
    </a>,
    <Button key="create" leftIcon={<ClasseIcon />} title="Créer cette classe" disabled={!classe.uniqueId} onClick={() => setModalConfirmation(true)} />,
  ];
  console.log(classe);
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
                active={true}
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
              active={true}
              value={referentClasse?.lastName || ""}
              onChange={(e) => setReferentClasse({ ...referentClasse, lastName: e.target.value })}
              error={errors.lastName}
            />
            <InputText
              className="mb-3"
              label="Prénom"
              placeholder="Préciser"
              active={true}
              value={referentClasse?.firstName || ""}
              onChange={(e) => setReferentClasse({ ...referentClasse, firstName: e.target.value })}
              error={errors.firstName}
            />
            <InputText
              label="Adresse email"
              type="email"
              placeholder="Préciser"
              active={true}
              value={referentClasse?.email || ""}
              onChange={(e) => setReferentClasse({ ...referentClasse, email: e.target.value })}
              error={errors.email}
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
              isClearable={true}
              value={referentClasse?._id ? { label: `${referentClasse?.firstName} ${referentClasse?.lastName}`, value: referentClasse._id } : null}
              onChange={(options) => {
                options ? setReferentClasse(referentList.find((referent) => referent._id === options.value)) : setReferentClasse({});
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
                <div className="flex-1 font-bold text-right">{classe.uniqueKey + classe.uniqueId}</div>
              </div>
            </div>
            <div className="my-6">
              <div className="text-lg mb-2">Référent de classe</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Prénom et Nom</div>
                <div className="flex-1 font-bold text-right">{referentClasse.firstName + " " + referentClasse.lastName}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Adresse email</div>
                <div className="flex-1 font-bold text-right">{referentClasse.email}</div>
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
