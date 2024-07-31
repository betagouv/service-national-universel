import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory, Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { Formik, Field } from "formik";
import validator from "validator";

import { CENTER_ROLES, ROLES, translate, SENDINBLUE_TEMPLATES } from "snu-lib";
import { Box } from "../../../components/box";
import api from "../../../services/api";
import Trash from "../../../assets/icons/Trash";
import ChevronRight from "../../../assets/icons/ChevronRight";
import Template from "../../../assets/icons/Template";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import { capture } from "../../../sentry";

export default function Team({ focusedSession: focusedSessionfromProps }) {
  const { id, sessionId } = useParams();
  const [focusedSession, setFocusedSession] = useState(focusedSessionfromProps);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const addTeamate = async (teamate) => {
    let obj = {};

    if (teamate.role === CENTER_ROLES.chef) obj = await setChefCenter(teamate);
    else obj = await setTeamate(teamate);

    if (!Object.keys(obj).length) return;

    try {
      const { ok, data } = await api.put(`/session-phase1/${focusedSession._id}/team`, obj);
      if (!ok) toastr.error("Oups, une erreur est survenue lors de l'ajout du membre", translate(data.code));
      setFocusedSession(data);
      toastr.success("Succès", "Le membre a été ajouté à l'équipe");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  const setChefCenter = async (teamate) => {
    try {
      let { data: referent } = await api.get(`/referent?email=${encodeURIComponent(teamate.email)}`);

      if (!referent) {
        // todo : create chef de centre
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
          onConfirm: () => inviteChefDeCentre(teamate),
        });
        return {};
      }

      return { headCenterId: referent._id };
    } catch (e) {
      toastr.error("Erreur !", translate(e));
    }
  };

  const inviteChefDeCentre = async (user) => {
    try {
      const responseInvitation = await api.post(`/referent/signup_invite/${SENDINBLUE_TEMPLATES.invitationReferent[ROLES.HEAD_CENTER]}`, {
        ...user,
        role: ROLES.HEAD_CENTER,
        cohorts: [focusedSession?.cohort],
      });
      if (!responseInvitation?.ok) return toastr.error("Erreur !", translate(responseInvitation?.code));
      const responseSession = await api.put(`/session-phase1/${focusedSession._id}/team`, { headCenterId: responseInvitation?.data?._id });
      if (!responseSession?.ok) return toastr.error("Erreur !", translate(responseInvitation?.code));
      setFocusedSession(responseSession?.data);
      toastr.success("Succès", `${user.firstName} ${user.lastName} a reçu une invitation pour rejoindre l'équipe`);
    } catch (e) {
      toastr.error("Erreur !", translate(e));
    }
  };

  const setTeamate = async (teamate) => {
    const obj = { team: focusedSession.team };
    obj.team.push(teamate);
    return obj;
  };

  const deleteTeamate = async (user) => {
    const index = focusedSession.team.findIndex((e) => JSON.stringify(e) === JSON.stringify(user));
    focusedSession.team.splice(index, 1);

    try {
      const r = await api.put(`/session-phase1/${focusedSession._id}/team`, { team: focusedSession.team });
      const { ok, data } = r;
      if (!ok) toastr.error("Oups, une erreur est survenue lors de la suppression du membre", translate(data.code));
      setFocusedSession(data);
      toastr.success("Succès", "Le membre a été supprimé de l'équipe");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !", translate(e.code));
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data } = await api.get(`/session-phase1/${sessionId}`);
      setFocusedSession(data);
    })();
  }, [sessionId]);

  if (!focusedSession) return null;

  return (
    <>
      <div className="ml-12 mt-8 flex items-center gap-3 text-gray-400">
        <Template className="" />
        <ChevronRight className="" />
        <Link className="text-xs hover:text-snu-purple-300 hover:underline" to={`/centre`}>
          Centres
        </Link>
        <ChevronRight className="" />
        <Link className="text-xs hover:text-snu-purple-300 hover:underline" to={`/centre/${id}`}>
          Fiche du centre
        </Link>
        <ChevronRight className="" />
        <div className="text-xs">Équipe</div>
      </div>
      <div className="p-4">
        <Box>
          <Wrapper gridTemplateColumns="repeat(2,1fr)" style={{ background: "linear-gradient(#E5E4E8,#E5E4E8) center/1px 100% no-repeat" }}>
            <div>
              <ChefCenterBlock headCenterId={focusedSession?.headCenterId} />
              <TeamBlock team={focusedSession?.team} deleteTeamate={deleteTeamate} />
            </div>
            <AddBlock addTeamate={addTeamate} />
          </Wrapper>
        </Box>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={async () => {
          await modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}

const ChefCenterBlock = ({ headCenterId }) => {
  if (!headCenterId) return <></>;

  const history = useHistory();
  const [chefCenter, setChefCenter] = useState();

  useEffect(() => {
    (async () => {
      const { ok, data, code } = await api.get(`/referent/${headCenterId}`);
      if (!ok) {
        capture(new Error(code));
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setChefCenter(data);
    })();
  }, [headCenterId]);

  return (
    <div className="p-12 pb-0">
      <h4 className="mb-0">Chef de centre</h4>
      <a onClick={() => history.push(`/user/${headCenterId}`)} className="cursor-pointer text-snu-purple-300 hover:text-snu-purple-300 hover:underline">
        {chefCenter?.firstName} {chefCenter?.lastName}&nbsp;›
      </a>
      <Wrapper gridTemplateColumns="120px auto" style={{ marginBlock: "1rem" }}>
        <b>E-mail :</b>
        <p style={{ margin: 0 }}>{chefCenter?.email}</p>
        {chefCenter?.phone && (
          <>
            <b>Téléphone fixe :</b>
            <p style={{ margin: 0 }}>{chefCenter.phone}</p>
          </>
        )}
        {chefCenter?.mobile && (
          <>
            <b>Mobile :</b>
            <p style={{ margin: 0 }}>{chefCenter.mobile}</p>
          </>
        )}
      </Wrapper>
    </div>
  );
};

const TeamBlock = ({ team, deleteTeamate }) => {
  if (!team) return <></>;

  return (
    <div className="p-12">
      <h4>Équipe ({team.length || 0})</h4>
      {team.length === 0 && <p className="italic">Aucun membre</p>}

      {Object.values(CENTER_ROLES)
        .filter((e) => e !== CENTER_ROLES.chef)
        .map((role, index) => {
          return <Group key={index} team={team} role={role} deleteTeamate={deleteTeamate} />;
        })}
    </div>
  );
};

const Group = ({ team, role, deleteTeamate }) => {
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

const AddBlock = ({ addTeamate }) => {
  const listRoles = Object.values(CENTER_ROLES);

  return (
    <div className="p-12">
      <h4>Ajouter un nouveau membre à l’équipe</h4>
      <p className="text-gray-500">Renseignez les membres de l’équipe d’encadrement du centre de séjour de cohésion.</p>
      <h6 className="uppercase text-gray-600">
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
        onSubmit={(values) => addTeamate(values)}>
        {({ values, handleChange, handleSubmit, errors, isSubmitting }) => (
          <React.Fragment>
            <div className="flex gap-2">
              <div className="flex-1">
                <CustomField disabled={isSubmitting} placeholder="Prénom" validate={(v) => !v} name="firstName" value={values.firstName} onChange={handleChange} />
              </div>
              <div className="flex-1">
                <CustomField disabled={isSubmitting} placeholder="Nom" validate={(v) => !v} name="lastName" value={values.lastName} onChange={handleChange} />
              </div>
            </div>
            <CustomField
              disabled={isSubmitting}
              placeholder="Adresse e-mail"
              validate={(v) => (!v && "Ce champ est obligatoire") || (!validator.isEmail(v) && "Format email incorrect")}
              name="email"
              value={values.email}
              onChange={handleChange}
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
              {listRoles.map((e) => (
                <option value={e} key={e} label={e} />
              ))}
            </Field>
            <div className="flex items-center justify-center">
              <button
                className="mt-4 cursor-pointer rounded-lg border-[1px] border-gray-400 bg-white py-2 px-8 disabled:cursor-not-allowed disabled:opacity-50 "
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}>
                Ajouter le membre
              </button>
            </div>
            {!!Object.keys(errors).length && <p className="mt-2 text-center text-xs text-red-500">Merci de remplir tous les champs</p>}
          </React.Fragment>
        )}
      </Formik>
    </div>
  );
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: ${(props) => `${props.gridTemplateColumns}`};
  grid-gap: 10px;
`;

const CustomField = styled(Field)`
  width: 100%;
  height: auto;
  padding: 1rem;
  margin-top: 1rem;
  border: none;
  border-radius: 7px;
  border: solid 1px #ccc;
  ::placeholder {
    color: #cbcbcb;
    opacity: 1;
  }
`;
