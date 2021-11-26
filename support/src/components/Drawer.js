import Image from "next/image";
import NavLink from "./NavLink";
import EnvBanner from "./EnvBanner";
import Logout from "./Logout";

const Drawer = ({ visible, setVisible }) => {
  return (
    <nav className={`bg-snu-purple-900 flex-shrink-0 flex flex-col h-full w-64 text-white transition-transform overflow-hidden ${!visible && "w-0"}`}>
      <div className="p-2 flex flex-row-reverse">
        <svg onClick={() => setVisible(false)} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div className="p-4 flex items-center justify-center">
        <Image src="/assets/logo-snu.png" width={38} height={38} />
        <span className="uppercase text-sm ml-4">Admin support</span>
      </div>
      <EnvBanner />
      <ul className="mt-2 flex flex-col flex-grow">
        <NavLink href="/admin" exact>
          Tableau de bord
        </NavLink>
        <NavLink href="/admin/knowledge-base">Base de connaissance</NavLink>
        <NavLink href="/admin/tickets">Tickets</NavLink>
        <Logout />
      </ul>
    </nav>
  );
};

export default Drawer;
