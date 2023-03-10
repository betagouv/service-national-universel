import React from "react";
import { useSelector } from "react-redux";
import useDevice from "../../../hooks/useDevice";

import Close from "./assets/Close";
import Hamburger from "./assets/Hamburger";
import Logo from "./components/Logo";
import NavigationMenu from "./components/NavigationMenu";
import UserCard from "./components/UserCard";
import UserMenu from "./components/UserMenu";

export default function Navbar() {
  const device = useDevice();

  if (device === "mobile") {
    return <MobileNavbar />;
  }
  return <DesktopNavbar />;
}

function MobileNavbar() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const [isUserOpen, setIsUserOpen] = React.useState(false);
  const ref = React.useRef();
  const user = useSelector((state) => state.Auth.young);

  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsNavOpen(false);
      setIsUserOpen(false);
    }
    document.removeEventListener("click", handleClickOutside, true);
  }

  function handleMenuClick() {
    setIsNavOpen(true);
    document.addEventListener("click", handleClickOutside, true);
  }

  function handleUserClick() {
    setIsUserOpen(true);
    document.addEventListener("click", handleClickOutside, true);
  }

  return (
    <header className="text-[#D2DAEF] text-sm" ref={ref}>
      <div className="w-full h-16 grid md:hidden grid-cols-3 bg-[#212B44] items-center z-20">
        <div>
          <button onClick={handleMenuClick} className="h-16 w-16 p-3">
            <Hamburger className="text-[#828EAC]" />
          </button>
        </div>

        <div className="h-16">
          <Logo />
        </div>

        <button onClick={handleUserClick} className="flex justify-end pr-4">
          <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{user?.firstName[0] + user?.lastName[0]}</p>
        </button>
      </div>

      <MobileDrawer isOpen={isNavOpen} setIsOpen={setIsNavOpen}>
        <NavigationMenu setIsOpen={setIsNavOpen} />
      </MobileDrawer>

      <MobileDrawer isOpen={isUserOpen} setIsOpen={setIsUserOpen}>
        <UserMenu setIsOpen={setIsUserOpen} />
      </MobileDrawer>
    </header>
  );
}

function MobileDrawer({ children, isOpen, setIsOpen }) {
  return (
    <div className={`fixed top-0 w-full z-50 ease-in-out duration-200 ${isOpen ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="bg-[#212B44] h-16 flex justify-end items-center">
        <button onClick={() => setIsOpen(false)} className="pr-4 pl-6 h-full">
          <Close className="text-[#828EAC]" />
        </button>
      </div>
      {children}
    </div>
  );
}

function DesktopNavbar() {
  return (
    <header className="text-[#D2DAEF] text-sm w-64 h-screen z-50 bg-[#212B44] hidden md:flex flex-col justify-start">
      <div className="border-b-[1px] border-[#2A3655] h-24 flex-none">
        <Logo />
      </div>

      <div className="flex-grow overflow-auto">
        <NavigationMenu />
      </div>

      <div className="flex-none">
        <UserCard />
      </div>
    </header>
  );
}
