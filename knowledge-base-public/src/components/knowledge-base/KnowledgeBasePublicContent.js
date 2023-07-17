import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Wrapper from "../Wrapper";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import KnowledgeBasePublicArticleOld from "./KnowledgeBasePublicArticleOld";
import KnowledgeBasePublicArticlev2 from "./KnowledgeBasePublicArticleV2";
import { environment } from "../../config";

const KnowledgeBasePublicContent = ({ item, isLoading }) => {
  const router = useRouter();

  const [loadingType, setType] = useState(router?.query?.loadingType);

  useEffect(() => {
    if (router?.query?.loadingType) {
      setType(router?.query?.loadingType);
      router.replace(`/base-de-connaissance/${router.query.slug}`, undefined, { shallow: true });
    }
  }, [router?.query?.loadingType]);

  return (
    <Wrapper>
      <Head>
        <title>{item?.title || "SNU - Base de connaissance"}</title>
      </Head>
      <div className="flex min-h-screen flex-col md:min-h-full">
        {(!item || isLoading) && loadingType ? (
          <>{loadingType === "section" ? <KnowledgeBasePublicSection isLoading /> : <KnowledgeBasePublicArticlev2 isLoading />}</>
        ) : (
          <>
            {item?.type === "article" && <KnowledgeBasePublicArticlev2 item={item} isLoading={isLoading} />}
            {item?.type === "section" && <KnowledgeBasePublicSection item={item} isLoading={isLoading} />}
            {/* <KnowledgeBasePublicNoAnswer /> */}
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicContent;
