import React from "react";
import { ROLES, UserSaved } from "snu-lib";
import cx from "classnames";
import UserInfo from "./UserInfo";
import LinkWrapper from "./LinkWrapper";

interface Props {
  user: UserSaved;
}

export default function UserCard({ user }: Props) {
  function getAvatar(user) {
    if (!user) return "??";
    const firstName = user.impersonatedBy ? user.impersonatedBy.firstName : user?.firstName;
    const lastName = user.impersonatedBy ? user.impersonatedBy.lastName : user?.lastName;
    if (firstName === "Acteur inconnu") return "?";
    if (firstName && lastName) return `${firstName?.substring(0, 1)}${lastName ? lastName.substring(0, 1) : null}`;
    if (firstName && !lastName) return "🤖";
    return "??";
  }
  function getLink(user) {
    if (Object.values(ROLES).includes(user?.role)) return `/user/${user._id}`;
    if (user?.role === "Volontaire") return `/volontaire/${user._id}`;
    return null;
  }

  const hasLink = getLink(user) !== null;

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div
        className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-medium uppercase ", {
          "text-blue-600 transition group-hover:bg-blue-600 group-hover:text-slate-100": hasLink,
          "text-cyan-900": !hasLink,
        })}>
        {getAvatar(user)}
      </div>

      <div className="flex w-10/12 flex-col leading-5">
        {user.impersonatedBy ? (
          <>
            <LinkWrapper link={getLink(user.impersonatedBy)} hasLink={getLink(user.impersonatedBy) !== null}>
              <UserInfo user={user.impersonatedBy} />
            </LinkWrapper>

            <LinkWrapper link={getLink(user)} hasLink={hasLink}>
              <p className="w-full truncate capitalize text-gray-500 text-xs decoration-2 underline-offset-2">En tant que :</p>
              <UserInfo user={user} />
            </LinkWrapper>
          </>
        ) : (
          <LinkWrapper link={getLink(user)} hasLink={hasLink}>
            <UserInfo user={user} />
          </LinkWrapper>
        )}
      </div>
    </div>
  );
}
