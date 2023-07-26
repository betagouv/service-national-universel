import Head from "next/head";
import Wrapper from "../Wrapper";
import LoaderHome from "./LoaderHome";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import { useState, useEffect } from "react";
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
    <Wrapper home>
      <Head>
        <title>SNU - Base de connaissance</title>
      </Head>
      <div className="grid-rows-auto grid grid-cols-1">
        {(showLoading || !device) && <LoaderHome />}
        {!showLoading && <KnowledgeBasePublicSection isRoot item={item} device={device} isLoading={showLoading} />}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicHome;
