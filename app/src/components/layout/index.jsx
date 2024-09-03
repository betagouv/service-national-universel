import React from "react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/footer";
import { removeDsfrStylesheets } from "@/services/stylesheets.service";

export default function ClassicLayout({ children }) {
  removeDsfrStylesheets();

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-10 w-screen  md:right-auto md:w-64">
        <Navbar />
      </div>
      <main className="mt-16 md:mt-0 md:ml-[16rem]">{children}</main>
      <Footer />
    </>
  );
}
