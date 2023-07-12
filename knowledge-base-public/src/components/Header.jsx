import Link from "next/link";
import Navigation from "./navigation/Navigation";
import KnowledgeBaseSearch from "./knowledge-base/KnowledgeBaseSearch.js";
import { useEffect, useState } from "react";
import SearchShortcut from "./SearchShortcut";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.addEventListener("keydown", function (event) {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        setSearchOpen(!searchOpen);
      }
    });
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b-2 border-white border-opacity-20 bg-[#32257F] p-4 print:hidden">
      <div className="flex items-center gap-4">
        <div className="flex-none">
          <Link href="/">
            <img className="h-14 w-14" src="/assets/logo-snu.png" alt="Logo du SNU" />
          </Link>
        </div>

        <p className="hidden text-sm font-medium uppercase leading-tight tracking-wide text-white lg:block">
          service
          <br />
          national
          <br />
          universel
        </p>

        <p className="font-medium text-white md:ml-6">Base de connaissance</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-3 rounded-md border-none bg-transparent px-2.5 py-2 shadow-none transition-colors hover:bg-black hover:bg-opacity-20"
        >
          <SearchShortcut />
          <img src="/assets/search.svg" />
        </button>

        <Navigation />
      </div>

      <KnowledgeBaseSearch open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
