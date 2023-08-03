import { Popover } from "@headlessui/react";

const ProfileButton = ({ children, className = "", onLogout, user }) => {
  return (
    <Popover className={`relative order-2 flex grow-0 justify-end ${className} md:flex-none`}>
      <Popover.Button className="flex items-start justify-center gap-3 rounded-none border-none bg-white p-0 text-left shadow-none">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-red-500 uppercase text-snu-purple-900">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </span>
        {/* showNameAndRole && (
          <div className="flex h-full flex-col justify-center">
            <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
            {!!user.role && <span className="text-xs font-medium text-gray-500">{SUPPORT_ROLES[user.role]}</span>}
          </div>
        ) */}
      </Popover.Button>

      <Popover.Panel className="absolute right-0 top-10 z-10 min-w-[208px] lg:min-w-[200px]">
        <div className="flex flex-col gap-4 rounded-md border border-gray-300 bg-white px-4 py-3">
          {children}
          <a onClick={onLogout} className="cursor-pointer text-sm font-medium text-gray-700">
            Déconnexion
          </a>
        </div>
      </Popover.Panel>
    </Popover>
  );
};

export default ProfileButton;
