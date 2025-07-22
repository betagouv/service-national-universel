import React from "react";
import ProfileButton from "./ProfileButton";
import Search from "./Search";
import { useSelector } from "react-redux";

export default function Topbar() {
  const user = useSelector((state) => state.Auth.user);

  return (
    <div className="sticky top-0 z-50 flex h-16 flex-none items-center justify-between bg-white px-6 shadow-sm">
      <div className="flex-shrink flex-grow">
        <Search user={user} />
      </div>
      <div className={`flex ${user.role === "DG" && "opacity-50 pointer-events-none"}`}>
        <a
          className="flex h-[40px] cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          target="_blank"
          href="/ticket/new"
        >
          {user.role === "AGENT" ? "Créer un ticket" : "Nouveau message"}
        </a>
      </div>

      <ProfileButton />
    </div>
  );
}
