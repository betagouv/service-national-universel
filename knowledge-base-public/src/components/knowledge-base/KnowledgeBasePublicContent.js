import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Wrapper from "../Wrapper";
import Breadcrumbs from "../breadcrumbs";
import KnowledgeBasePublicSection from "./KnowledgeBasePublicSection";
import KnowledgeBasePublicNoAnswer from "./KnowledgeBasePublicNoAnswer";
import KnowledgeBasePublicArticle from "./KnowledgeBasePublicArticle";

const KnowledgeBasePublicContent = ({ item, isLoading }) => {
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0]?.group;
  }, [item]);
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
        <div className="wrapper h-full">
          <Breadcrumbs parents={item?.parents || []} path="/base-de-connaissance" />
          <div className="py-4">
            {<h5 className="max-w-3xl pb-2 text-base uppercase text-snu-purple-100 md:text-lg print:text-black">{group}</h5>}
            <h1 className="mb-6 text-4xl font-bold md:text-5xl print:mb-0 print:text-black">{item?.title}</h1>
            <h6 className="text-base text-snu-purple-100 md:text-lg lg:text-xl print:text-black">{item?.description}</h6>
          </div>
        </div>
        {(!item || isLoading) && loadingType ? (
          <>{loadingType === "section" ? <KnowledgeBasePublicSection isLoading /> : <KnowledgeBasePublicArticle isLoading />}</>
        ) : (
          <>
            {item?.type === "article" && <KnowledgeBasePublicArticle item={item} isLoading={isLoading} />}
            {item?.type === "section" && <KnowledgeBasePublicSection item={item} isLoading={isLoading} />}
            <KnowledgeBasePublicNoAnswer />
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicContent;
