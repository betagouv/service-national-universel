import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import validator from "validator";

import Pencil from "../../../assets/icons/Pencil";
import { Box } from "../../../components/box";
import Loader from "../../../components/Loader";
import ModalChangeTutor from "../../../components/modals/ModalChangeTutor";
import ModalReferentDeleted from "../../../components/modals/ModalReferentDeleted";
import ModalUniqueResponsable from "../composants/ModalUniqueResponsable";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
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
  VISITOR_SUBROLES,
} from "../../../utils";
import UserHeader from "../composants/UserHeader";
import { Session, CohortSelect, AddButton, SubRoleAndRegionOrDep } from "../composants";
import Field from "../../phase0/components/Field";
import { RoundButton, PlainButton, BorderButton } from "../../phase0/components/Buttons";
import ConfirmationModal from "../../phase0/components/ConfirmationModal";
import CustomSelect from "../composants/CustomSelect";
import { roleOptions, MODE_DEFAULT, MODE_EDITION, formatSessionOptions, getSubRoleOptions } from "../utils";
import ViewStructureLink from "../../../components/buttons/ViewStructureLink";

export default function Details({ user, setUser, currentUser }) {
  const [structures, setStructures] = useState([]);
  const [sessionOptions, setSessionOptions] = useState([]);
  const [sessionsWhereUserIsHeadCenter, setSessionsWhereUserIsHeadCenter] = useState([]);
  const [mode, setMode] = useState(MODE_DEFAULT);
  const [isSaving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [areCentersLoading, setCentersLoading] = useState(true);
  const [data, setData] = useState({ ...user });
  const [newCenter, setNewCenter] = useState(undefined);
  const [isHeadOfCenterDeleteConfirmModalOpen, setHeadOfCenterDeleteConfirmModalOpen] = useState(false);
  const [deletedHeadOfCenterSessionId, setDeletedHeadOfCenterSessionId] = useState(undefined);
  const [isCohortChangeConfirmModalOpen, setCohortChangeConfirmModalOpen] = useState(false);
  const [cohortChangeSessionIds, setCohortChangeSessionIds] = useState(undefined);
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

  useEffect(() => {
    if (user?.role === ROLES.HEAD_CENTER) {
      loadHeadCenterSessions();
    } else {
      setCentersLoading(false);
    }
  }, [user]);

  const loadHeadCenterSessions = async () => {
    try {
      setCentersLoading(true);
      const { ok, data } = await api.get(`/session-phase1`);
      if (!ok) {
        return toastr.error("Une erreur s'est produite lors du chargement des sessions", "");
      }
      const responseReferentSessions = await api.get(`/referent/${user?._id}/session-phase1`);
      if (!responseReferentSessions.ok) {
        return toastr.error("Une erreur s'est produite lors du chargement des sessions", "");
      }
      const formattedSessionOptions = formatSessionOptions(data, responseReferentSessions.data);
      setSessionOptions(formattedSessionOptions);
      let sessionsWithCenterWhereUserIsHeadCenter = [];
      for (let session of responseReferentSessions.data) {
        const responseCenter = await api.get(`/cohesion-center/${session.cohesionCenterId}`);
        const availableCohorts = formattedSessionOptions.find((option) => option.cohesionCenterId === session.cohesionCenterId);
        sessionsWithCenterWhereUserIsHeadCenter.push({
          ...session,
          center: responseCenter.data,
          cohorts: [{ cohort: session.cohort, sessionPhase1Id: session._id }, ...(availableCohorts ? availableCohorts.cohorts : [])],
        });
      }
      setSessionsWhereUserIsHeadCenter(sessionsWithCenterWhereUserIsHeadCenter);
    } catch (e) {
      return toastr.error("Une erreur s'est produite lors du chargement des sessions", "");
    } finally {
      setCentersLoading(false);
    }
  };

  const loadStructures = async () => {
    const structureResponse = await api.get("/structure");
    if (structureResponse.ok) {
      setStructures(structureResponse.data);
    }
  };

  const addNewCenter = () => {
    setNewCenter({});
  };

  const setCenterHeadOfCenter = async () => {
    try {
      const { ok, code } = await api.put(`/session-phase1/${newCenter.cohort.sessionPhase1Id}/headCenter`, { id: user._id });
      if (!ok) {
        return toastr.error("Une erreur s'est produite lors de l'ajout du chef de centre ", translate(code));
      }
      setNewCenter(undefined);
      await loadHeadCenterSessions();
      return toastr.success("Le chef de centre a bien été ajouté", "");
    } catch (e) {
      return toastr.error("Une erreur s'est produite lors de l'ajout du chef de centre ", "");
    }
  };

  const deleteCenterHeadOfCenter = async () => {
    try {
      const { ok, code } = await api.remove(`/session-phase1/${deletedHeadOfCenterSessionId}/headCenter`);
      if (!ok) {
        return toastr.error("Une erreur s'est produite lors de la suppression du chef de centre ", translate(code));
      }
      setHeadOfCenterDeleteConfirmModalOpen(false);
      setDeletedHeadOfCenterSessionId(undefined);
      await loadHeadCenterSessions();
      return toastr.success("Le chef de centre a bien été supprimé du centre", "");
    } catch (e) {
      return toastr.error("Une erreur s'est produite lors de la suppression du chef de centre ", "");
    }
  };

  const changeCohort = async () => {
    try {
      const newCohortReponse = await api.put(`/session-phase1/${cohortChangeSessionIds?.newSessionId}/headCenter`, { id: user._id });
      if (!newCohortReponse.ok) {
        return toastr.error("Une erreur s'est produite lors du changement de cohort", translate(newCohortReponse.code));
      }
      const oldCohortReponse = await api.remove(`/session-phase1/${cohortChangeSessionIds.oldSessionId}/headCenter`);
      if (!oldCohortReponse.ok) {
        return toastr.error("Une erreur s'est produite lors du changement de cohort", translate(newCohortReponse.code));
      }
      setCohortChangeConfirmModalOpen(false);
      setCohortChangeSessionIds(undefined);
      await loadHeadCenterSessions();
      return toastr.success("Le cohort a bien été changé", "");
    } catch (e) {
      return toastr.error("Une erreur s'est produite lors du changement de cohort", "");
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

  const stopEdit = () => {
    setMode(MODE_DEFAULT);
    setData({ ...user });
    setNewCenter(undefined);
    setErrors({});
  };

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

    if (data.phone && !data.phone.match(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/gim)) {
      errors.phone = "Le téléphone doit être un numéro de téléphone valide";
      isValid = false;
    }

    if (data.mobile && !validator.isMobilePhone(data.mobile, ["fr-FR", "fr-GF", "fr-GP", "fr-MQ", "fr-RE"])) {
      errors.mobile = "Le téléphone doit être un numéro de téléphone mobile valide. (exemple : (+33)(0)642424242)";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const onSave = async () => {
    try {
      setSaving(true);
      if (validate()) {
        plausibleEvent("Utilisateur/Profil CTA - Enregistrer profil utilisateur");
        if (user.role === ROLES.HEAD_CENTER && data.role !== ROLES.HEAD_CENTER) {
          for (let index = 0; index < sessionsWhereUserIsHeadCenter.length; index++) {
            const { ok, code } = await api.remove(`/session-phase1/${sessionsWhereUserIsHeadCenter[index]._id}/headCenter`);
            if (!ok) {
              return toastr.error("Une erreur s'est produite lors de la suppression du chef de centre ", translate(code));
            }
          }
        }
        const updatedData = { ...data };
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

  const openHeadOfCenterDeleteConfirmModal = (session) => () => {
    setDeletedHeadOfCenterSessionId(session._id);
    setHeadOfCenterDeleteConfirmModalOpen(true);
  };

  const closeHeadOfCenterDeleteConfirmModal = () => {
    setDeletedHeadOfCenterSessionId(undefined);
    setHeadOfCenterDeleteConfirmModalOpen(false);
  };

  const openCohortChangeConfirmModal = (oldSessionId) => (newSessionId) => {
    setCohortChangeSessionIds({ oldSessionId, newSessionId });
    setCohortChangeConfirmModalOpen(true);
  };

  const closeCohortChangeConfirmModal = () => {
    setCohortChangeSessionIds(undefined);
    setCohortChangeConfirmModalOpen(false);
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
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  const structure = data.structureId ? structures.find((struct) => struct._id === data.structureId) : undefined;

  const roleMode = canUpdateReferent({
    actor: currentUser,
    originalTarget: user,
    structure,
  })
    ? mode
    : MODE_DEFAULT;

  return (
    <>
      <ConfirmationModal
        title="Êtes-vous sûr(e) de vouloir supprimer le chef de centre ?"
        isOpen={isHeadOfCenterDeleteConfirmModalOpen}
        onCancel={closeHeadOfCenterDeleteConfirmModal}
        onConfirm={deleteCenterHeadOfCenter}
      />
      <ConfirmationModal
        title="Êtes-vous sûr(e) de vouloir changer le cohort ?"
        isOpen={isCohortChangeConfirmModalOpen}
        onCancel={closeCohortChangeConfirmModal}
        onConfirm={changeCohort}
      />
      <UserHeader user={user} tab="profile" currentUser={currentUser} />
      <div className="p-8">
        <Box className="p-6">
          <div className="flex justify-between mb-6">
            <div className="font-medium text-lg">Informations générales</div>
            {!isSaving && (
              <>
                {mode === MODE_EDITION ? (
                  <div className="flex items-center">
                    <RoundButton onClick={stopEdit} mode="grey">
                      Annuler
                    </RoundButton>
                    <RoundButton className="ml-[8px]" onClick={onSave} disabled={!!newCenter}>
                      <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                      Enregistrer les changements
                    </RoundButton>
                  </div>
                ) : (
                  <RoundButton className="" onClick={startEdit}>
                    <Pencil stroke="#2563EB" className="w-[12px] h-[12px] mr-[6px]" />
                    Modifier
                  </RoundButton>
                )}
              </>
            )}
            {isSaving && <div className="text-[14px] text-[#6B7280]">Enregistrement en cours...</div>}
          </div>

          <div className="flex">
            <div className="pr-16 flex-1 flex flex-col">
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
                  regionOrDepOptions={regionList.map((r) => ({ value: r, label: r }))}
                />
              )}
              {!(user.role === ROLES.HEAD_CENTER) && data.role === ROLES.HEAD_CENTER && (
                <div className="mt-4 text-gray-500">Enregistrer les changement pour accéder au choix des centres.</div>
              )}
              {user.role === ROLES.HEAD_CENTER && data.role === ROLES.HEAD_CENTER && (
                <div className="flex flex-col">
                  {sessionsWhereUserIsHeadCenter?.length > 0 && <div className={`mt-4 ${sessionsWhereUserIsHeadCenter?.length > 0 ? "-mb-3" : ""}`}>Centres</div>}
                  {areCentersLoading && <Loader />}
                  {!areCentersLoading && (
                    <>
                      {sessionsWhereUserIsHeadCenter?.length > 0 &&
                        sessionsWhereUserIsHeadCenter.map((session) => (
                          <Session
                            mode={currentUser.role === ROLES.ADMIN ? mode : MODE_DEFAULT}
                            session={session}
                            key={session._id}
                            onClickView={session?.center?._id ? () => window.open(`/centre/${session.center._id}?cohorte=${session.cohort}`) : undefined}
                            onDelete={openHeadOfCenterDeleteConfirmModal(session)}
                            onCohortChange={openCohortChangeConfirmModal(session._id)}
                          />
                        ))}
                      {newCenter && (
                        <div className="pb-4 border-b border-gray-200 flex flex-col">
                          <CustomSelect
                            className="mt-4"
                            key={newCenter?.cohesionCenterId || "newCenter"}
                            isClearable
                            label="Centre"
                            options={sessionOptions.map(({ cohesionCenterId, nameCentre }) => ({ value: cohesionCenterId, label: nameCentre }))}
                            placeholder="Choisir un centre"
                            onChange={(option) => {
                              if (!option?.value) {
                                setNewCenter({});
                              } else {
                                const centerToSet = sessionOptions.find((currentSession) => currentSession.cohesionCenterId === option.value);
                                if (centerToSet.cohorts.length === 1) {
                                  centerToSet.cohort = centerToSet.cohorts[0];
                                }
                                setNewCenter(centerToSet);
                              }
                            }}
                            value={newCenter?.cohesionCenterId || ""}
                          />
                          {newCenter.cohesionCenterId && (
                            <CohortSelect
                              className="mt-4 self-start"
                              value={newCenter.cohort?.cohort || ""}
                              options={newCenter.cohorts.map((c) => c.cohort)}
                              onChange={(cohort) => {
                                setNewCenter({ ...newCenter, cohort: newCenter.cohorts.find((c) => c.cohort === cohort) });
                              }}
                            />
                          )}
                        </div>
                      )}
                      {roleMode === MODE_EDITION && currentUser.role === ROLES.ADMIN && !newCenter && (
                        <AddButton onClick={addNewCenter} className={`self-end mt-4 ${sessionsWhereUserIsHeadCenter?.length > 0 ? "" : "mt-4"}`}>
                          Ajouter un centre
                        </AddButton>
                      )}
                      {roleMode === MODE_EDITION && newCenter && (
                        <div className="flex mt-4 justify-end">
                          <PlainButton mode="white" className="mr-2" onClick={() => setNewCenter(undefined)}>
                            Annuler
                          </PlainButton>
                          <PlainButton onClick={setCenterHeadOfCenter} disabled={!newCenter.cohort}>
                            Enregistrer le centre
                          </PlainButton>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
            <div className="pl-16 flex-1">
              <div className="mb-2">Contact</div>
              <Field mode={mode} className="mb-4" label="E-mail" name="email" value={data.email} onChange={onChange("email")} error={errors.email} />
              <Field mode={mode} className="mb-4" label="Téléphone fixe" name="phone" value={data.phone} onChange={onChange("phone")} error={errors.phone} />
              <Field mode={mode} label="Téléphone mobile" name="mobile" value={data.mobile} onChange={onChange("mobile")} error={errors.mobile} />
            </div>
          </div>
        </Box>
        {canDeleteReferent({ actor: currentUser, originalTarget: user, structure }) && (
          <div className="flex justify-center items-center">
            <BorderButton mode="red" className="mt-3" onClick={onClickDelete}>
              Supprimer le compte
            </BorderButton>
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
