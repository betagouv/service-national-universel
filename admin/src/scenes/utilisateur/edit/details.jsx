import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import validator from "validator";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import Pencil from "../../../assets/icons/Pencil";
import { Box } from "../../../components/box";
import Loader from "../../../components/Loader";
import ModalChangeTutor from "../../../components/modals/ModalChangeTutor";
import ModalReferentDeleted from "../../../components/modals/ModalReferentDeleted";
import ModalUniqueResponsable from "../composants/ModalUniqueResponsable";
import api from "../../../services/api";
import {
  canUpdateReferent,
  canDeleteReferent,
  department2region,
  departmentList,
  REFERENT_DEPARTMENT_SUBROLE,
  REFERENT_REGION_SUBROLE,
  regionList,
  ROLES,
  translate,
  isSuperAdmin,
  VISITOR_SUBROLES,
  isDeleteAuthorized,
  PERMISSION_RESOURCES,
  ReferentStatus,
} from "snu-lib";

import dayjs from "@/utils/dayjs.utils";
import UserHeader from "../composants/UserHeader";
import { SubRoleAndRegionOrDep } from "../composants";
import Field from "../../phase0/components/Field";
import { RoundButton, PlainButton, BorderButton } from "../../phase0/components/Buttons";
import ConfirmationModal from "../../phase0/components/ConfirmationModal";
import CustomSelect from "../composants/CustomSelect";
import { roleOptions, MODE_DEFAULT, MODE_EDITION, getSubRoleOptions, MODE_READONLY } from "../utils";
import ViewStructureLink from "../../../components/buttons/ViewStructureLink";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { Container, Button, Badge, Label, InputText, Tooltip } from "@snu/ds/admin";
import RenewInvitation from "./partials/RenewInvitation";

export default function Details({ user, setUser, currentUser }) {
  const [structures, setStructures] = useState([]);
  const [mode, setMode] = useState(MODE_DEFAULT);
  const [isSaving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({ ...user });
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalUniqueResponsable, setModalUniqueResponsable] = useState({ isOpen: false });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });
  const history = useHistory();

  useEffect(() => {
    loadStructures();
  }, []);

  useEffect(() => {
    setData({ ...user });
  }, [user]);

  const loadStructures = async () => {
    const structureResponse = await api.get("/structure");
    if (structureResponse.ok) {
      setStructures(structureResponse.data);
    }
  };

  const onChange = (key) => (value) => {
    setData({ ...data, [key]: value });
  };

  const onRoleChange = (value) => {
    setData({ ...data, region: "", department: "", subRole: "", role: value });
  };

  const onDepartmentChange = (value) => {
    setData({ ...data, department: value, region: department2region[value[0]] });
  };

  const startEdit = () => {
    setMode(MODE_EDITION);
  };

  useEffect(() => {
    if (user.status === ReferentStatus.INACTIVE) {
      stopEdit();
    }
  }, [user.status]);

  const stopEdit = () => {
    setMode(MODE_DEFAULT);
    setData({ ...user });
    setErrors({});
  };

  const trimmedPhone = data.phone?.replace(/\s/g, "");
  const trimmedMobile = data.mobile?.replace(/\s/g, "");

  const validate = () => {
    let isValid = true;
    const errors = {};
    if (!data.email || !validator.isEmail(data.email)) {
      errors.email = "L'email ne semble pas valide";
      isValid = false;
    }
    if (!data.firstName) {
      errors.firstName = "Veuillez renseigner le prénom";
      isValid = false;
    }
    if (!data.lastName) {
      errors.lastName = "Veuillez renseigner le nom";
      isValid = false;
    }

    if (trimmedPhone && !isPossiblePhoneNumber(trimmedPhone, "FR")) {
      errors.phone = "Le téléphone doit être un numéro de téléphone valide";
      isValid = false;
    }

    if (trimmedMobile && !isPossiblePhoneNumber(trimmedMobile, "FR")) {
      errors.mobile = "Le téléphone doit être un numéro de téléphone mobile valide. Exemple : +33 6 42 42 42 42.";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const onSave = async () => {
    try {
      setSaving(true);
      if (validate()) {
        const updatedData = { ...data };
        if (trimmedPhone) updatedData.phone = trimmedPhone;
        if (trimmedMobile) updatedData.mobile = trimmedMobile;

        if ((user.role === ROLES.RESPONSIBLE || user.role === ROLES.SUPERVISOR) && !(data.role === ROLES.RESPONSIBLE || data.role === ROLES.SUPERVISOR)) {
          updatedData.structureId = null;
        }
        if (data.structureId && user.structureId !== data.structureId) {
          const { ok, code } = await api.put(`/referent/${user._id}/structure/${updatedData.structureId}`);
          if (!ok)
            return code === "OPERATION_NOT_ALLOWED"
              ? toastr.error(translate(code), "Ce responsable est affilié comme tuteur de missions de la structure.", { timeOut: 5000 })
              : toastr.error(translate(code), "Une erreur s'est produite lors de la modification de la structure.");
          updatedData.structureId = undefined;
        }
        const { ok, code, data: updatedUser } = await api.put(`/referent/${user._id}`, updatedData);
        if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
        setUser(updatedUser);
        setMode(MODE_DEFAULT);
        toastr.success("Utilisateur mis à jour !", "");
      }
    } catch (e) {
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
    } finally {
      setSaving(false);
    }
  };

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${user.firstName} ${user.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onUniqueResponsible = (target) => {
    setModalUniqueResponsable({
      isOpen: true,
      responsable: target,
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${user._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action", "");
      if (!ok && code === "LINKED_STRUCTURE") return onUniqueResponsible(user);
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(user);
      if (!ok && code === "LINKED_CLASSES") return onUniqueResponsible(user);
      if (!ok && code === "LINKED_ETABLISSEMENT") return onUniqueResponsible(user);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  const getSubtitle = (user) => {
    const createdAt = new Date(user.createdAt);
    const diff = dayjs(createdAt).fromNow();
    return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
  };

  const structure = data.structureId ? structures.find((struct) => struct._id === data.structureId) : undefined;

  let roleMode = canUpdateReferent({
    actor: currentUser,
    originalTarget: user,
    structure,
  })
    ? MODE_EDITION
    : MODE_DEFAULT;

  if (user.status === ReferentStatus.INACTIVE) {
    roleMode = MODE_READONLY;
  }

  const canDelete = canDeleteReferent({ actor: currentUser });
  const isDeleteEnabled = isSuperAdmin(currentUser);

  const tooltipTitle = !canDelete
    ? "Il est impossible de supprimer un compte utilisateur."
    : user.status === ReferentStatus.INACTIVE && !isSuperAdmin(currentUser)
      ? "Vous ne pouvez pas supprimer un utilisateur désactivé"
      : "";

  return (
    <>
      <UserHeader user={user} tab="profile" currentUser={currentUser} onUserUpdate={setUser} />
      <div className="p-8">
        <Box className="p-6">
          <div className="mb-6 flex justify-between">
            <div className="text-lg font-medium">Informations générales</div>
            {!isSaving && roleMode !== MODE_DEFAULT && (
              <>
                {mode === MODE_EDITION ? (
                  <div className="flex items-center">
                    <RoundButton onClick={stopEdit} mode="grey">
                      Annuler
                    </RoundButton>
                    <RoundButton className="ml-[8px]" onClick={onSave}>
                      <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                      Enregistrer les changements
                    </RoundButton>
                  </div>
                ) : (
                  <>
                    <Tooltip title="Vous ne pouvez pas modifier le profil d'un utilisateur désactivé" disabled={user.status !== ReferentStatus.INACTIVE}>
                      <RoundButton className="" onClick={startEdit} disabled={user.status === ReferentStatus.INACTIVE}>
                        <Pencil stroke="#2563EB" className="mr-[6px] h-[12px] w-[12px]" />
                        Modifier
                      </RoundButton>
                    </Tooltip>
                  </>
                )}
              </>
            )}
            {isSaving && <div className="text-[14px] text-[#6B7280]">Enregistrement en cours...</div>}
          </div>

          <div className="flex">
            <div className="flex flex-1 flex-col pr-16">
              <div className="mb-2">Identité</div>
              <Field mode={mode} className="mb-4" name="lastName" label="Nom" value={data.lastName} onChange={onChange("lastName")} error={errors.lastName} />
              <Field mode={mode} name="firstName" label="Prénom" value={data.firstName} onChange={onChange("firstName")} error={errors.firstName} />
              <div className="mt-4 mb-2">Rôle</div>
              <Field
                mode={currentUser.role === ROLES.ADMIN ? mode : MODE_DEFAULT}
                label="Rôle"
                name="role"
                value={data.role}
                onChange={onRoleChange}
                type="select"
                options={roleOptions}
                transformer={(value) => translate(value)}
              />
              {data.role === ROLES.REFERENT_DEPARTMENT && (
                <SubRoleAndRegionOrDep
                  isRegion={false}
                  mode={roleMode}
                  subRole={data.subRole}
                  onSubRoleChange={onChange("subRole")}
                  regionOrDep={data.department || []}
                  onRegionOrDepChange={onDepartmentChange}
                  subRoleOptions={getSubRoleOptions(REFERENT_DEPARTMENT_SUBROLE)}
                  disabled={user.status === ReferentStatus.INACTIVE}
                  regionOrDepOptions={departmentList.map((e) => ({ value: e, label: e }))}
                />
              )}
              {(data.role === ROLES.REFERENT_REGION || data.role === ROLES.VISITOR) && (
                <SubRoleAndRegionOrDep
                  isRegion
                  mode={roleMode}
                  subRole={data.subRole}
                  onSubRoleChange={onChange("subRole")}
                  regionOrDep={data.region}
                  onRegionOrDepChange={onChange("region")}
                  subRoleOptions={getSubRoleOptions(data.role === ROLES.REFERENT_REGION ? REFERENT_REGION_SUBROLE : VISITOR_SUBROLES)}
                  disabled={user.status === ReferentStatus.INACTIVE}
                  regionOrDepOptions={regionList.map((r) => ({ value: r, label: r }))}
                />
              )}
              {(data.role === ROLES.RESPONSIBLE || data.role === ROLES.SUPERVISOR) && (
                <>
                  {structures.length === 0 && (
                    <div className="mt-4">
                      <Loader />
                    </div>
                  )}
                  {structures.length > 0 && (
                    <>
                      <CustomSelect
                        className="mt-4"
                        label="Structure"
                        readOnly={mode !== MODE_EDITION || !(currentUser.role === ROLES.ADMIN)}
                        options={structures.map((struct) => ({ label: struct.name, value: struct._id }))}
                        placeholder={"Rechercher une structure..."}
                        onChange={(newStructure) => {
                          onChange("structureId")(newStructure.value);
                        }}
                        value={data?.structureId}
                      />
                      {data?.structureId && roleMode === MODE_DEFAULT && <ViewStructureLink structureId={data?.structureId} />}
                    </>
                  )}
                </>
              )}
            </div>
            <div className="w-[1px] bg-[#E5E7EB]" />
            <div className="flex-1 pl-16">
              <div className="mb-2">Contact</div>
              <Field mode={currentUser.role === ROLES.ADMIN ? mode : MODE_DEFAULT} className="mb-4" label="E-mail" name="email" value={data.email} onChange={onChange("email")} error={errors.email} copy={true} />
              <Field mode={mode} className="mb-4" label="Téléphone fixe" name="phone" value={data.phone} onChange={onChange("phone")} error={errors.phone} />
              <Field mode={mode} label="Téléphone mobile" name="mobile" value={data.mobile} onChange={onChange("mobile")} error={errors.mobile} />
            </div>
          </div>
        </Box>

        {data?.etablissement && (
          <Container title="Détails" actions={[]}>
            <div className="flex items-stretch justify-stretch">
              <div className="flex-1">
                <Label title="Établissement" name="etablissement" />
                <InputText className="mb-3" value={data?.etablissement.name} label={"Nom"} readOnly={true} />
                <InputText className="mb-3" value={data?.etablissement.uai} label={"UAI"} readOnly={true} />
                <Button
                  type="tertiary"
                  title="Voir l'établissement"
                  className="w-full max-w-full"
                  onClick={() => {
                    history.push(`/etablissement/${data?.etablissement._id}`);
                  }}></Button>
              </div>
              <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
              <div className="flex-1">
                {data?.classe && (
                  <>
                    <Label title="Classe" name="classe" />
                    {data.classe.map((classe) => (
                      <div key={classe._id} className="flex justify-between border-b border-gray-200 pb-2.5 mb-2.5">
                        <div className="flex-col">
                          <p className="text-gray-900 text-base font-bold leading-5">{classe.name}</p>
                          <p className="text-gray-500 text-xs font-medium leading-5">id: {classe.uniqueKeyAndId}</p>
                        </div>
                        <Badge
                          mode="editable"
                          status="primary"
                          title={<MdOutlineRemoveRedEye size={18} />}
                          className="rounded-[50%] !p-0 !w-8"
                          onClick={() => {
                            history.push(`/classes/${classe._id}`);
                          }}></Badge>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Container>
        )}

        {isDeleteAuthorized({ user: currentUser, resource: PERMISSION_RESOURCES.REFERENT, ignorePolicy: true }) && (
          <div className="flex items-center justify-center">
            {isSuperAdmin(currentUser) && <RenewInvitation userId={user._id} user={user} />}
            <Tooltip title={tooltipTitle} disabled={isDeleteEnabled}>
              <BorderButton mode="red" className="mt-3" onClick={onClickDelete} disabled={!isDeleteEnabled} href={null}>
                Supprimer le compte
              </BorderButton>
            </Tooltip>
            <ConfirmationModal
              isOpen={modal?.isOpen}
              title={modal?.title}
              message={modal?.message}
              onCancel={() => setModal({ isOpen: false, onConfirm: null })}
              onConfirm={() => {
                modal?.onConfirm();
                setModal({ isOpen: false, onConfirm: null });
              }}
            />
            <ModalChangeTutor
              isOpen={modalTutor?.isOpen}
              title={modalTutor?.title}
              message={modalTutor?.message}
              tutor={modalTutor?.value}
              onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
              onConfirm={() => {
                modalTutor?.onConfirm();
                setModalTutor({ isOpen: false, onConfirm: null });
              }}
            />
            <ModalUniqueResponsable
              isOpen={modalUniqueResponsable?.isOpen}
              responsable={modalUniqueResponsable?.responsable}
              onConfirm={() => setModalUniqueResponsable({ isOpen: false })}
            />
            <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.push("/user")} />
          </div>
        )}
      </div>
    </>
  );
}
