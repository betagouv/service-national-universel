import Wrapper from "../Wrapper";
import { useMemo } from "react";
import Loader from "react-loader-spinner";
import Breadcrumb from "../BreadCrumb";
import TextEditor from "../TextEditor";
import PublicKBSection from "./PubliKBSection";

export const Article = ({ item }) => {
  return (
    <div className="wrapper bg-coolGray-100  mx-auto flex flex-col flex-grow flex-shrink overflow-hidden w-full">
      <TextEditor readOnly content={item.content} _id={item._id} slug={item.slug} />
    </div>
  );
};

const PublicKBContent = ({ item }) => {
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
        {!item ? (
          <Loader />
        ) : (
          <>
            {item.type === "article" && <Article item={item} />}
            {item.type === "section" && <PublicKBSection item={item} />}
          </>
        )}
      </div>
      <button className="bg-white text-[#4F46E5] my-[70px] text-base shadow-base rounded-md py-3.5 px-5 mx-auto">Je n’ai pas trouvé réponse à ma question</button>
    </Wrapper>
  );
};

export default PublicKBContent;
