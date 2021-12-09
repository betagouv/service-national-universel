import Image from "next/image";
import NavLink from "./NavLink";
import Logout from "./Logout";

const NavBar = () => {
  return (
    <nav className="text-snu-purple-900 list-none flex-shrink-0 flex w-full px-4 py-2 bg-white transition-transform overflow-hidden">
      <div className="p-2 flex flex-row-reverse"></div>
      <div className="flex items-center justify-start flex-grow">
        <Image src="/assets/logo-snu.png" width={38} height={38} />
        <span className=" text-sm ml-4">SNU Support</span>
      </div>
      <NavLink href="/admin" exact>
        Tableau de bord
      </NavLink>
      <NavLink href="/admin/knowledge-base">Base de connaissances</NavLink>
      <NavLink href="/admin/tickets">Tickets</NavLink>
      <Logout />
    </nav>
  );
};

export default NavBar;
