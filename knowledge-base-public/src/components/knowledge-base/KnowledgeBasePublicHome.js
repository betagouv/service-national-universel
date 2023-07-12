import Head from "next/head";
import Wrapper from "../Wrapper";
import LoaderHomeOld from "./LoaderHomeOld";
import LoaderHome from "./LoaderHome";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicSectionOld from "./KnowledgeBasePublicSectionOld";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import React, { useState, useEffect } from "react";
import { environment } from "../../config";
import useDevice from "../../hooks/useDevice";

const KnowledgeBasePublicHome = ({ item, isLoading = false }) => {
  const { device } = useDevice();
  // @todo state and useEffect to be deleted : only used for testing purposes
  const [showLoading, setShowLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setShowLoading(isLoading);
    }, 0);
  }, [isLoading]);

  return (
    <Wrapper>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="grid grid-cols-1 grid-rows-[auto,180px,auto]">
        <div className="col-span-full row-span-2 row-start-1 bg-cover bg-center" style={{ backgroundImage: `url('/assets/hero.png')` }}>
          <div className="h-full bg-snu-purple-900 bg-opacity-95">
            <div className="ml-auto mr-auto max-w-screen-95 px-8 pb-[276px] pt-24">
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">Base de connaissance</h1>
              <h6 className="max-w-3xl text-base text-snu-purple-100 md:text-lg lg:text-xl">
                Retrouvez ici toutes les réponses à vos questions et les tutoriels d&apos;utilisation de la plateforme.
              </h6>
            </div>
          </div>
        </div>
        {(showLoading || !device) && (environment === "production" ? <LoaderHomeOld /> : <LoaderHome />)}
        {!showLoading && (
          <>
            {environment === "production" ? (
              <KnowledgeBasePublicSectionOld isRoot item={item} isLoading={showLoading} />
            ) : (
              <KnowledgeBasePublicSection isRoot item={item} device={device} isLoading={showLoading} />
            )}
            <KnowledgeBasePublicNoAnswer />
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicHome;
