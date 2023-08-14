import Link from "next/link";
import Navigation from "./navigation/Navigation";
import KnowledgeBaseSearch from "./knowledge-base/KnowledgeBaseSearch.js";
import { useState } from "react";

export default function Header({ home }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 bg-[#32257F] p-4 print:hidden">
      <Link href="/" className="flex items-center gap-4">
        <div className="flex-none">
          <img className="h-14 w-14" src="/assets/logo-snu.png" alt="Logo du SNU" />
        </div>

        <p className="hidden text-sm font-medium uppercase leading-tight tracking-wide text-white md:block">
          service
          <br />
          national
          <br />
          universel
        </p>

        <p className="font-bold text-white md:ml-6">Base de connaissance</p>
      </Link>

      <div className="flex items-center gap-4">
        {!home && (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-none items-center gap-4 rounded-md border-none bg-transparent px-2.5 py-2 shadow-none transition-colors hover:bg-black hover:bg-opacity-20"
          >
            <img src="/assets/search.svg" />
          </button>
        )}

        <Navigation />
      </div>

      <KnowledgeBaseSearch open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
