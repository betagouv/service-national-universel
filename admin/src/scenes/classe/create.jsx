import React, { useEffect, useState } from "react";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Label, InputText, ModalConfirmation, Select } from "@snu/ds/admin";
import { HiOutlineChartSquareBar, HiOutlineOfficeBuilding } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";
import { capture } from "@/sentry";
import api from "@/services/api";
import { toastr } from "react-redux-toastr";
import { translate, canCreateClasse } from "snu-lib";
import validator from "validator";
import { ERRORS } from "snu-lib";
import Loader from "@/components/Loader";
import { useSelector } from "react-redux";

export default function Create() {
  const user = useSelector((state) => state.Auth.user);
  const [classe, setClasse] = useState({
    cohort: "CLE 23-24",
    uniqueId: "",
  });
  const [errors, setErrors] = useState({});
  const [referentClasse, setReferentClasse] = useState({});
  const [referentList, setReferentList] = useState([]);
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (!canCreateClasse(user)) history.push("/classes");
  }, [user, history]);

  const getEtablissement = async () => {
    try {
      const etablissementId = new URLSearchParams(history.location.search).get("etablissementId");
      const { ok, code, data: response } = await api.get(etablissementId ? `/cle/etablissement/${etablissementId}` : "/cle/etablissement/from-user");

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setClasse({ ...classe, uniqueKey: response.uai, etablissementId: response._id, etablissement: response });
      getReferents({
        etablissementId: response._id,
        coordinateurs: response.coordinateurs.map((referent) => ({ ...referent, value: referent._id, label: `${referent.firstName} ${referent.lastName}` })),
      });
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement");
    }
  };

  const getReferents = async ({ etablissementId, coordinateurs }) => {
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
      toastr.error("Oups, une erreur est survenue lors de la récupération des contacts");
    }
  };

  useEffect(() => {
    getEtablissement();
  }, []);

  const validate = () => {
    setErrors({});
    let errors = {};
    const uniqueIdRegex = /^[a-zA-Z0-9]{0,15}$/;
    if (!uniqueIdRegex.test(classe?.uniqueId)) {
      errors.uniqueId = "Le champ doit contenir entre 0 et 15 caractères alphanumériques.";
    }
    if (!referentClasse.lastName) errors.lastName = "Ce champ est obligatoire";
    if (!referentClasse.firstName) errors.firstName = "Ce champ est obligatoire";
    if (!referentClasse.email || !validator.isEmail(referentClasse.email)) errors.email = "L'email est incorrect";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setClasse({ ...classe, referent: referentClasse });
    setModalConfirmation(true);
  };

  const sendValue = async () => {
    try {
      const { ok, code, data } = await api.post("/cle/classe", classe);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la création de la classe", translate(code));
      }
      toastr.success("La classe a bien été créée");
      history.push("/classes/" + data._id);
    } catch (e) {
      capture(e);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED)
        return toastr.error("Cette adresse email est déjà utilisée. Si vous souhaitez désigner un referent de classe existant pour cette classe, utilisez le menu Select", {
          timeOut: 10000,
        });
      if (e.code === ERRORS.ALREADY_EXISTS)
        return toastr.error("Cette classe existe déjá. Utilisez le Numéro d'Identification de la classe pour les différencier ", {
          timeOut: 10000,
        });
      toastr.error("Oups, une erreur est survenue lors de la création de la classe");
    }
  };

  const actions = [
    <Link key="cancel" to="/classes" className="mr-2">
      <Button title="Annuler" type="secondary" />
    </Link>,
    <Button key="create" leftIcon={<HiOutlineOfficeBuilding size={16} />} title="Créer cette classe" onClick={() => validate()} />,
  ];

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title="Création d’une classe engagée"
        breadcrumb={[
          { title: <HiOutlineChartSquareBar size={20} className="hover:text-gray-500" />, to: "/" },
          { title: "Mes classes", to: "/classes" },
          { title: "Créer une classe" },
        ]}
        actions={actions}
      />
      <Container title="Informations générales">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
            <InputText value={classe.cohort} disabled />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label
              title="Numéro d’identification"
              name="Numéro d'identification"
              tooltip="Vous pouvez personnaliser l'identifiant de votre classe comme vous le souhaitez dans la limite de 15 caractères"
            />
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
              placeholder={"Choisissez un référent existant"}
              noOptionsMessage={"Aucun référent trouvé"}
              options={referentList}
              closeMenuOnSelect={true}
              isClearable={true}
              value={referentClasse?._id ? { label: `${referentClasse?.firstName} ${referentClasse?.lastName}`, value: referentClasse._id } : null}
              onChange={(options) => {
                options ? setReferentClasse(referentList.find((referent) => referent._id === options.value)) : setReferentClasse({});
              }}
            />
          </div>
        </div>
      </Container>
      <div className="flex items-center justify-end">{actions}</div>

      <ModalConfirmation
        isOpen={modalConfirmation}
        onClose={() => setModalConfirmation(false)}
        className="md:max-w-[700px]"
        icon={<ProfilePic icon={({ size, className }) => <HiOutlineOfficeBuilding size={size} className={className} />} />}
        title="Confirmez-vous ces informations ?"
        text={
          <div className="text-left w-[636px] text-ds-gray-900">
            <div className="my-6">
              <div className="text-lg mb-2">Informations générales</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Numéro d’identification</div>
                <div className="flex-1 font-medium text-right">{classe.uniqueKey + (classe?.uniqueId ?? "")}</div>
              </div>
            </div>
            <div className="my-6">
              <div className="text-lg mb-2">Référent de classe</div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Prénom et Nom</div>
                <div className="flex-1 font-medium text-right">{referentClasse.firstName + " " + referentClasse.lastName}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex-1">Adresse email</div>
                <div className="flex-1 font-medium text-right">{referentClasse.email}</div>
              </div>
            </div>
          </div>
        }
        actions={[
          { title: "Modifier", isCancel: true },
          { title: "Valider", onClick: () => sendValue() },
        ]}
      />
    </Page>
  );
}
