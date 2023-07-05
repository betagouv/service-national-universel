import { Popover } from "@headlessui/react";

const ProfileButton = ({ children, className = "", onLogout, user }) => {
  return (
    <Popover className={`relative order-2 flex grow-0 justify-end ${className} md:flex-none`}>
      <Popover.Button className="flex items-center text-sm font-bold tracking-tight justify-center h-10 w-10 gap-3 bg-blue-50 rounded-full uppercase text-[#32257F]">
        {user.firstName?.[0]}
        {user.lastName?.[0]}
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
