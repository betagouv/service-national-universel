import React from "react";
import LoaderSection from "../LoaderSectionOld";
import LoaderArticle from "../LoaderArticle";

const LoaderHome = () => {
  return (
    <>
      <div className="col-span-full row-span-2 row-start-2 mx-auto grid-cols-2 flex-col flex-wrap justify-center gap-2.5 md:grid md:flex-row md:px-10 lg:flex lg:max-w-screen-95 lg:overflow-hidden lg:px-6">
        <LoaderSection />
        <LoaderSection />
        <LoaderSection />
        <LoaderSection />
      </div>
      <main className="flex h-full flex-shrink flex-col justify-evenly overflow-y-auto sm:px-2 lg:flex-row lg:px-0">
        <section className="flex max-w-4xl shrink-0 flex-grow flex-col pt-12">
          <h3 className="flex items-center text-sm font-bold uppercase text-snu-purple-900 sm:px-4 sm:pb-2 lg:px-16">Sujets</h3>
          <LoaderArticle />
          <LoaderArticle />
          <LoaderArticle />
          <LoaderArticle />
          <LoaderArticle />
          <LoaderArticle />
          <LoaderArticle />
        </section>
      </main>
    </>
  );
};

export default LoaderHome;
