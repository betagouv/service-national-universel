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
    <a href={getlink(user)} className=" group flex w-full flex-col hover:cursor-pointer">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-medium uppercase text-blue-600 transition group-hover:bg-blue-600 group-hover:text-slate-100">
          {getAvatar(user)}
        </div>
        <div className="flex w-10/12 flex-col leading-5">
          <p className="w-full truncate font-medium decoration-2 underline-offset-2">
            {user.firstName} {user.lastName && user.lastName}
          </p>
          <p className="w-full truncate capitalize text-gray-400 decoration-2 underline-offset-2">{translate(user?.role)}</p>
        </div>
      </div>
    </a>
  );
}
