import React from "react";
import { ROLES, translate } from "snu-lib";

export default function UserCard({ user }) {
  function getAvatar(user) {
    if (user?.firstName?.toLowerCase().includes("script" || "modification automatique")) return "🤖";
    if (user?.firstName === "Acteur inconnu") return "?";
    if (user?.firstName) return `${user?.firstName?.substring(0, 1)}${user?.lastName ? user.lastName.substring(0, 1) : null}`;
    return "?";
  }
  function getlink(user) {
    if (Object.values(ROLES).includes(user?.role)) return `/user/${user._id}`;
    if (user?.role === "Volontaire") return `/volontaire/${user._id}`;
    return null;
  }

  if (!user) return null;
  return (
    <a href={getlink(user)} className="hover:cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="shrink-0 rounded-full w-10 h-10 overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white text-blue-600 uppercase group-hover:bg-blue-600 group-hover:text-slate-100">
          {getAvatar(user)}
        </div>
        <div className="max-w-xs leading-4">
          <p className="font-medium truncate underline-offset-2 decoration-2">
            {user.firstName} {user.lastName && user.lastName}
          </p>
          <p className="capitalize text-gray-400 truncate underline-offset-2 decoration-2">{translate(user?.role)}</p>
        </div>
      </div>
    </a>
  );
}
