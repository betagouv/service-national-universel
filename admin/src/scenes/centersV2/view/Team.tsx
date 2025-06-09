import React, { useState, ReactNode } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useParams } from "react-router-dom";
import { Formik, Field } from "formik";
import validator from "validator";
import { AuthState } from "@/redux/auth/reducer";
import { useQuery, useMutation } from "@tanstack/react-query";

import { CENTER_ROLES, ROLES, translate, SENDINBLUE_TEMPLATES, SessionPhase1Type } from "snu-lib";
import api from "@/services/api";
import Trash from "@/assets/icons/Trash";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Page, Container } from "@snu/ds/admin";
import { User } from "@/types";
import { queryClient } from "@/services/react-query";

type TeamMemberAction = "add" | "delete";
type UpdateTeamParams = {
  action: TeamMemberAction;
  member: TeamMate;
};
type MutationResponse = {
  data: SessionPhase1Type;
  action: TeamMemberAction;
};
interface TeamMate {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
type ChefCenterBlockProps = {
  headCenter: SessionPhase1Type["headCenter"];
};

type TeamBlockProps = {
  team: SessionPhase1Type["team"];
  deleteTeamate: (user) => void;
  adjoints: SessionPhase1Type["adjoints"];
};

type GroupAdjointsProps = {
  adjoints: SessionPhase1Type["adjoints"];
  role: string;
};

type GroupTeamProps = {
  team: SessionPhase1Type["team"];
  role: string;
  deleteTeamate: (user) => void;
};

type AddBlockProps = {
  onConfirm: (teamate: TeamMate) => Promise<void>;
  user: User;
};

export default function Team({ focusedSession: focusedSessionfromProps }) {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [modal, setModal] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
  }>({
    isOpen: false,
    onConfirm: () => {},
    title: "",
    message: "",
  });
  const user = useSelector((state: AuthState) => state.Auth.user);

  const { data: fetchedSession } = useQuery({
    queryKey: ["session-phase1", sessionId],
    queryFn: async () => {
      const { data } = await api.get(`/session-phase1/${sessionId}`);
      return data;
    },
    enabled: !!sessionId,
    initialData: focusedSessionfromProps,
  });

  const focusedSession = fetchedSession || focusedSessionfromProps;

  const addTeamate = async (teamate: TeamMate) => {
    if ([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(teamate.role)) {
      setDirectionCenter(teamate);
    } else {
      updateTeamMemberMutation.mutate({
        action: "add",
        member: teamate,
      });
    }
  };

  const updateTeamMemberMutation = useMutation<MutationResponse, Error, UpdateTeamParams>({
    mutationFn: async ({ action, member }) => {
      member.role = CENTER_ROLES[member.role] || member.role;
      let updatedTeam;

      if (action === "add") {
        updatedTeam = [...focusedSession.team, member];
      } else if (action === "delete") {
        const index = focusedSession.team.findIndex((e) => JSON.stringify(e) === JSON.stringify(member));
        if (index === -1) throw new Error("User not found in team");

        updatedTeam = [...focusedSession.team];
        updatedTeam.splice(index, 1);
      } else {
        throw new Error("Invalid action");
      }

      if (!updatedTeam.length && action === "add") throw new Error("No data to update");

      const { ok, data, code } = await api.put(`/session-phase1/${focusedSession._id}/team`, { team: updatedTeam });

      if (!ok) throw new Error(code);
      return { data, action };
    },
    onSuccess: ({ data, action }) => {
      queryClient.setQueryData(["session-phase1", sessionId], data);
      const message = action === "add" ? "Le membre a été ajouté à l'équipe" : "Le membre a été supprimé de l'équipe";
      toastr.success("Succès", message);
    },
    onError: (error) => {
      console.log(error);
      capture(error);
      toastr.error("Oups, une erreur est survenue lors de la modification", translate(error.message));
    },
  });

  const setDirectionCenterMutation = useMutation({
    mutationFn: async ({ referentId, role }: { referentId: string; role: string }) => {
      const { ok, data, code } = await api.put(`/session-phase1/${focusedSession._id}/directionTeam`, { referentId, role });
      if (!ok) throw new Error(code);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["session-phase1", sessionId], data);
      toastr.success("Succès", "Le membre a été ajouté à l'équipe");
    },
    onError: (error) => {
      console.log(error);
      capture(error);
      toastr.error("Erreur !", translate(error.message));
    },
  });

  const setDirectionCenter = async (teamate: TeamMate) => {
    try {
      const { data: referent } = await api.get(`/referent?email=${encodeURIComponent(teamate.email)}`);

      if (!referent) {
        setModal({
          title: `Inviter ${teamate.firstName} ${teamate.lastName}`,
          message: (
            <div>
              Aucun compte n&apos;a été trouvé pour l&apos;email&nbsp;:
              <br />
              <span className="text-snu-purple-300 underline">{teamate.email}</span>
              <br />
              Êtes-vous sûr de vouloir l&apos;inviter&nbsp;?
            </div>
          ),
          isOpen: true,
          onConfirm: () => inviteDirectionCenterMutation.mutate(teamate),
        });
        return {};
      }

      if (referent.role !== teamate.role) {
        toastr.error("Erreur", "Ce membre a déjà un rôle sur la plateforme. Un utilisateur ne peut pas avoir plusieurs rôles.");
        return {};
      }

      return setDirectionCenterMutation.mutate({ referentId: referent._id, role: teamate.role });
    } catch (e) {
      console.log(e);
      capture(e);
      toastr.error("Erreur !", translate(e));
    }
  };

  const inviteDirectionCenterMutation = useMutation({
    mutationFn: async (user: TeamMate) => {
      const responseInvitation = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[user.role]}`, {
        ...user,
        cohorts: [focusedSession?.cohort],
        cohesionCenterId: focusedSession?.cohesionCenterId,
        cohesionCenterName: focusedSession?.nameCentre,
      });

      if (!responseInvitation?.ok) throw new Error(responseInvitation?.code);

      const responseSession = await api.put(`/session-phase1/${focusedSession._id}/directionTeam`, {
        referentId: responseInvitation?.data?._id,
      });

      if (!responseSession?.ok) throw new Error(responseSession?.code);
      return responseSession?.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["session-phase1", sessionId], data);
      toastr.success("Succès", `${variables.firstName} ${variables.lastName} a reçu une invitation pour rejoindre l'équipe`);
    },
    onError: (error) => {
      console.log(error);
      capture(error);
      toastr.error("Erreur !", translate(error.message));
    },
  });

  const deleteTeamate = (user) => {
    updateTeamMemberMutation.mutate({
      action: "delete",
      member: user,
    });
  };

  if (!focusedSession) return <Loader />;

  return (
    <Page>
      <Breadcrumbs items={[{ title: "Séjours" }, { label: "Centres", to: "/centre" }, { label: "Fiche du centre", to: `/centre/${id}` }, { label: "Equipe" }]} />
      <Container className="mt-2">
        <div className="flex px-6 py-4">
          <div className="flex flex-col w-[45%]">
            <ChefCenterBlock headCenter={focusedSession.headCenter} />
            <TeamBlock team={focusedSession.team} deleteTeamate={deleteTeamate} adjoints={focusedSession.adjoints} />
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <AddBlock onConfirm={addTeamate} user={user} />
        </div>
        <ModalConfirm
          isOpen={modal?.isOpen}
          title={modal?.title}
          message={modal?.message}
          onChange={null}
          onCancel={() => setModal({ isOpen: false, onConfirm: () => {}, title: "", message: "" })}
          onConfirm={async () => {
            await modal?.onConfirm();
            setModal({ isOpen: false, onConfirm: () => {}, title: "", message: "" });
          }}
        />
      </Container>
    </Page>
  );
}

const ChefCenterBlock = ({ headCenter }: ChefCenterBlockProps) => {
  if (!headCenter)
    return (
      <div className="mb-8">
        <h4 className="mb-0">Aucun Chef de centre</h4>
      </div>
    );
  return (
    <div className="mb-8">
      <h4 className="mb-0">Chef de centre</h4>
      <Link to={`/user/${headCenter._id}`} target="_blank" className="cursor-pointer text-blue-600 hover:text-blue-600 hover:underline">
        {headCenter.firstName} {headCenter.lastName}&nbsp;›
      </Link>
      <div className="flex flex-col gap-4 mt-2 w-3/4">
        <div className="flex flex-col">
          <b>E-mail :</b>
          <p style={{ margin: 0 }}>{headCenter?.email}</p>
        </div>
        {headCenter.phone && (
          <div className="flex items-center justify-between">
            <b>Téléphone fixe :</b>
            <p style={{ margin: 0 }}>{headCenter.phone}</p>
          </div>
        )}
        {headCenter.mobile && (
          <div className="flex items-center justify-between">
            <b>Mobile :</b>
            <p style={{ margin: 0 }}>{headCenter.mobile}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TeamBlock = ({ team, deleteTeamate, adjoints }: TeamBlockProps) => {
  return (
    <div>
      <h4>Adjoints ({adjoints?.length || 0})</h4>
      {adjoints?.length === 0 && <p className="italic">Aucun adjoint</p>}

      {Object.values(ROLES)
        .filter((e) => e === ROLES.HEAD_CENTER_ADJOINT || e === ROLES.REFERENT_SANITAIRE)
        .map((role, index) => {
          return <GroupAdjoints key={index} adjoints={adjoints} role={role} />;
        })}

      <h4>Équipe ({team.length})</h4>
      {team.length === 0 && <p className="italic">Aucun membre</p>}

      {Object.values(CENTER_ROLES).map((role, index) => {
        return <GroupTeam key={index} team={team} role={role} deleteTeamate={deleteTeamate} />;
      })}
    </div>
  );
};

const GroupAdjoints = ({ adjoints, role }: GroupAdjointsProps) => {
  if (!adjoints) {
    return (
      <div className="mt-2 mb-4">
        <h6>{role}&nbsp;(0)</h6>
      </div>
    );
  }
  const adjointsFiltered =
    role === ROLES.HEAD_CENTER_ADJOINT ? adjoints.filter((e) => e.role === ROLES.HEAD_CENTER_ADJOINT) : adjoints.filter((e) => e.role === ROLES.REFERENT_SANITAIRE);

  return (
    <div className="mt-2 mb-4">
      <h6>
        {translate(role)}&nbsp;({adjointsFiltered.length})
      </h6>
      {adjointsFiltered.map((user, index) => (
        <Link to={`/user/${user._id}`} target="_blank" key={index} className="hover:text-blue-600">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50">
            <div className="flex items-center">
              <div key={index} className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-indigo-600">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="m-0">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

const GroupTeam = ({ team, role, deleteTeamate }: GroupTeamProps) => {
  const teamFiltered = team.filter((member) => member.role === role);

  return (
    <div className="mt-2 mb-4">
      <h6>
        {role}&nbsp;({teamFiltered.length})
      </h6>
      {teamFiltered.map((user, index) => (
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-gray-50" key={index}>
          <div className="flex items-center">
            <div key={index} className="mr-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-indigo-600">
              {user.firstName?.[0]?.toUpperCase()}
              {user.lastName?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="m-0">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:scale-105 group-hover:bg-white"
            onClick={() => deleteTeamate(user)}>
            <Trash width={16} height={16} />
          </div>
        </div>
      ))}
    </div>
  );
};

const AddBlock = ({ onConfirm, user }: AddBlockProps) => {
  const getListRoleByRole = () => {
    if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
      const listRole = Object.entries(CENTER_ROLES).map(([key, label]) => ({ value: key, label }));
      listRole.push(
        { value: ROLES.HEAD_CENTER, label: "Chef de centre" },
        { value: ROLES.HEAD_CENTER_ADJOINT, label: "Chef de centre adjoint" },
        { value: ROLES.REFERENT_SANITAIRE, label: "Référent sanitaire" },
      );

      return listRole;
    } else {
      return Object.entries(CENTER_ROLES).map(([key, label]) => ({ value: key, label }));
    }
  };

  const listRoles = getListRoleByRole();

  return (
    <div className="w-[55%]">
      <h4>Ajouter un nouveau membre à l’équipe</h4>
      <p className="text-gray-500">Renseignez les membres de l’équipe d’encadrement du centre de séjour de cohésion.</p>
      <div className="my-2 p-2 text-sm leading-5 font-medium bg-amber-50 text-amber-600 border-amber-500 rounded-md">
        <p>
          Un utilisateur ne peut pas avoir deux rôles sur le même compte. Si un utilisateur souhaite être à la fois chef de centre et chef de centre adjoint il doit alors avoir
          deux comptes distincts avec deux adresses mail différentes.
        </p>
      </div>
      <h6 className="uppercase text-gray-600 mt-6">
        informations <span className="text-red-500">*</span>
      </h6>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        initialValues={{
          firstName: "",
          lastName: "",
          role: "",
          email: "",
          phone: "",
        }}
        onSubmit={async (values, { resetForm }) => {
          await onConfirm(values);
          resetForm();
        }}>
        {({ values, handleChange, handleSubmit, errors, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <React.Fragment>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field
                    disabled={isSubmitting}
                    placeholder="Prénom"
                    validate={(v) => !v}
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: "100%", height: "auto", padding: "1rem", marginTop: "1rem", borderRadius: "7px", border: "solid 1px #ccc" }}
                  />
                </div>
                <div className="flex-1">
                  <Field
                    disabled={isSubmitting}
                    placeholder="Nom"
                    validate={(v) => !v}
                    name="lastName"
                    value={values.lastName}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: "100%", height: "auto", padding: "1rem", marginTop: "1rem", borderRadius: "7px", border: "solid 1px #ccc" }}
                  />
                </div>
              </div>
              <Field
                disabled={isSubmitting}
                placeholder="Adresse e-mail"
                validate={(v) => (!v && "Ce champ est obligatoire") || (!validator.isEmail(v) && "Format email incorrect")}
                name="email"
                value={values.email}
                onChange={handleChange}
                className="form-control"
                style={{ width: "100%", height: "auto", padding: "1rem", marginTop: "1rem", borderRadius: "7px", border: "solid 1px #ccc" }}
              />
              <p className="mt-2 text-center text-xs text-red-500">{errors.email}</p>
              <Field
                disabled={isSubmitting}
                as="select"
                validate={(v) => !v}
                className="form-control"
                name="role"
                value={values.role}
                onChange={handleChange}
                style={{ width: "100%", height: "auto", padding: "1rem", marginTop: "1rem", borderRadius: "7px", border: "solid 1px #ccc" }}>
                <option disabled value="" label="Rôle" />
                {listRoles.map((roleOption) => (
                  <option value={roleOption.value} key={roleOption.value} label={roleOption.label} />
                ))}
              </Field>
              <div className="flex items-center justify-center">
                <button
                  className="mt-4 cursor-pointer rounded-lg border-[1px] border-gray-400 bg-white py-2 px-8 disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                  disabled={isSubmitting}>
                  Ajouter le membre
                </button>
              </div>
              {!!Object.keys(errors).length && <p className="mt-2 text-center text-xs text-red-500">Merci de remplir tous les champs</p>}
            </React.Fragment>
          </form>
        )}
      </Formik>
    </div>
  );
};
