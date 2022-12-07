import React from "react";
import { ROLES, translate } from "snu-lib";

export default function UserCard({ user }) {
  function getAvatar(user) {
    if (user?.firstName?.includes("Script")) return "🤖";
    if (user?.firstName) return user?.firstName?.substring(0, 1) + user?.lastName?.substring(0, 1);
    return "?";
  }
  function getlink(user) {
    if (Object.values(ROLES).includes(user?.role)) return `/user/${user._id}`;
    if (user?.role === "Volontaire") return `/volontaire/${user._id}`;
    return null;
  }
  function getName(user) {
    if (user?.firstName) return user?.firstName + " " + user?.lastName;
    return "Acteur inconnu";
  }

  if (!user) return null;
  return (
    <a href={getlink(user)} className="hover:cursor-pointer group">
      <div className="flex gap-2">
        <div className="rounded-full w-10 h-10 overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white text-blue-600 uppercase group-hover:bg-blue-600 group-hover:text-slate-100">
          {getAvatar(user)}
        </div>
        <div className="max-w-xs">
          <p className="font-medium truncate h-5 underline-offset-2 decoration-2 group-hover:underline">{getName(user)}</p>
          {user?.role && <p className="capitalize text-gray-400 underline-offset-2 decoration-2 group-hover:underline">{translate(user.role)}</p>}
        </div>
      </div>
    </a>
  );
}
