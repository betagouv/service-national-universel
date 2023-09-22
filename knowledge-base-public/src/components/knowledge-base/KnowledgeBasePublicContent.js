import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Wrapper from "../Wrapper";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicArticle from "./KnowledgeBasePublicArticle";
import React from "react";

const KnowledgeBasePublicContent = ({ item, isLoading }) => {
  const router = useRouter();

  const [loadingType, setType] = useState(router?.query?.loadingType);

  useEffect(() => {
    if (router?.query?.loadingType) {
      setType(router?.query?.loadingType);
      router.replace(`/base-de-connaissance/${router.query.slug}${router?.query?.openTheme ? `?openTheme=${router.query.openTheme}` : ""}`, undefined, { shallow: true });
    }
  }, [router?.query?.loadingType]);

  return (
    <Wrapper>
      <Head>
        <title>{item?.title || "SNU - Base de connaissance"}</title>
      </Head>
      <div className="flex min-h-screen flex-col md:min-h-full">
        {(!item || isLoading) && loadingType ? (
          <>{loadingType === "section" ? <KnowledgeBasePublicSection isLoading /> : <KnowledgeBasePublicArticle isLoading />}</>
        ) : (
          <>
            {item?.type === "article" && <KnowledgeBasePublicArticle item={item} isLoading={isLoading} />}
            {item?.type === "section" && <KnowledgeBasePublicSection item={item} isLoading={isLoading} />}
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicContent;
