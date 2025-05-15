import React from "react";
import { translate } from "snu-lib";

export default function UserInfo({ user }) {
  function getAuthor(user) {
    if (!user) return "Auteur inconnu";
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName.toUpperCase()}`;
    if (user.firstName && !user.lastName) return user.firstName;
  }
  function getRole(user) {
    if (!user) return "Donnée indisponible";
    if (user.role) {
      return translate(user.role);
    } else {
      return "Script";
    }
  }
  return (
    <div className="flex w-full flex-col">
      <p className="w-full truncate font-medium decoration-2 underline-offset-2 text-sm">
        {getAuthor(user)} <span className="truncate font-normal capitalize text-gray-500 text-xs">{getRole(user)}</span>
      </p>
    </div>
  );
}
