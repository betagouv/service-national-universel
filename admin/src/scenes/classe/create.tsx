import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HiHome, HiOutlineOfficeBuilding, HiPlus } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import validator from "validator";

import { translate, canCreateClasse, ERRORS, FeatureFlagName, translateGrade, COHORT_TYPE, canUpdateCohort } from "snu-lib";
import { ClasseDto, ReferentDto } from "snu-lib/src/dto";
import { ProfilePic } from "@snu/ds";
import { Page, Header, Container, Button, Label, InputText, ModalConfirmation, Select, InputNumber } from "@snu/ds/admin";

import { capture } from "@/sentry";
import api from "@/services/api";
import { AuthState } from "@/redux/auth/reducer";
import Loader from "@/components/Loader";

import { colorOptions, filiereOptions, gradeOptions, typeOptions } from "./utils";
import { CohortState } from "@/redux/cohorts/reducer";

interface FormError {
  name?: string;
  cohort?: string;
  lastName?: string;
  firstName?: string;
  email?: string;
  coloration?: string;
  type?: string;
  grades?: string;
  filiere?: string;
  estimatedSeats?: string;
}

export default function Create() {
  const history = useHistory();

  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts).filter((cohort) => cohort.type === COHORT_TYPE.CLE && canUpdateCohort(cohort, user));

  const [classe, setClasse] = useState<Partial<ClasseDto & { referent?: Partial<ReferentDto> }>>({
    name: "",
    cohort: "",
    estimatedSeats: 0,
    coloration: "",
    type: "",
  });
  const [errors, setErrors] = useState<FormError>({});
  const [referentClasse, setReferentClasse] = useState<Partial<ReferentDto>>({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [referentList, setReferentList] = useState<ReferentDto[]>([]);
  const [modalConfirmation, setModalConfirmation] = useState(false);

  useEffect(() => {
    if (!canCreateClasse(user)) history.push("/classes");
  }, [user, history]);

  useEffect(() => {
    getEtablissement();
  }, []);

  const getEtablissement = async () => {
    try {
      const etablissementId = new URLSearchParams(history.location.search).get("etablissementId");
      const { ok, code, data: response } = await api.get(etablissementId ? `/cle/etablissement/${etablissementId}` : "/cle/etablissement/from-user");

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", translate(code));
      }
      setClasse({ ...classe, uniqueKey: response.uniqueKey + "-XXXXXX", etablissementId: response._id, etablissement: response });
      loadReferents({
        etablissementId: response._id,
        coordinateurs: response.coordinateurs.map((referent) => ({ ...referent, value: referent._id, label: `${referent.firstName} ${referent.lastName}` })),
      });
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de l'établissement", "");
    }
  };

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

  const handleSubmit = () => {
    setErrors({});
    const errors: FormError = {};
    if (!referentClasse.lastName) errors.lastName = "Ce champ est obligatoire";
    if (!referentClasse.firstName) errors.firstName = "Ce champ est obligatoire";
    if (!referentClasse.email || !validator.isEmail(referentClasse.email)) errors.email = "L'email est incorrect";
    if (!classe.name) errors.name = "Ce champ est obligatoire";
    if (!classe.coloration) errors.coloration = "Ce champ est obligatoire";
    if (!classe.estimatedSeats) errors.estimatedSeats = "Ce champ est obligatoire";
    if (classe.estimatedSeats && classe.estimatedSeats < 0) errors.estimatedSeats = "Le nombre d'élèves ne peut pas être négatif";
    if (!classe.type) errors.type = "Ce champ est obligatoire";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setClasse({ ...classe, referent: referentClasse });
    setModalConfirmation(true);
  };

  const confirmSubmit = async () => {
    try {
      const { ok, code, data } = await api.post("/cle/classe", classe);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la création de la classe", translate(code));
      }
      toastr.success("La classe a bien été créée", "");
      history.push("/classes/" + data._id);
    } catch (e) {
      capture(e);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED)
        return toastr.error("Cette adresse email est déjà utilisée. Si vous souhaitez désigner un referent de classe existant pour cette classe, utilisez le menu Select", "", {
          timeOut: 10000,
        });
      if (e.code === ERRORS.ALREADY_EXISTS)
        return toastr.error("Une classe avec les même caractéristiques existe déjá. Utilisez le nom pour les différencier", "", {
          timeOut: 10000,
        });
      toastr.error("Oups, une erreur est survenue lors de la création de la classe", "");
    }
  };

  const actions = [
    <Link key="cancel" to="/classes" className="mr-2">
      <Button title="Annuler" type="secondary" />
    </Link>,
    <Button key="create" leftIcon={<HiOutlineOfficeBuilding size={16} />} title="Créer cette classe" onClick={() => handleSubmit()} />,
  ];

  if (!classe) return <Loader />;

  return (
    <Page>
      <Header
        title="Création d’une classe engagée"
        breadcrumb={[
          { title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" },
          { title: "Mes classes", to: "/classes" },
          { title: "Créer une classe" },
        ]}
        actions={actions}
      />
      <Container title="Informations générales">
        <div className="flex gap-14">
          <div className="w-full flex flex-col gap-4">
            <div>
              <Label title="Nom de la classe" name="name" />
              <div className="flex items-center justify-between gap-3">
                <InputText name="name" className="flex-1" value={classe.name!} error={errors.name} onChange={(e) => setClasse({ ...classe, name: e.target.value })} />
              </div>
            </div>
            <div>
              <Label title="Numéro d’identification" name="Numéro d'identification" tooltip="Ce numéro et générer automatiquement lors de la création de la classe" />
              <div className="flex items-center justify-between gap-3">
                <InputText name="uniqueKey" className="flex-1" value={classe.uniqueKey!} disabled />
              </div>
            </div>
            {user.featureFlags?.[FeatureFlagName.CLE_CLASSE_ADD_COHORT_ENABLED] && (
              <div className="flex-1">
                <Label title="Cohorte" name="Cohorte" tooltip="La cohorte sera mise à jour lors de la validation des dates d'affectation." />
                <Select
                  className="mb-3"
                  placeholder="Choisissez une cohorte"
                  options={cohorts?.map((c) => ({ value: c.name, label: c.name }))}
                  closeMenuOnSelect={true}
                  value={classe?.cohort ? { value: classe?.cohort, label: classe?.cohort } : null}
                  onChange={(options) => {
                    setClasse({ ...classe, cohort: options.value });
                  }}
                  error={errors.cohort}
                />
              </div>
            )}
            <div>
              <Label title="Effectif prévisionnel" name="estimatedSeats" tooltip="Nombre d'élèves prévisionnel de la classe" />
              <InputNumber
                name="estimatedSeats"
                className="flex-1"
                min={0}
                value={classe.estimatedSeats!}
                onChange={(e) => setClasse({ ...classe, estimatedSeats: Number(e.target.value) })}
                error={errors.estimatedSeats}
              />
            </div>
            <div>
              <Label title="Coloration" name="coloration" />
              <Select
                placeholder={"Choisissez une coloration"}
                options={colorOptions}
                closeMenuOnSelect={true}
                value={classe?.coloration ? { value: classe?.coloration, label: translate(classe?.coloration) } : null}
                onChange={(options) => {
                  setClasse({ ...classe, coloration: options.value });
                }}
                error={errors.coloration}
              />
            </div>
          </div>
          <div className="w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="w-full flex flex-col gap-4">
            <div>
              <Label title="Type de groupe" name="type" />
              <Select
                placeholder="Choisissez un type de classe"
                options={typeOptions}
                closeMenuOnSelect={true}
                value={classe?.type ? { value: classe?.type, label: translate(classe?.type) } : null}
                onChange={(options) => {
                  setClasse({ ...classe, type: options.value });
                }}
                error={errors.type}
              />
            </div>
            <div>
              <Label
                title="Situation scolaire"
                name="class-situation"
                tooltip="C'est la situation de la classe. Une exception au niveau d'un élève qui viendrait d'une autre filière ou d'un autre niveau peut être gérée au niveau du profil de l'élève concerné."
              />
              <Select
                className="mb-3"
                placeholder="Choisissez un niveau"
                options={gradeOptions}
                isMulti={true}
                isClearable={true}
                label="Niveau"
                value={classe?.grades ? classe.grades.map((grade) => ({ value: grade, label: translateGrade(grade) })) : null}
                onChange={(options) => {
                  setClasse({ ...classe, grades: options ? options.map((opt) => opt.value) : [] });
                }}
                error={errors.grades}
              />
              <Select
                className="mb-3"
                placeholder="Choisissez une filière"
                options={filiereOptions}
                closeMenuOnSelect={true}
                value={classe?.filiere ? { value: classe?.filiere, label: translate(classe?.filiere) } : null}
                onChange={(options) => {
                  setClasse({ ...classe, filiere: options.value });
                }}
                error={errors.filiere}
              />
            </div>
          </div>
        </div>
      </Container>
      <Container title="Référent de classe">
        <div className="flex items-stretch justify-stretch">
          <div className="flex-1">
            <Label name="" title="Nouveau référent de classe ..." />
            <InputText
              className="mb-3"
              name="lastName"
              label="Nom"
              placeholder="Préciser"
              active={true}
              value={referentClasse.lastName!}
              onChange={(e) => setReferentClasse({ ...referentClasse, lastName: e.target.value })}
              error={errors.lastName}
            />
            <InputText
              className="mb-3"
              label="Prénom"
              name="firstName"
              placeholder="Préciser"
              active={true}
              value={referentClasse.firstName!}
              onChange={(e) => setReferentClasse({ ...referentClasse, firstName: e.target.value })}
              error={errors.firstName}
            />
            <InputText
              label="Adresse email"
              type="email"
              name="email"
              placeholder="Préciser"
              active={true}
              value={referentClasse.email!}
              onChange={(e) => setReferentClasse({ ...referentClasse, email: e.target.value })}
              error={errors.email}
            />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1">
            <Label name="" title="... ou référent de classe existant" />
            <Select
              className="mb-3"
              isActive={true}
              placeholder={"Choisissez un référent existant"}
              noOptionsMessage={"Aucun référent trouvé"}
              // @ts-ignore
              options={referentList}
              closeMenuOnSelect={true}
              isClearable={true}
              value={referentClasse?._id ? { label: `${referentClasse?.firstName} ${referentClasse?.lastName}`, value: referentClasse._id } : null}
              onChange={(options) => {
                // @ts-ignore
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
        icon={<ProfilePic icon={({ size, className }) => <HiPlus size={size} className={className} />} />}
        title="Création d'une classe engagée"
        text={
          <div className="text-left w-[636px]">
            <div className="text-base text-center my-8">Attention, la création de cette classe doit d’abord avoir été faite sur le SI SNU, il n’y a pas de contrôle !</div>
          </div>
        }
        actions={[
          { title: "Fermer", isCancel: true },
          { title: "Valider", onClick: () => confirmSubmit() },
        ]}
      />
    </Page>
  );
}
