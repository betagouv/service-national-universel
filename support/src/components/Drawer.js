import Image from "next/image";
import NavLink from "./ActiveLink";
import EnvBanner from "./EnvBanner";

const Drawer = () => (
  <nav className="bg-snu-purple-900 h-full w-64 flex-col text-white">
    <div className="p-4 flex items-center justify-center">
      <Image src="/assets/logo-snu.png" width={38} height={38} />
      <span className="uppercase text-sm ml-4">Admin support</span>
    </div>
    <EnvBanner />
    <ul className="mt-2">
      <NavLink href="/admin">Tableau de bord</NavLink>
      <NavLink href="/admin/knowledge-base">Base de connaissance</NavLink>
      <NavLink href="/admin/tickets">Tickets</NavLink>
    </ul>
  </nav>
);

export default Drawer;
