import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import useDevice from "../../../hooks/useDeviceWithResize";

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
  const ref = React.useRef();
  const user = useSelector((state) => state.Auth.young);
  const [drawer, setDrawer] = React.useState({ open: false, content: null });

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  function openDrawer(Content) {
    setDrawer({ open: true, content: <Content onClose={onClose} /> });
  }

  function onClose() {
    return setDrawer({ ...drawer, open: false });
  }

  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) onClose();
  }

  return (
    <header ref={ref} className="text-[#D2DAEF] text-sm w-full h-16 grid grid-cols-3 bg-[#212B44] items-center z-20">
      <button onClick={() => openDrawer(NavigationMenu)} className="h-16 w-16 p-3">
        <Hamburger className="text-[#828EAC]" />
      </button>

      <Logo />

      <button onClick={() => openDrawer(UserMenu)} className="flex justify-end pr-4">
        <p className="rounded-full bg-[#344264] text-[#768BAC] w-9 h-9 flex text-center items-center justify-center capitalize">{user?.firstName[0] + user?.lastName[0]}</p>
      </button>

      <MobileDrawer open={drawer.open} onClose={onClose} content={drawer.content} />
    </header>
  );
}

function MobileDrawer({ open, onClose, content }) {
  return (
    <div className={`fixed top-0 w-full z-10 ease-in-out duration-200 ${open ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="bg-[#212B44] h-16 flex justify-end items-center">
        <button onClick={onClose} className="pr-4 pl-6 h-full">
          <Close className="text-[#828EAC]" />
        </button>
      </div>
      {content}
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
