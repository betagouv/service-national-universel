import React from "react";
import { ROLES, translate } from "snu-lib";

export default function UserCard({ user }) {
  function getAvatar(user) {
    if (user?.firstName === "Acteur inconnu") return "?";
    if (user?.firstName && user?.lastName) return `${user?.firstName?.substring(0, 1)}${user?.lastName ? user.lastName.substring(0, 1) : null}`;
    return "🤖";
    // return "?";
  }
  function getlink(user) {
    if (Object.values(ROLES).includes(user?.role)) return `/user/${user._id}`;
    if (user?.role === "Volontaire") return `/volontaire/${user._id}`;
    return null;
  }

  if (!user) return null;
  return (
    <a href={getlink(user)} className=" flex flex-col hover:cursor-pointer group w-full">
      <div className="flex items-center gap-2">
        <div className="shrink-0 rounded-full w-10 h-10 bg-slate-100 font-medium flex items-center justify-center border-2 border-white text-blue-600 uppercase group-hover:bg-blue-600 group-hover:text-slate-100 transition">
          {getAvatar(user)}
        </div>
        <div className="flex flex-col leading-5 w-10/12">
          <p className="font-medium truncate underline-offset-2 decoration-2 w-full">
            {user.firstName} {user.lastName && user.lastName}
          </p>
          <p className="capitalize text-gray-400 truncate underline-offset-2 decoration-2 w-full">{translate(user?.role)}</p>
        </div>
      </div>
    </a>
  );
}
