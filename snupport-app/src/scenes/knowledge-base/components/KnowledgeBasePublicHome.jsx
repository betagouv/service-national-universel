import React, { useEffect, useState } from "react";
import Wrapper from "./Wrapper";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import LoaderSection from "./LoaderSection";
import LoaderArticle from "./LoaderArticle";

const KnowledgeBasePublicHome = ({ item, isLoading = false }) => {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    setShowLoading(isLoading);
  }, [isLoading]);

  return (
    <Wrapper>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="col-span-full row-span-2 row-start-1 bg-cover bg-center" style={{ backgroundImage: `url('/assets/hero.png')` }}>
          <div className="h-full bg-snu-purple-900 bg-opacity-95">
            <div className="max-w-screen-95 mr-auto ml-auto px-8 pt-24 pb-[276px]">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="max-w-3xl text-base text-snu-purple-100 md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses à vos questions et les tutoriels d&apos;utilisation de la plateforme.
              </h6>
            </div>
          </div>
        </div>
        {showLoading ? (
          <>
            <div className="lg:max-w-screen-95 col-span-full row-span-2 row-start-2 mx-auto grid-cols-2 flex-col flex-wrap justify-center gap-2.5 md:grid md:flex-row md:px-10 lg:flex lg:overflow-hidden lg:px-6">
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
        ) : (
          <>
            <KnowledgeBasePublicSection isRoot item={item} />
            <KnowledgeBasePublicNoAnswer />
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicHome;
