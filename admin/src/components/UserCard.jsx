import React from "react";
import { ROLES, translate } from "snu-lib";
import cx from "classnames";

export default function UserCard({ user }) {
  function getAvatar(user) {
    if (!user) return "??";
    const firstName = user.impersonatedBy ? user.impersonatedBy.firstName : user?.firstName;
    const lastName = user.impersonatedBy ? user.impersonatedBy.lastName : user?.lastName;
    if (firstName === "Acteur inconnu") return "?";
    if (firstName && lastName) return `${firstName?.substring(0, 1)}${lastName ? lastName.substring(0, 1) : null}`;
    if (firstName && !lastName) return "🤖";
  }
  function getLink(user) {
    if (Object.values(ROLES).includes(user?.role)) return `/user/${user._id}`;
    if (user?.role === "Volontaire") return `/volontaire/${user._id}`;
    return null;
  }
  function getRole(user) {
    if (!user) return "Donnée indisponible";
    if (user.role) {
      return translate(user.role);
    } else {
      return "Script";
    }
  }
  function getAuthor(user) {
    if (!user) return "Auteur inconnu";
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName.toUpperCase()}`;
    if (user.firstName && !user.lastName) return user.firstName;
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-medium uppercase ", {
          "text-blue-600 transition group-hover:bg-blue-600 group-hover:text-slate-100": getLink(user) !== null,
          "text-cyan-900": getLink(user) === null,
        })}>
        {getAvatar(user)}
      </div>
      {user.impersonatedBy ? (
        <div className="flex w-10/12 flex-col leading-5">
          <a
            href={getLink(user)}
            target="_blank"
            rel="noreferrer"
            className={cx("group flex w-full flex-col", {
              "hover:cursor-pointer hover:text-blue-600": getLink(user) !== null,
              "hover:text-inherit": getLink(user) === null,
            })}>
            <p className="w-full truncate font-medium decoration-2 underline-offset-2 text-sm">
              {getAuthor(user.impersonatedBy)} <span className="truncate font-normal capitalize text-gray-500 text-xs">{getRole(user)}</span>
            </p>
          </a>
          <a
            href={getLink(user)}
            target="_blank"
            rel="noreferrer"
            className={cx("group flex w-full flex-col", {
              "hover:cursor-pointer hover:text-blue-600": getLink(user) !== null,
              "hover:text-inherit": getLink(user) === null,
            })}>
            <p className="w-full truncate capitalize text-gray-500 text-xs decoration-2 underline-offset-2">En tant que :</p>
            <p className="w-full truncate font-medium decoration-2 underline-offset-2 text-sm">
              {getAuthor(user)} <span className="truncate font-normal capitalize text-gray-500 text-xs">{getRole(user)}</span>
            </p>
          </a>
        </div>
      ) : (
        <a
          href={getLink(user)}
          target="_blank"
          rel="noreferrer"
          className={cx("group flex w-full flex-col", {
            "hover:cursor-pointer hover:text-blue-600": getLink(user) !== null,
            "hover:text-inherit": getLink(user) === null,
          })}>
          <div className="flex w-10/12 flex-col leading-5">
            <p className="w-full truncate font-medium decoration-2 underline-offset-2 text-sm">{getAuthor(user)}</p>
            <p className="w-full truncate capitalize text-gray-500 text-xs decoration-2 underline-offset-2">{getRole(user)}</p>
          </div>
        </a>
      )}
    </div>
  );
}
