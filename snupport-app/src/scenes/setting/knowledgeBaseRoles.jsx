import React, { Fragment, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { setOrganisation } from "../../redux/auth/actions";
import { translateRoleBDC } from "../../utils";
import Modal from "./components/Modal";
import { TH } from "../../components/Table";

import { useDispatch, useSelector } from "react-redux";
import API from "../../services/api";

const formatRole = (role) => role.split(" ").join("").toLocaleLowerCase();

const KnowledgeBaseRoles = () => {
  const dispatch = useDispatch();
  const organisation = useSelector((state) => state.Auth.organisation);

  const [roles, setRoles] = useState(organisation.knowledgeBaseRoles || []);
  const [selectedRole, setSelectedRole] = useState(null);
  const [createModal, setCreateModal] = useState(false);

  const createRole = async (newRole) => {
    try {
      const response = await API.patch({
        path: `/organisation/${organisation._id}`,
        body: { knowledgeBaseRoles: [...new Set([...roles, newRole].map(formatRole))] },
      });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
        setRoles(response.data.knowledgeBaseRoles);
      } else {
        console.log(response);
      }
    } catch (e) {
      console.log(e);
      toast.error("Une erreur est survenue lors de la création du rôle");
    }
  };

  const deleteRole = async (role) => {
    try {
      const response = await API.patch({
        path: `/organisation/${organisation._id}`,
        body: { knowledgeBaseRoles: roles.filter((r) => r !== role) },
      });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
        setRoles(response.data.knowledgeBaseRoles);
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la supression du rôle");
    }
  };

  const updateRole = async (updatedRole) => {
    try {
      const response = await API.patch({
        path: `/organisation/${organisation._id}`,
        body: { knowledgeBaseRoles: roles.map((r) => (r === selectedRole ? updatedRole : r)).map(formatRole) },
      });
      if (response.ok) {
        dispatch(setOrganisation(response.data));
        toast.success("Ok");
        setRoles(response.data.knowledgeBaseRoles);
      }
    } catch (e) {
      toast.error("Une erreur est survenue lors de la modification du rôle");
    }
  };

  return (
    <Fragment>
      <div className="mb-[38px] flex items-center justify-between pl-[22px]">
        <div className="mb-8 pl-[22px]">
          <span className="text-sm font-medium uppercase text-gray-500">Base de connaissance</span>
          <h4 className="mt-1.5 text-3xl font-bold text-black-dark">Gestion des rôles</h4>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setCreateModal(true)}
            type="button"
            className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Nouveau
          </button>
          <ModalCreate open={createModal} setOpen={setCreateModal} handleConfirm={createRole} />
        </div>
      </div>

      <ListRoles roles={roles} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />
      <ModalUpdate
        open={!!selectedRole}
        setOpen={() => {
          setSelectedRole(null);
        }}
        handleDelete={(role) => {
          deleteRole(role);
          setSelectedRole(null);
        }}
        handleConfirm={(updatedRole) => {
          updateRole(updatedRole);
          setSelectedRole(null);
        }}
        role={selectedRole}
      />
    </Fragment>
  );
};

const ListRoles = ({ roles, setSelectedRole }) => {
  if (!roles.length) return <span className="text-sm font-medium uppercase text-gray-500">Pas encore de rôle</span>;
  return (
    <div>
      <div className="mb-6 rounded-lg bg-white shadow">
        <div className="flex justify-between rounded-t-lg border-b border-gray-200 bg-gray-50">
          <TH text="Rôle" />
          <TH text="Action" className="w-[128px] flex-none" />
        </div>
        <div className="flex flex-col justify-between">
          {roles.map((role, index) => (
            <div className="flex last:rounded-b-lg odd:bg-white even:bg-gray-50" key={index}>
              <div className="flex-1 px-6 py-4">
                <span className="rounded-md  py-1.5 px-2.5 text-base text-gray-800">{translateRoleBDC[role]}</span>
              </div>
              <p className="flex-1 px-6 py-4 text-sm text-gray-500">-</p>
              <div className="flex w-[128px] flex-none items-center gap-5 px-6 py-4">
                <button onClick={() => setSelectedRole(role)} className="text-sm font-medium text-accent-color transition-colors hover:text-indigo-500">
                  Editer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ModalCreate = ({ open, setOpen, handleConfirm }) => {
  const [input, setInput] = useState("");

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Ajouter un rôle</h5>

      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Le rôle doit être en minuscules, sans caractère spécial (accents, etc.), sans espace</label>
        <input
          type="text"
          value={input}
          pattern="^[a-z0-9_\-]+$"
          onChange={(e) => setInput(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom du rôle"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Fermer
        </button>
        <button
          type="button"
          onClick={() => {
            handleConfirm(input);
            setOpen(false);
          }}
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

const ModalUpdate = ({ open, setOpen, handleConfirm, handleDelete, role }) => {
  const [updatedRole, setUpdatedRole] = useState("");

  useEffect(() => {
    setUpdatedRole(role || "");
  }, [role]);

  return (
    <Modal open={open} setOpen={setOpen}>
      <h5 className="mb-[36px] text-center text-2xl font-bold text-gray-900">Modifier un rôle</h5>
      <div className="mb-[34px]">
        <label className="mb-1 inline-block text-sm font-medium text-gray-700">Le rôle doit être en minuscules, sans caractère spécial (accents, etc.), sans espace</label>
        <input
          type="text"
          value={updatedRole}
          pattern="^[a-z0-9_\-]+$"
          onChange={(e) => setUpdatedRole(e.target.value)}
          className="w-full rounded border border-gray-300 bg-white py-2.5 px-3.5 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
          placeholder="Nom de l'étiquette"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleDelete(role)}
          className="h-[38px] flex-1 rounded-md border border-gray-300 px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Supprimer
        </button>
        <button
          type="button"
          onClick={() => handleConfirm(updatedRole)}
          className="h-[38px] flex-1 rounded-md bg-accent-color  px-4 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Enregistrer
        </button>
      </div>
    </Modal>
  );
};

export default KnowledgeBaseRoles;
