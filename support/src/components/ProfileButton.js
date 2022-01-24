import { Popover } from "@headlessui/react";
import { SUPPORT_ROLES } from "snu-lib/roles";

const ProfileButton = ({ children, className = "", onLogout, user, showNameAndRole = false }) => {
  return (
    <Popover className={`relative flex justify-end flex-grow-0 order-2 ${className} md:flex-none`}>
      <Popover.Button className="flex items-start justify-center gap-3 p-0 text-left bg-white border-none rounded-none shadow-none">
        <span className="rounded-full h-10 w-10 border-red-500 border-4 text-snu-purple-900 uppercase flex justify-center items-center">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </span>
        {showNameAndRole && (
          <div className="flex flex-col justify-center h-full">
            <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
            {!!user.role && <span className="text-xs font-medium text-gray-500">{SUPPORT_ROLES[user.role]}</span>}
          </div>
        )}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-[200px] z-10 top-10">
        <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
          {children}
          <a onClick={onLogout} className="text-sm font-medium text-gray-700 cursor-pointer">
            Déconnexion
          </a>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ProfileButton;
