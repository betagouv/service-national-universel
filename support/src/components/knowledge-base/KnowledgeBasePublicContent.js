import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Wrapper from "../Wrapper";
import Breadcrumb from "../BreadCrumb";
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
      <div className="flex flex-col min-h-screen md:min-h-full">
        <div className="bg-snu-purple-900 print:bg-transparent">
          <div className="h-full wrapper">
            <Breadcrumb parents={item?.parents || []} path="/base-de-connaissance" />
            <div className="py-4">
              {<h5 className="text-snu-purple-100 print:text-black max-w-3xl pb-2 text-base md:text-lg uppercase">{group}</h5>}
              <h1 className="mb-6  print:mb-0 text-4xl font-bold text-white print:text-black md:text-5xl">{item?.title}</h1>
              <h6 className="text-snu-purple-100 text-base md:text-lg lg:text-xl print:text-black">{item?.description}</h6>
            </div>
          </div>
        </div>
        {!item || isLoading ? (
          <>{loadingType === "section" ? <KnowledgeBasePublicSection isLoading /> : <KnowledgeBasePublicArticle isLoading />}</>
        ) : (
          <>
            {item.type === "article" && <KnowledgeBasePublicArticle item={item} isLoading={isLoading} />}
            {item.type === "section" && <KnowledgeBasePublicSection item={item} isLoading={isLoading} />}
            <KnowledgeBasePublicNoAnswer />
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default KnowledgeBasePublicContent;
