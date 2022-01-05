import Image from "next/image";
import NavLink from "./NavLink";
import Logout from "./Logout";
import Search from "./Search";

const NavBar = () => {
  return (
    <nav className="text-snu-purple-900 list-none flex-shrink-0 flex w-full px-4 py-2 bg-white transition-transform">
      <div className="p-2 flex flex-row-reverse"></div>
      <div className="flex items-center justify-start">
        <Image src="/assets/logo-snu.png" width={38} height={38} />
        <span className=" text-sm ml-4">SNU Support</span>
      </div>
      <div className="w-1/2 max-w-lg flex-shrink mr-auto ml-auto">
        <Search path="/admin/knowledge-base" restriction="admin" showAllowedRoles noAnswer="Il n'y a pas de résultat 👀" />
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
