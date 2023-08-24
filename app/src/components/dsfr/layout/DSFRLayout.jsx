import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function DSFRLayout({ children, title = "" }) {
  return (
    <div className="flex flex-col justify-between bg-beige-gris-galet-975">
      <Header title={title} />
      {children}
      <Footer />
    </div>
  );
}
