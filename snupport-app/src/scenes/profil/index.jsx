import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/auth/actions";

import API from "../../services/api";
import { TRANSLATE_ROLE } from "../../utils";

export default function Index() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.Auth.user);
  const [newUser, setNewUser] = useState(user);
  const updateUser = async () => {
    try {
      const { email, firstName, lastName } = newUser;
      const { ok } = await API.patch({ path: `/agent/${user._id}`, body: { email, firstName, lastName } });
      if (ok) {
        dispatch(setUser(newUser));
        toast.success("Profil modifié avec succès");
      }
    } catch (e) {
      console.error("Update User Error:", e);
      toast.error("Erreur lors de la modification du profil");
    }
  };

  return (
    <div className="flex-1 overflow-auto px-14 py-9">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase text-gray-500">mon profil</p>
          <div className="mt-1.5 flex items-center gap-2">
            <h4 className="text-3xl font-bold text-black-dark">
              {user.firstName} {user.lastName}
            </h4>
            <span className="rounded bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-800">{TRANSLATE_ROLE[user.role]}</span>
          </div>
        </div>
        <button type="button" onClick={updateUser} className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
          Enregistrer
        </button>
      </div>

      <div className="rounded-md bg-white px-16 pt-10 pb-5 shadow">
        <div className="mb-10 divide-y divide-gray-200 border-b border-gray-200">
          <div className="py-5">
            <p className="text-lg font-medium text-gray-900">Mes informations personnelles</p>
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
              className="w-full max-w-xs rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Nom"
            />
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">Prénom</label>
            <input
              type="text"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
              className="w-full max-w-xs rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Prénom"
            />
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full max-w-md rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="E-mail"
            />
          </div>
        </div>

        {/* <div className="mb-10 divide-y divide-gray-200 border-b border-gray-200">
          <div className="py-5">
            <p className="text-lg font-medium text-gray-900">Mon mot de passe</p>
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">Mot de passe actuel</label>
            <input
              type="password"
              className="w-full max-w-xs rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Mot de passe actuel"
            />
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              type="password"
              className="w-full max-w-xs rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div className="flex items-center gap-6 py-5">
            <label className="w-full max-w-xs text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              className="w-full max-w-xs rounded border border-gray-300 bg-white py-2.5 px-3 text-sm text-black-dark shadow-sm transition-colors placeholder:text-gray-500 focus:border-gray-400"
              placeholder="Confirmer le nouveau mot de passe"
            />
          </div>
        </div> */}

        <div className="flex justify-end py-8 pb-4">
          <button type="button" onClick={updateUser} className="h-[38px] rounded-md bg-accent-color px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
