import { useState } from "react";
import Link from "next/link";
import { HiSearch, HiOutlineExternalLink } from "react-icons/hi";
import { Popover } from "@headlessui/react";

const Wrapper = ({ children }) => {
  // toggle this state for change the header
  const [isLogin, setLogin] = useState(true);

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header isLogin={isLogin} />
      <main className="flex-1 bg-[#F3F4F6]">{children}</main>
      <Footer />
    </div>
  );
};

const Header = ({ isLogin }) => {
  return (
    <header className="flex-none bg-white">
      <div className="flex flex-wrap items-center gap-4 lg:gap-8 wrapper">
        <div className="flex-none w-auto lg:w-1/6">
          <Link href="/">
            <img className="cursor-pointer w-9 h-9" src="/assets/logo-snu.png" alt="" />
          </Link>
        </div>
        <div className="order-3 w-full md:order-2 md:flex-1 md:w-1/2">
          <div className="relative flex items-center w-full">
            <input
              className="pl-10 py-2.5 w-full pr-3 text-gray-500 transition-colors focus:outline-none text-sm border rounded-md border-gray-300 focus:border-gray-400"
              type="text"
              placeholder="Comment pouvons-nous vous aider ?"
            />
            <HiSearch className="absolute text-xl text-gray-400 left-3" />
          </div>
        </div>
        {isLogin ? (
          <Popover className="relative flex justify-end flex-1 order-2 w-auto md:flex-none lg:w-1/3">
            <Popover.Button className="flex items-start justify-center gap-3 p-0 text-left bg-white rounded-none shadow-none">
              <div className="rounded-full h-9 w-9 bg-snu-purple-300"></div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">Baptiste</span>
                <span className="text-xs font-medium text-gray-500">Modérateur</span>
              </div>
            </Popover.Button>

            <Popover.Panel className="absolute right-0 min-w-[208px] lg:min-w-0 z-10 top-10">
              <div className="flex flex-col gap-4 px-4 py-3 bg-white border border-gray-300 rounded-md">
                <a href="/analytics" className="text-sm font-medium text-gray-700">
                  Analytics
                </a>
                <a href="/analytics" className="text-sm font-medium text-gray-700">
                  Console d’administration
                </a>
                <a href="/analytics" className="text-sm font-medium text-gray-700">
                  Inviter un membre
                </a>
              </div>
            </Popover.Panel>
          </Popover>
        ) : (
          <div className="flex items-center justify-end flex-1 order-2 w-auto gap-3 md:flex-none md:order-3 md:gap-5 lg:w-1/3 lg:gap-10">
            <Link href="/admin">
              <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace admin</span>
            </Link>
            <Link href="/admin">
              <span className="text-sm font-medium text-gray-500 transition-colors cursor-pointer hover:text-gray-600">Espace volontaire</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="flex flex-col gap-6 wrapper bg-white">
      <div className="flex flex-col gap-6 wrapper">
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Link href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer">Plan du site</span>
          </Link>
          <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
          <Link href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer">Accessibilité</span>
          </Link>
          <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
          <Link href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer">Mentions légales</span>
          </Link>
          <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
          <Link href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer">Données personnelles</span>
          </Link>
          <span className="text-[#E5E5E5] text-base hidden md:block">|</span>
          <Link href="#">
            <span className="text-[#6A6A6A] text-xs cursor-pointer">Gestion des cookies</span>
          </Link>
        </div>
        <span className="text-[#6A6A6A] text-xs flex flex-col md:flex-row items-center gap-1">
          Sauf mention contraire, tous les textes de ce site sont sous
          <a className="flex items-center gap-0.5" href="#">
            <span className="underline cursor-pointer">licence etatlab-2.0</span>
            <HiOutlineExternalLink className="text-[#666666] text-base" />
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Wrapper;
