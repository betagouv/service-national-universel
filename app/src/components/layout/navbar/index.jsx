import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useDevice from "../../../hooks/useDeviceWithResize";
import API from "../../../services/api";
import Close from "./assets/Close";
import Hamburger from "./assets/Hamburger";
import Logo from "./components/Logo";
import NavigationMenu from "./components/NavigationMenu";
import UserCard from "./components/UserCard";
import UserMenu from "./components/UserMenu";

export default function Navbar() {
  const device = useDevice();
  const [userTickets, setUserTickets] = useState([]);
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { ok, data } = await API.get(`/zammood/tickets`);
        if (!ok) {
          console.log("API response not OK");
          return setUserTickets([]);
        }
        setUserTickets(data);
      } catch (error) {
        console.log("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  if (device === "mobile") {
    return <MobileNavbar userTickets={userTickets} />;
  }
  return <DesktopNavbar userTickets={userTickets} />;
}

function MobileNavbar({userTickets}) {
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
    setDrawer({ open: true, content: <Content onClose={onClose} userTickets={userTickets} /> });
  }

  function onClose() {
    return setDrawer({ ...drawer, open: false });
  }

  function handleClickOutside(event) {
    if (ref.current && !ref.current.contains(event.target)) onClose();
  }

  return (
    <header ref={ref} className="z-20 grid h-16 w-full grid-cols-3 items-center bg-[#212B44] text-sm text-[#D2DAEF]">
      <button onClick={() => openDrawer(NavigationMenu)} className="h-16 w-16 p-3">
        <Hamburger className="text-[#828EAC]" />
      </button>

      <Logo />

      <button onClick={() => openDrawer(UserMenu)} className="flex justify-end pr-4">
        <p className="flex h-9 w-9 items-center justify-center rounded-full bg-[#344264] text-center capitalize text-[#768BAC]">{user?.firstName[0] + user?.lastName[0]}</p>
      </button>

      <MobileDrawer open={drawer.open} onClose={onClose} content={drawer.content} />
    </header>
  );
}

function MobileDrawer({ open, onClose, content }) {
  return (
    <div className={`fixed top-0 z-10 w-full duration-200 ease-in-out ${open ? "translate-y-0" : "-translate-y-full"}`}>
      <div className="flex h-16 items-center justify-end bg-[#212B44]">
        <button onClick={onClose} className="h-full pr-4 pl-6">
          <Close className="text-[#828EAC]" />
        </button>
      </div>
      {content}
    </div>
  );
}

function DesktopNavbar({ userTickets }) {
  return (
    <header className="z-50 hidden h-screen w-64 flex-col justify-start bg-[#212B44] text-sm text-[#D2DAEF] md:flex">
      <div className="h-24 flex-none border-b-[1px] border-[#2A3655]">
        <Logo />
      </div>

      <div className="flex-grow overflow-auto">
        <NavigationMenu />
      </div>

      <div className="flex-none">
        <UserCard userTickets={userTickets} />
      </div>
    </header>
  );
}
