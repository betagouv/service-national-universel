import Head from "next/head";
import Wrapper from "../Wrapper";
import LoaderHomeOld from "./LoaderHomeOld";
import LoaderHome from "./LoaderHome";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicSectionOld from "./KnowledgeBasePublicSectionOld";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import { useState, useEffect } from "react";
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
      <div className="grid grid-cols-1 grid-rows-auto">
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
