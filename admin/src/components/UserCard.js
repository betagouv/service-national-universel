import React from "react";
import { translate } from "snu-lib";

export default function UserCard({ user }) {
  if (!user) return null;
  return (
    <div className="flex gap-2">
      <UserPicture user={user} />
      <div className="max-w-xs">
        <p className="font-medium truncate h-5">
          {user?.firstName} {user?.lastName}
        </p>
        {user && <p className="capitalize text-gray-400">{translate(user.role)}</p>}
      </div>
    </div>
  );
}

function UserPicture({ user }) {
  const initials = user?.firstName?.substring(0, 1) + user?.lastName?.substring(0, 1);
  if (!user?.firstName && !user?.lastName) return null;
  return (
    <div className="rounded-full min-w-10 w-10 h-10 overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-white text-blue-600 uppercase">{initials}</div>
  );
}
