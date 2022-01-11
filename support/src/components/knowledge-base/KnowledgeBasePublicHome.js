import Wrapper from "../../components/Wrapper";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import { useEffect, useState } from "react";
import Head from "next/head";
import LoaderSection from "../LoaderSection";
import LoaderArticle from "../LoaderArticle";

const KnowledgeBasePublicHome = ({ item, isLoading = false }) => {
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    setShowLoading(isLoading);
  }, [isLoading]);

  return (
    <Wrapper>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="row-span-2 row-start-1 bg-center bg-cover col-span-full" style={{ backgroundImage: `url('/assets/hero.png')` }}>
          <div className="bg-snu-purple-900 bg-opacity-95 h-full">
            <div className="pt-24 pb-[276px] mr-auto ml-auto px-8 max-w-screen-95">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="text-snu-purple-100 max-w-3xl text-base md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses à vos questions et les tutoriels d&apos;utilisation de la plateforme.
              </h6>
            </div>
          </div>
        </div>
        {showLoading ? (
          <>
            <div className="md:px-10 lg:px-6 lg:flex flex-col flex-wrap justify-center lg:overflow-hidden lg:max-w-screen-95 mx-auto grid-cols-2 md:grid md:flex-row row-span-2 row-start-2 col-span-full gap-2.5">
              <LoaderSection />
              <LoaderSection />
              <LoaderSection />
              <LoaderSection />
            </div>
            <main className="flex flex-col sm:px-2 lg:flex-row lg:px-0 justify-evenly h-full w-fullmax-w-screen-2xl flex-shrink overflow-y-auto">
              <section className="flex flex-col flex-grow flex-shrink-0 pt-12 max-w-4xl">
                <h3 className="sm:px-4 sm:pb-2 lg:px-16 flex items-center font-bold uppercase text-sm text-snu-purple-900">Sujets</h3>
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
