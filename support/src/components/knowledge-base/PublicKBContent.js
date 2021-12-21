import Wrapper from "../Wrapper";
import { useMemo } from "react";
import Loader from "react-loader-spinner";
import Breadcrumb from "../BreadCrumb";
import PublicKBSection from "./PublicKBSection";
import PublicKBNoAnswer from "./PublicKBNoAnswer";
import PublicKBArticle from "./PublicKBArticle";

const PublicKBContent = ({ item, isLoading }) => {
  const group = useMemo(() => {
    return item?.group || item?.parents?.[0].group;
  }, [item]);

  return (
    <Wrapper>
      <div className="flex flex-col">
        <div className="bg-snu-purple-900 ">
          <div className="h-full wrapper">
            <Breadcrumb parents={item?.parents || []} path="/base-de-connaissance" />
            <div className="py-4">
              {<h5 className="text-snu-purple-100 max-w-3xl pb-2 text-base md:text-lg uppercase">{group}</h5>}
              <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl">{item?.title}</h1>
              <h6 className="text-snu-purple-100 text-base md:text-lg lg:text-xl">{item?.description}</h6>
            </div>
          </div>
        </div>
        {!item || isLoading ? (
          <Loader />
        ) : (
          <>
            {item.type === "article" && <PublicKBArticle item={item} />}
            {item.type === "section" && <PublicKBSection item={item} />}
          </>
        )}
      </div>
      <PublicKBNoAnswer />
    </Wrapper>
  );
};

export default PublicKBContent;
