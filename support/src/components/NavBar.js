import Image from "next/image";
import NavLink from "./NavLink";

const NavBar = () => {
  return (
    <nav className="bg-snu-purple-900 list-none flex-shrink-0 flex flex-col h-full w-14 hover:w-60 items-start transition-all duration-300 py-2 text-white">
      <div className="flex items-center justify-center w-14 h-10 mb-10 ">
        <Image src="/assets/logo-snu.png" width={38} height={38} />
      </div>
      <NavLink href="/admin" exact>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        <span className="flex-shrink-0 flex-nowrap overflow-ellipsis">Accueil</span>
      </NavLink>
      <NavLink href="/admin/base-de-connaissance">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <span className="flex-shrink-0 flex-nowrap overflow-ellipsis">Base de connaissance</span>
      </NavLink>
      <NavLink href="/admin/tickets">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <span className="flex-shrink-0 flex-nowrap overflow-ellipsis">Tickets</span>
      </NavLink>
      <NavLink href="/admin/settings">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>{" "}
        <span className="flex-shrink-0 flex-nowrap overflow-ellipsis">Réglages</span>
      </NavLink>
    </nav>
  );
};

export default NavBar;
